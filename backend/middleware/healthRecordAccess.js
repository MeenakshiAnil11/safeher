import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

/**
 * Middleware to verify a doctor has authorized access to a patient's health records.
 * Access is granted only if the doctor has had at least one appointment with the patient.
 */
export const doctorPatientAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const patientId = req.params.patientId || req.query.patientId;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID required" });
    }

    // If the requesting user IS the patient, allow
    if (userId === patientId) return next();

    // Check if requester is a doctor with an appointment link to this patient
    const doctorDoc = await Doctor.findOne({ user: userId });
    if (!doctorDoc) {
      return res.status(403).json({ message: "Access denied: not a doctor" });
    }

    const hasAccess = await Appointment.exists({
      doctor: doctorDoc._id,
      user: patientId,
    });

    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied: no prior appointment with this patient",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
