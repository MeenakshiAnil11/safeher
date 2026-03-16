// backend/controllers/medicationController.js
import Medication from "../models/Medication.js";

// Get all medications for a user
export const getMedications = async (req, res) => {
  try {
    const { active } = req.query;
    let query = { user: req.userId };
    
    if (active === 'true') {
      const today = new Date();
      query.$or = [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: today } }
      ];
    }
    
    const medications = await Medication.find(query)
      .sort({ startDate: -1 })
      .lean();
    
    res.json({ success: true, medications });
  } catch (error) {
    console.error("Get medications error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch medications" });
  }
};

// Create new medication
export const createMedication = async (req, res) => {
  try {
    const {
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      notes,
      reminder
    } = req.body;

    const medication = await Medication.create({
      user: req.userId,
      name,
      dosage,
      frequency,
      times: times || [],
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes,
      reminder
    });

    res.status(201).json({ success: true, medication });
  } catch (error) {
    console.error("Create medication error:", error);
    res.status(500).json({ success: false, message: "Failed to create medication" });
  }
};

// Update medication
export const updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const medication = await Medication.findOneAndUpdate(
      { _id: id, user: req.userId },
      updateData,
      { new: true }
    );

    if (!medication) {
      return res.status(404).json({ success: false, message: "Medication not found" });
    }

    res.json({ success: true, medication });
  } catch (error) {
    console.error("Update medication error:", error);
    res.status(500).json({ success: false, message: "Failed to update medication" });
  }
};

// Delete medication
export const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medication = await Medication.findOneAndDelete({ 
      _id: id, 
      user: req.userId 
    });
    
    if (!medication) {
      return res.status(404).json({ success: false, message: "Medication not found" });
    }
    
    res.json({ success: true, message: "Medication deleted successfully" });
  } catch (error) {
    console.error("Delete medication error:", error);
    res.status(500).json({ success: false, message: "Failed to delete medication" });
  }
};

// Get active medications
export const getActiveMedications = async (req, res) => {
  try {
    const today = new Date();
    const medications = await Medication.find({
      user: req.userId,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: today } }
      ]
    })
    .sort({ startDate: -1 })
    .lean();
    
    res.json({ success: true, medications });
  } catch (error) {
    console.error("Get active medications error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch active medications" });
  }
};
