import api from "./api";

/**
 * Session Service - Handles consultation session management
 */

/**
 * Start a consultation session
 * @param {string} appointmentId - The appointment ID
 * @returns {Promise<Object>} Session data
 */
export const startSession = async (appointmentId) => {
  try {
    const response = await api.post("/telehealth/session/start", {
      appointmentId,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to start session"
    );
  }
};

/**
 * End a consultation session
 * @param {string} appointmentId - The appointment ID
 * @returns {Promise<Object>} Session end data
 */
export const endSession = async (appointmentId) => {
  try {
    const response = await api.post("/telehealth/session/end", {
      appointmentId,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to end session");
  }
};

/**
 * Join an active consultation session (patient/doctor)
 * @param {string} appointmentId
 * @returns {Promise<Object>}
 */
export const joinSession = async (appointmentId) => {
  try {
    const response = await api.post("/telehealth/session/join", {
      appointmentId,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to join session");
  }
};

/**
 * Get session status
 * @param {string} appointmentId - The appointment ID
 * @returns {Promise<Object>} Session status
 */
export const getSessionStatus = async (appointmentId) => {
  try {
    const response = await api.get(`/telehealth/session/${appointmentId}/status`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get session status"
    );
  }
};

export const requestVideoSession = async (appointmentId) => {
  try {
    const response = await api.post(`/telehealth/appointments/${appointmentId}/video/request`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to request video consultation");
  }
};

export const respondVideoSessionRequest = async (appointmentId, action, reason = "") => {
  try {
    const response = await api.put(`/telehealth/appointments/${appointmentId}/video/respond`, {
      action,
      reason,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to respond to video consultation");
  }
};

export const getVideoSessionStatus = async (appointmentId) => {
  try {
    const response = await api.get(`/telehealth/appointments/${appointmentId}/video/status`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to get video session status");
  }
};

/**
 * Validate if user can join session
 * @param {Object} appointment - Appointment object
 * @returns {Object} Validation result
 */
export const validateSessionJoin = (appointment) => {
  const errors = [];

  // Check appointment status
  if (!["confirmed", "scheduled", "waiting", "ongoing", "active"].includes(String(appointment.status || "").toLowerCase())) {
    errors.push(
      `Appointment is ${appointment.status}. It is not ready to join yet.`
    );
  }

  // Check scheduled time
  const now = new Date();
  const scheduledTime = new Date(appointment.scheduledAt);
  const timeDiff = scheduledTime - now;
  const minutesDiff = timeDiff / (1000 * 60);

  // Allow joining 15 minutes before scheduled time
  if (minutesDiff > 15) {
    errors.push(
      `Session can only be started 15 minutes before scheduled time. Your appointment is at ${scheduledTime.toLocaleString()}`
    );
  }

  // Check if appointment is too old (more than 24 hours past scheduled time)
  if (minutesDiff < -1440) {
    errors.push("This appointment is too old to join.");
  }

  return {
    canJoin: errors.length === 0,
    errors,
  };
};
