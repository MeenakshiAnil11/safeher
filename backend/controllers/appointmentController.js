// backend/controllers/appointmentController.js
import Appointment from "../models/Appointment.js";

// Get all appointments for a user
export const getAppointments = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { user: req.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const appointments = await Appointment.find(query)
      .sort({ date: 1, time: 1 })
      .lean();
    
    res.json({ success: true, appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
};

// Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const {
      title,
      date,
      time,
      type,
      doctor,
      location,
      notes,
      reminder,
      reminderTime
    } = req.body;

    const appointment = await Appointment.create({
      appointmentNumber: Appointment.generateAppointmentNumber(),
      user: req.userId,
      title,
      date: new Date(date),
      time,
      type,
      doctor,
      location,
      notes,
      reminder,
      reminderTime: parseInt(reminderTime)
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({ success: false, message: "Failed to create appointment" });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, user: req.userId },
      updateData,
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({ success: false, message: "Failed to update appointment" });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findOneAndDelete({ 
      _id: id, 
      user: req.userId 
    });
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    
    res.json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Delete appointment error:", error);
    res.status(500).json({ success: false, message: "Failed to delete appointment" });
  }
};

// Get upcoming appointments
export const getUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date();
    const appointments = await Appointment.find({
      user: req.userId,
      date: { $gte: today }
    })
    .sort({ date: 1, time: 1 })
    .limit(10)
    .lean();
    
    res.json({ success: true, appointments });
  } catch (error) {
    console.error("Get upcoming appointments error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch upcoming appointments" });
  }
};
