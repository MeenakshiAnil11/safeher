import SafeZone from "../models/SafeZone.js";
import SafetyAuditReport from "../models/SafetyAuditReport.js";

const NIGHT_START_HOUR = 21;
const NIGHT_END_HOUR = 5;
const SAFE_ZONE_DISTANCE_THRESHOLD_METERS = 500;
const LOW_GPS_ACCURACY_THRESHOLD = 80;

const toRad = (value) => (value * Math.PI) / 180;

const haversineMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const isNightTime = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : new Date();
  const hour = date.getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
};

const getRiskLevel = (score) => {
  if (score <= 40) return "Safe";
  if (score <= 70) return "Moderate";
  return "High Risk";
};

const getRecommendation = ({ level, factors }) => {
  if (level === "High Risk") {
    return "High Risk: Move toward a verified safe zone, enable SOS, and share live tracking with trusted contacts.";
  }
  if (level === "Moderate") {
    if (factors.nightTime) {
      return "Moderate Risk: You are in a low visibility area. Consider moving to a safer location.";
    }
    if (factors.farFromSafeZone) {
      return "Moderate Risk: You are far from safe zones. Head toward your nearest saved safe zone.";
    }
    return "Moderate Risk: Stay alert, keep location sharing on, and avoid isolated routes.";
  }
  return "Safe: Conditions look stable. Keep tracking active for continuous protection.";
};

export const evaluateDangerPrediction = async ({
  userId,
  lat,
  lng,
  accuracy,
  timestamp = new Date(),
}) => {
  let riskScore = 0;
  const factors = {
    nightTime: false,
    farFromSafeZone: false,
    lowCommunitySafety: false,
    poorGps: false,
  };

  // 1) Time of day
  if (isNightTime(timestamp)) {
    factors.nightTime = true;
    riskScore += 25;
  }

  // 2) Distance from safe zones
  const safeZones = await SafeZone.find({ user: userId, isActive: true })
    .select("latitude longitude")
    .lean();
  let nearestSafeZoneDistance = null;
  if (safeZones.length > 0) {
    nearestSafeZoneDistance = safeZones.reduce((min, zone) => {
      const distance = haversineMeters(lat, lng, zone.latitude, zone.longitude);
      return min == null ? distance : Math.min(min, distance);
    }, null);
    if (nearestSafeZoneDistance > SAFE_ZONE_DISTANCE_THRESHOLD_METERS) {
      factors.farFromSafeZone = true;
      riskScore += 30;
    }
  } else {
    // No safe zones configured => mild risk bump
    factors.farFromSafeZone = true;
    riskScore += 15;
  }

  // 3) Safety audit reports (community safety rating)
  const reports = await SafetyAuditReport.find({ isActive: true })
    .select("latitude longitude radiusMeters safetyRating")
    .limit(500)
    .lean();
  const nearbyRatings = reports
    .filter((report) => {
      const distance = haversineMeters(lat, lng, report.latitude, report.longitude);
      return distance <= Number(report.radiusMeters || 600);
    })
    .map((report) => Number(report.safetyRating));
  if (nearbyRatings.length > 0) {
    const avgRating = nearbyRatings.reduce((sum, rating) => sum + rating, 0) / nearbyRatings.length;
    if (avgRating < 55) {
      factors.lowCommunitySafety = true;
      riskScore += 25;
    } else if (avgRating < 70) {
      riskScore += 10;
    }
  }

  // 4) GPS signal quality
  if (Number.isFinite(Number(accuracy)) && Number(accuracy) > LOW_GPS_ACCURACY_THRESHOLD) {
    factors.poorGps = true;
    riskScore += 20;
  }

  riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
  const riskLevel = getRiskLevel(riskScore);
  const recommendation = getRecommendation({ level: riskLevel, factors });

  return {
    riskScore,
    riskLevel,
    recommendation,
    factors,
    nearestSafeZoneDistanceMeters:
      nearestSafeZoneDistance == null ? null : Math.round(nearestSafeZoneDistance),
  };
};
