import express from 'express';
import { protect } from '../middleware/auth.js';
import { getDashboardOverview } from '../controllers/locationController.js';
import { getLocationHistory, exportLocationHistory } from '../controllers/locationHistoryController.js';
import { getSafeZones, createSafeZone, updateSafeZone, deleteSafeZone } from '../controllers/safeZoneController.js';
import { getSOSAlerts, acknowledgeAlert, escalateAlert, resolveAlert } from '../controllers/sosAlertsController.js';
import { adminOnly } from "../middleware/auth.js";
import {
  saveLiveLocation,
  getDangerZones,
  getNearbySafetyPlaces,
  checkGeoFenceStatus,
  getSafeRouteOptions,
  adminGetDangerZones,
  adminCreateDangerZone,
  adminUpdateDangerZone,
  adminDeleteDangerZone,
  adminUnsafeZoneAnalytics,
  adminGetSafetyAuditReports,
  adminCreateSafetyAuditReport,
  adminUpdateSafetyAuditReport,
  adminDeleteSafetyAuditReport,
} from "../controllers/geofencingController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get dashboard overview
router.get('/dashboard', getDashboardOverview);

// Get location history
router.get('/history', getLocationHistory);

// Export location history
router.get('/history/export', exportLocationHistory);

// Safe zones routes
router.get('/safe-zones', getSafeZones);
router.post('/safe-zones', createSafeZone);
router.put('/safe-zones/:id', updateSafeZone);
router.delete('/safe-zones/:id', deleteSafeZone);

// Live location + geofence routes
router.post("/live", saveLiveLocation);
router.get("/danger-zones", getDangerZones);
router.get("/nearby-services", getNearbySafetyPlaces);
router.post("/geofence/check", checkGeoFenceStatus);
router.post("/routes/safe-options", getSafeRouteOptions);

// SOS alerts routes
router.get('/sos-alerts', getSOSAlerts);
router.post('/sos-alerts/:id/acknowledge', acknowledgeAlert);
router.post('/sos-alerts/:id/escalate', escalateAlert);
router.post('/sos-alerts/:id/resolve', resolveAlert);

// Admin geofence routes
router.get("/admin/danger-zones", adminOnly, adminGetDangerZones);
router.post("/admin/danger-zones", adminOnly, adminCreateDangerZone);
router.put("/admin/danger-zones/:id", adminOnly, adminUpdateDangerZone);
router.delete("/admin/danger-zones/:id", adminOnly, adminDeleteDangerZone);
router.get("/admin/unsafe-zones/analytics", adminOnly, adminUnsafeZoneAnalytics);
router.get("/admin/safety-audits", adminOnly, adminGetSafetyAuditReports);
router.post("/admin/safety-audits", adminOnly, adminCreateSafetyAuditReport);
router.put("/admin/safety-audits/:id", adminOnly, adminUpdateSafetyAuditReport);
router.delete("/admin/safety-audits/:id", adminOnly, adminDeleteSafetyAuditReport);

export default router;

