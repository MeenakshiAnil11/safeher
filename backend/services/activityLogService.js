import ActivityLog from "../models/ActivityLog.js";

export const ACTIVITY_EVENTS = {
  TRACKING_STARTED: "TRACKING_STARTED",
  TRACKING_PAUSED: "TRACKING_PAUSED",
  ENTERED_SAFE_ZONE: "ENTERED_SAFE_ZONE",
  EXITED_SAFE_ZONE: "EXITED_SAFE_ZONE",
  SOS_TRIGGERED: "SOS_TRIGGERED",
  LOCATION_SHARING_ENABLED: "LOCATION_SHARING_ENABLED",
  LOCATION_SHARING_STOPPED: "LOCATION_SHARING_STOPPED",
};

export const createActivityLog = async ({
  userId,
  eventType,
  description,
  timestamp = new Date(),
  location = {},
}) => {
  return ActivityLog.create({
    userId,
    eventType,
    description,
    timestamp,
    location: {
      lat: Number.isFinite(Number(location?.lat)) ? Number(location.lat) : null,
      lng: Number.isFinite(Number(location?.lng)) ? Number(location.lng) : null,
    },
  });
};

export const getLatestActivityByTypes = async (userId, eventTypes = []) => {
  return ActivityLog.findOne({ userId, eventType: { $in: eventTypes } })
    .sort({ timestamp: -1 })
    .lean();
};
