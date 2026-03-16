// backend/controllers/vaccinationController.js
import Vaccination from "../models/Vaccination.js";

// Get all vaccinations for a user
export const getVaccinations = async (req, res) => {
  try {
    const vaccinations = await Vaccination.find({ user: req.userId })
      .sort({ date: -1 })
      .lean();
    
    res.json({ success: true, vaccinations });
  } catch (error) {
    console.error("Get vaccinations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch vaccinations" });
  }
};

// Create new vaccination
export const createVaccination = async (req, res) => {
  try {
    const {
      name,
      date,
      nextDue,
      doctor,
      notes,
      reminder
    } = req.body;

    const vaccination = await Vaccination.create({
      user: req.userId,
      name,
      date: new Date(date),
      nextDue: nextDue ? new Date(nextDue) : null,
      doctor,
      notes,
      reminder
    });

    res.status(201).json({ success: true, vaccination });
  } catch (error) {
    console.error("Create vaccination error:", error);
    res.status(500).json({ success: false, message: "Failed to create vaccination" });
  }
};

// Update vaccination
export const updateVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    if (updateData.nextDue) {
      updateData.nextDue = new Date(updateData.nextDue);
    }

    const vaccination = await Vaccination.findOneAndUpdate(
      { _id: id, user: req.userId },
      updateData,
      { new: true }
    );

    if (!vaccination) {
      return res.status(404).json({ success: false, message: "Vaccination not found" });
    }

    res.json({ success: true, vaccination });
  } catch (error) {
    console.error("Update vaccination error:", error);
    res.status(500).json({ success: false, message: "Failed to update vaccination" });
  }
};

// Delete vaccination
export const deleteVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vaccination = await Vaccination.findOneAndDelete({ 
      _id: id, 
      user: req.userId 
    });
    
    if (!vaccination) {
      return res.status(404).json({ success: false, message: "Vaccination not found" });
    }
    
    res.json({ success: true, message: "Vaccination deleted successfully" });
  } catch (error) {
    console.error("Delete vaccination error:", error);
    res.status(500).json({ success: false, message: "Failed to delete vaccination" });
  }
};

// Get upcoming vaccinations
export const getUpcomingVaccinations = async (req, res) => {
  try {
    const today = new Date();
    const vaccinations = await Vaccination.find({
      user: req.userId,
      nextDue: { $gte: today }
    })
    .sort({ nextDue: 1 })
    .lean();
    
    res.json({ success: true, vaccinations });
  } catch (error) {
    console.error("Get upcoming vaccinations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch upcoming vaccinations" });
  }
};
