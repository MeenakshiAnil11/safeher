import Contact from "../models/Contact.js";
import Alert from "../models/Alert.js";
import DangerZone from "../models/DangerZone.js";
import GeoFenceEvent from "../models/GeoFenceEvent.js";
import SafeZone from "../models/SafeZone.js";
import SafetyPlace from "../models/SafetyPlace.js";
import SafetyAuditReport from "../models/SafetyAuditReport.js";
import User from "../models/User.js";
import UserLocationLog from "../models/UserLocationLog.js";
import { evaluateDangerPrediction } from "../services/dangerPredictionService.js";
import {
  ACTIVITY_EVENTS,
  createActivityLog,
  getLatestActivityByTypes,
} from "../services/activityLogService.js";
import { sendEmail } from "../config/mailer.js";
import { sendSMS } from "../config/sms.js";

const NOTIFICATION_COOLDOWN_MS = 5 * 60 * 1000;
const ALERT_COOLDOWN_MS = 10 * 60 * 1000;
const STATIONARY_WINDOW_MS = 30 * 60 * 1000;
const STATIONARY_MAX_DRIFT_METERS = 50;
const inMemoryDangerNotifyCache = new Map();

const toRad = (value) => (value * Math.PI) / 180;

const haversineMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const isInsidePolygon = (lat, lng, polygon = []) => {
  if (!Array.isArray(polygon) || polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    const intersect =
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / ((yj - yi) || Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const isInsideDangerZone = (dangerZone, lat, lng) => {
  if (dangerZone.zoneType === "polygon" && dangerZone.polygon?.length >= 3) {
    return isInsidePolygon(lat, lng, dangerZone.polygon);
  }
  if (!dangerZone.center) return false;
  const distance = haversineMeters(lat, lng, dangerZone.center.lat, dangerZone.center.lng);
  return distance <= (dangerZone.radius || 0);
};

const shouldNotifyDangerZone = (userId, zoneId) => {
  const key = `${userId}:${zoneId}`;
  const now = Date.now();
  const last = inMemoryDangerNotifyCache.get(key) || 0;
  if (now - last < NOTIFICATION_COOLDOWN_MS) {
    return false;
  }
  inMemoryDangerNotifyCache.set(key, now);
  return true;
};

const createAlertIfNeeded = async ({
  userId,
  type,
  message,
  severity,
  location,
  cooldownMs = ALERT_COOLDOWN_MS,
}) => {
  const since = new Date(Date.now() - cooldownMs);
  const existing = await Alert.findOne({
    userId,
    type,
    resolved: false,
    timestamp: { $gte: since },
  })
    .select("_id")
    .lean();
  if (existing) return null;

  return Alert.create({
    userId,
    type,
    message,
    severity,
    location,
    timestamp: new Date(),
    resolved: false,
  });
};

const triggerSmartSafetyAlerts = async ({ userId, lat, lng, accuracy, source }) => {
  if (source !== "tracking") return;

  const location = { lat, lng };

  // 1) Safe zone exit alert
  const safeZones = await SafeZone.find({ user: userId, isActive: true })
    .select("latitude longitude radius")
    .lean();
  if (safeZones.length > 0) {
    const insideAnySafeZone = safeZones.some((zone) => {
      const distance = haversineMeters(lat, lng, zone.latitude, zone.longitude);
      return distance <= Number(zone.radius || 0);
    });
    if (!insideAnySafeZone) {
      await createAlertIfNeeded({
        userId,
        type: "SAFE_ZONE_EXIT",
        message: "You left your safe zone.",
        severity: "danger",
        location,
      });
    }
  }

  // 2) Stationary detection for > 30 min
  const stationaryLogs = await UserLocationLog.find({
    user: userId,
    source: "tracking",
    recordedAt: { $gte: new Date(Date.now() - STATIONARY_WINDOW_MS) },
  })
    .select("coords recordedAt")
    .sort({ recordedAt: 1 })
    .lean();

  if (stationaryLogs.length >= 2) {
    const first = stationaryLogs[0];
    const last = stationaryLogs[stationaryLogs.length - 1];
    const elapsed = new Date(last.recordedAt).getTime() - new Date(first.recordedAt).getTime();
    const maxDrift = stationaryLogs.reduce((max, item) => {
      const drift = haversineMeters(first.coords.lat, first.coords.lng, item.coords.lat, item.coords.lng);
      return Math.max(max, drift);
    }, 0);

    if (elapsed >= STATIONARY_WINDOW_MS && maxDrift <= STATIONARY_MAX_DRIFT_METERS) {
      await createAlertIfNeeded({
        userId,
        type: "STATIONARY_30_MIN",
        message: "You have been stationary for 30 minutes.",
        severity: "warning",
        location,
        cooldownMs: 20 * 60 * 1000,
      });
    }
  }

  // 3) Low GPS accuracy
  if (Number.isFinite(Number(accuracy)) && Number(accuracy) > 100) {
    await createAlertIfNeeded({
      userId,
      type: "LOW_GPS_ACCURACY",
      message: "Low GPS signal detected.",
      severity: "warning",
      location,
    });
  }
};

const distancePointToSegmentMeters = (point, a, b) => {
  const px = point.lat;
  const py = point.lng;
  const ax = a.lat;
  const ay = a.lng;
  const bx = b.lat;
  const by = b.lng;
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) return haversineMeters(px, py, ax, ay);

  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  const closest = { lat: ax + t * dx, lng: ay + t * dy };
  return haversineMeters(px, py, closest.lat, closest.lng);
};

const routeDistanceMeters = (points = []) => {
  if (points.length < 2) return 0;
  let distance = 0;
  for (let i = 1; i < points.length; i += 1) {
    distance += haversineMeters(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
  }
  return distance;
};

const notifyTrustedContactsOnDanger = async ({ userId, location, zones }) => {
  const [user, contacts] = await Promise.all([
    User.findById(userId).select("name email phone").lean(),
    Contact.find({ user: userId }).lean(),
  ]);

  if (!contacts.length) return { email: 0, sms: 0 };

  const zoneNames = zones.map((z) => z.name).join(", ");
  const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
  const subject = "SafeHer Alert: User entered flagged area";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>⚠️ Geofence Danger Alert</h2>
      <p><strong>${user?.name || "A SafeHer user"}</strong> entered a flagged area.</p>
      <p><strong>Danger zones:</strong> ${zoneNames}</p>
      <p><strong>Location:</strong> ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
      <p><a href="${mapsUrl}" target="_blank" rel="noreferrer">Open in Google Maps</a></p>
      <p>Triggered automatically because SOS mode is active.</p>
    </div>
  `;
  const sms = `SafeHer Alert: ${user?.name || "User"} entered flagged area (${zoneNames}). Location: ${mapsUrl}`;

  const emailRecipients = contacts.map((c) => c.email).filter(Boolean);
  const smsRecipients = contacts.map((c) => c.number).filter(Boolean);

  await Promise.all(
    emailRecipients.map((to) =>
      sendEmail({ to, subject, html }).catch((error) => {
        console.error("Danger alert email failed:", to, error?.message || error);
      })
    )
  );

  await Promise.all(
    smsRecipients.map((to) =>
      sendSMS({ to, body: sms }).catch((error) => {
        console.error("Danger alert SMS failed:", to, error?.message || error);
      })
    )
  );

  return { email: emailRecipients.length, sms: smsRecipients.length };
};

export const saveLiveLocation = async (req, res) => {
  try {
    const { lat, lng, accuracy, speed, heading, source } = req.body || {};
    if (lat == null || lng == null) {
      return res.status(400).json({ message: "lat and lng are required" });
    }
    const userId = req.userId || req.user?.id;
    const dangerPrediction = await evaluateDangerPrediction({
      userId,
      lat: Number(lat),
      lng: Number(lng),
      accuracy: Number(accuracy),
      timestamp: new Date(),
    });

    const log = await UserLocationLog.create({
      user: userId,
      coords: { lat, lng },
      accuracy,
      speed,
      heading,
      source: source || "tracking",
      riskScore: dangerPrediction.riskScore,
      riskLevel: dangerPrediction.riskLevel,
      riskRecommendation: dangerPrediction.recommendation,
      riskFactors: dangerPrediction.factors,
      recordedAt: new Date(),
    });
    await triggerSmartSafetyAlerts({
      userId,
      lat: Number(lat),
      lng: Number(lng),
      accuracy: Number(accuracy),
      source: source || "tracking",
    });

    const safeZones = await SafeZone.find({ user: userId, isActive: true })
      .select("latitude longitude radius")
      .lean();
    const isInsideAnySafeZone = safeZones.some((zone) => {
      const distance = haversineMeters(Number(lat), Number(lng), zone.latitude, zone.longitude);
      return distance <= Number(zone.radius || 0);
    });
    const latestSafeZoneEvent = await getLatestActivityByTypes(userId, [
      ACTIVITY_EVENTS.ENTERED_SAFE_ZONE,
      ACTIVITY_EVENTS.EXITED_SAFE_ZONE,
    ]);

    if (
      isInsideAnySafeZone &&
      latestSafeZoneEvent?.eventType !== ACTIVITY_EVENTS.ENTERED_SAFE_ZONE
    ) {
      await createActivityLog({
        userId,
        eventType: ACTIVITY_EVENTS.ENTERED_SAFE_ZONE,
        description: "Entered safe zone",
        location: { lat, lng },
      });
    }

    if (
      !isInsideAnySafeZone &&
      latestSafeZoneEvent &&
      latestSafeZoneEvent.eventType !== ACTIVITY_EVENTS.EXITED_SAFE_ZONE
    ) {
      await createActivityLog({
        userId,
        eventType: ACTIVITY_EVENTS.EXITED_SAFE_ZONE,
        description: "Exited safe zone",
        location: { lat, lng },
      });
    }

    res.status(201).json({
      ok: true,
      logId: log._id,
      riskPrediction: {
        riskScore: dangerPrediction.riskScore,
        riskLevel: dangerPrediction.riskLevel,
        recommendation: dangerPrediction.recommendation,
      },
    });
  } catch (error) {
    console.error("saveLiveLocation error:", error);
    res.status(500).json({ message: "Failed to save live location" });
  }
};

export const getDangerZones = async (req, res) => {
  try {
    const zones = await DangerZone.find({ isActive: true }).sort({ updatedAt: -1 }).lean();
    res.json({ zones });
  } catch (error) {
    console.error("getDangerZones error:", error);
    res.status(500).json({ message: "Failed to load danger zones" });
  }
};

export const getNearbySafetyPlaces = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusMeters = Math.min(Number(req.query.radiusMeters) || 5000, 20000);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: "lat and lng query params are required" });
    }

    const places = await SafetyPlace.find({
      active: true,
      category: { $in: ["police", "hospital", "cafe"] },
    })
      .limit(500)
      .lean();

    const normalized = places
      .map((place) => {
        const placeLat = place.coordinates?.lat;
        const placeLng = place.coordinates?.lng;
        if (!Number.isFinite(placeLat) || !Number.isFinite(placeLng)) return null;
        const distanceMeters = haversineMeters(lat, lng, placeLat, placeLng);
        return {
          id: place._id,
          title: place.name,
          address: place.address || "",
          phone: place.phone || "",
          category: place.category,
          lat: placeLat,
          lng: placeLng,
          distanceMeters: Math.round(distanceMeters),
          isSafeCafe: Boolean(place.isSafeCafe),
        };
      })
      .filter(Boolean)
      .filter((place) => place.distanceMeters <= radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    const mapCategory = (category) => {
      if (category === "hospital") return "hospitals";
      if (category === "cafe") return "cafes";
      return "police";
    };

    const grouped = { police: [], hospitals: [], cafes: [] };
    normalized.forEach((item) => {
      grouped[mapCategory(item.category)].push(item);
    });

    if (normalized.length > 0) {
      return res.json({ source: "database", radiusMeters, ...grouped });
    }

    // Fallback: lightweight deterministic nearby markers when DB has no geo entries.
    const fallbackOffset = [
      { dLat: 0.0024, dLng: -0.0015 },
      { dLat: -0.0019, dLng: 0.0021 },
      { dLat: 0.0012, dLng: 0.0026 },
      { dLat: -0.0026, dLng: -0.0012 },
      { dLat: 0.0018, dLng: -0.0022 },
      { dLat: -0.0014, dLng: 0.0018 },
    ];
    const makePlace = (idx, title, category, isSafeCafe = false) => ({
      id: `fallback-${category}-${idx}`,
      title,
      category,
      address: "Nearby support point",
      phone: "",
      lat: lat + fallbackOffset[idx].dLat,
      lng: lng + fallbackOffset[idx].dLng,
      distanceMeters: Math.round(
        haversineMeters(lat, lng, lat + fallbackOffset[idx].dLat, lng + fallbackOffset[idx].dLng)
      ),
      isSafeCafe,
    });

    return res.json({
      source: "fallback",
      radiusMeters,
      police: [
        makePlace(0, "Police Station - North", "police"),
        makePlace(1, "Police Station - Central", "police"),
      ],
      hospitals: [
        makePlace(2, "City Hospital", "hospital"),
        makePlace(3, "Emergency Care Hospital", "hospital"),
      ],
      cafes: [
        makePlace(4, "Safe Cafe - Green Cup", "cafe", true),
        makePlace(5, "Safe Cafe - Corner Brew", "cafe", true),
      ],
    });
  } catch (error) {
    console.error("getNearbySafetyPlaces error:", error);
    res.status(500).json({ message: "Failed to load nearby safety places" });
  }
};

export const adminGetDangerZones = async (req, res) => {
  try {
    const zones = await DangerZone.find({}).sort({ updatedAt: -1 }).lean();
    res.json({ zones });
  } catch (error) {
    console.error("adminGetDangerZones error:", error);
    res.status(500).json({ message: "Failed to load danger zones" });
  }
};

export const adminGetSafetyAuditReports = async (req, res) => {
  try {
    const reports = await SafetyAuditReport.find({})
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ reports });
  } catch (error) {
    console.error("adminGetSafetyAuditReports error:", error);
    res.status(500).json({ message: "Failed to load safety audit reports" });
  }
};

export const adminCreateSafetyAuditReport = async (req, res) => {
  try {
    const {
      title = "Community safety audit",
      latitude,
      longitude,
      radiusMeters = 600,
      safetyRating,
      source = "community",
      isActive = true,
    } = req.body || {};

    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      return res.status(400).json({ message: "Valid latitude and longitude are required" });
    }
    if (!Number.isFinite(Number(safetyRating))) {
      return res.status(400).json({ message: "safetyRating is required (0-100)" });
    }

    const normalizedRating = Math.max(0, Math.min(100, Number(safetyRating)));
    const report = await SafetyAuditReport.create({
      title,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusMeters: Number(radiusMeters) || 600,
      safetyRating: normalizedRating,
      source,
      isActive: Boolean(isActive),
    });

    res.status(201).json({ report });
  } catch (error) {
    console.error("adminCreateSafetyAuditReport error:", error);
    res.status(500).json({ message: "Failed to create safety audit report" });
  }
};

export const adminUpdateSafetyAuditReport = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.safetyRating != null) {
      payload.safetyRating = Math.max(0, Math.min(100, Number(payload.safetyRating)));
    }
    if (payload.latitude != null) payload.latitude = Number(payload.latitude);
    if (payload.longitude != null) payload.longitude = Number(payload.longitude);
    if (payload.radiusMeters != null) payload.radiusMeters = Number(payload.radiusMeters);

    const report = await SafetyAuditReport.findByIdAndUpdate(id, payload, { new: true });
    if (!report) return res.status(404).json({ message: "Safety audit report not found" });
    res.json({ report });
  } catch (error) {
    console.error("adminUpdateSafetyAuditReport error:", error);
    res.status(500).json({ message: "Failed to update safety audit report" });
  }
};

export const adminDeleteSafetyAuditReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await SafetyAuditReport.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Safety audit report not found" });
    res.json({ message: "Safety audit report deactivated", report });
  } catch (error) {
    console.error("adminDeleteSafetyAuditReport error:", error);
    res.status(500).json({ message: "Failed to delete safety audit report" });
  }
};

export const adminCreateDangerZone = async (req, res) => {
  try {
    const {
      name,
      description,
      zoneType = "circle",
      center,
      radius = 500,
      polygon = [],
      severity = "medium",
      source = "admin",
    } = req.body || {};
    if (!name) return res.status(400).json({ message: "name is required" });
    if (zoneType === "circle" && (!center || center.lat == null || center.lng == null)) {
      return res.status(400).json({ message: "center is required for circle zones" });
    }
    if (zoneType === "polygon" && (!Array.isArray(polygon) || polygon.length < 3)) {
      return res.status(400).json({ message: "polygon must have at least 3 points" });
    }

    const zone = await DangerZone.create({
      name,
      description,
      zoneType,
      center,
      radius,
      polygon,
      severity,
      source,
      createdBy: req.user.id,
    });
    res.status(201).json({ zone });
  } catch (error) {
    console.error("adminCreateDangerZone error:", error);
    res.status(500).json({ message: "Failed to create danger zone" });
  }
};

export const adminUpdateDangerZone = async (req, res) => {
  try {
    const zone = await DangerZone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!zone) return res.status(404).json({ message: "Danger zone not found" });
    res.json({ zone });
  } catch (error) {
    console.error("adminUpdateDangerZone error:", error);
    res.status(500).json({ message: "Failed to update danger zone" });
  }
};

export const adminDeleteDangerZone = async (req, res) => {
  try {
    const zone = await DangerZone.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!zone) return res.status(404).json({ message: "Danger zone not found" });
    res.json({ message: "Danger zone removed" });
  } catch (error) {
    console.error("adminDeleteDangerZone error:", error);
    res.status(500).json({ message: "Failed to remove danger zone" });
  }
};

export const checkGeoFenceStatus = async (req, res) => {
  try {
    const { lat, lng, sosModeActive = false } = req.body || {};
    if (lat == null || lng == null) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const userId = req.user.id;
    const [safeZones, dangerZones] = await Promise.all([
      SafeZone.find({ user: userId, isActive: true }).lean(),
      DangerZone.find({ isActive: true }).lean(),
    ]);

    const insideSafeZones = safeZones.filter((zone) => {
      const distance = haversineMeters(lat, lng, zone.latitude, zone.longitude);
      return distance <= zone.radius;
    });

    const insideDangerZones = dangerZones.filter((zone) => isInsideDangerZone(zone, lat, lng));

    await Promise.all(
      insideDangerZones.map(async (zone) => {
        if (!shouldNotifyDangerZone(userId, zone._id.toString())) return;
        await GeoFenceEvent.create({
          user: userId,
          dangerZone: zone._id,
          eventType: "entered_danger_zone",
          location: { lat, lng },
          metadata: { severity: zone.severity, source: zone.source },
        });
      })
    );

    let notifyResult = null;
    if (sosModeActive && insideDangerZones.length > 0) {
      notifyResult = await notifyTrustedContactsOnDanger({
        userId,
        location: { lat, lng },
        zones: insideDangerZones,
      });
    }

    res.json({
      insideSafeZones: insideSafeZones.map((zone) => ({
        _id: zone._id,
        name: zone.name,
        radius: zone.radius,
        latitude: zone.latitude,
        longitude: zone.longitude,
      })),
      insideDangerZones: insideDangerZones.map((zone) => ({
        _id: zone._id,
        name: zone.name,
        severity: zone.severity,
        zoneType: zone.zoneType,
      })),
      alert:
        insideDangerZones.length > 0
          ? "⚠️ You’ve entered a flagged area"
          : insideSafeZones.length > 0
          ? "✅ You are inside a safe zone"
          : "",
      notifiedContacts: notifyResult,
    });
  } catch (error) {
    console.error("checkGeoFenceStatus error:", error);
    res.status(500).json({ message: "Failed to evaluate geofence status" });
  }
};

export const getSafeRouteOptions = async (req, res) => {
  try {
    const { start, end } = req.body || {};
    if (!start || !end || start.lat == null || start.lng == null || end.lat == null || end.lng == null) {
      return res.status(400).json({ message: "start and end coordinates are required" });
    }

    const dangerZones = await DangerZone.find({ isActive: true }).lean();
    const fastestPath = [start, end];

    const intersectingZones = dangerZones.filter((zone) => {
      if (zone.zoneType !== "circle" || !zone.center) return false;
      const distance = distancePointToSegmentMeters(zone.center, start, end);
      return distance <= (zone.radius || 0) + 120;
    });

    let safePath = [...fastestPath];
    if (intersectingZones.length > 0) {
      const riskZone = intersectingZones[0];
      const dx = end.lng - start.lng;
      const dy = end.lat - start.lat;
      const length = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / length;
      const ny = dx / length;
      const bufferDeg = ((riskZone.radius || 500) + 250) / 111320;
      const waypoint = {
        lat: riskZone.center.lat + ny * bufferDeg,
        lng: riskZone.center.lng + nx * bufferDeg,
      };
      safePath = [start, waypoint, end];
    }

    const fastestDistance = routeDistanceMeters(fastestPath);
    const safeDistance = routeDistanceMeters(safePath);
    const toMinutes = (meters) => Math.max(1, Math.round((meters / 1000 / 35) * 60));

    res.json({
      unsafeZonesOnFastest: intersectingZones.map((z) => ({
        _id: z._id,
        name: z.name,
        severity: z.severity,
      })),
      routes: [
        {
          type: "fastest",
          title: "Fastest Route",
          distanceMeters: Math.round(fastestDistance),
          etaMinutes: toMinutes(fastestDistance),
          path: fastestPath,
          riskLevel: intersectingZones.length > 0 ? "medium" : "low",
        },
        {
          type: "safe",
          title: "Safe Route",
          distanceMeters: Math.round(safeDistance),
          etaMinutes: toMinutes(safeDistance),
          path: safePath,
          riskLevel: intersectingZones.length > 0 ? "low" : "low",
        },
      ],
    });
  } catch (error) {
    console.error("getSafeRouteOptions error:", error);
    res.status(500).json({ message: "Failed to generate safe route options" });
  }
};

export const adminUnsafeZoneAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const topZones = await GeoFenceEvent.aggregate([
      {
        $match: {
          eventType: "entered_danger_zone",
          createdAt: { $gte: weekAgo, $lte: now },
          dangerZone: { $exists: true, $ne: null },
        },
      },
      { $group: { _id: "$dangerZone", incidents: { $sum: 1 } } },
      { $sort: { incidents: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "dangerzones",
          localField: "_id",
          foreignField: "_id",
          as: "zone",
        },
      },
      { $unwind: { path: "$zone", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          incidents: 1,
          name: "$zone.name",
          severity: "$zone.severity",
        },
      },
    ]);

    const heatmapPoints = await GeoFenceEvent.find({
      eventType: "entered_danger_zone",
      createdAt: { $gte: weekAgo, $lte: now },
    })
      .select("location createdAt")
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();

    res.json({
      topUnsafeZones: topZones,
      heatmapPoints: heatmapPoints.map((p) => ({
        lat: p.location?.lat,
        lng: p.location?.lng,
        weight: 1,
        timestamp: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("adminUnsafeZoneAnalytics error:", error);
    res.status(500).json({ message: "Failed to load unsafe zone analytics" });
  }
};
