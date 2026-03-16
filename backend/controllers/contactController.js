// backend/controllers/contactController.js
import Contact from "../models/Contact.js";

// GET /api/contacts - list user contacts
export const listContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ contacts });
  } catch (err) {
    console.error("listContacts error", err);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

// POST /api/contacts - create contact
export const createContact = async (req, res) => {
  try {
    const { name, number, relationship = "", email = "", fcmToken = "", notes = "" } = req.body || {};
    if (!name || !number) {
      return res.status(400).json({ message: "Name and Phone are required" });
    }

    const contact = await Contact.create({
      user: req.userId,
      name,
      number,
      relationship,
      email,
      fcmToken, // Save FCM token
      notes,
    });

    res.status(201).json({ contact });
  } catch (err) {
    console.error("createContact error", err);
    res.status(500).json({ message: "Failed to create contact" });
  }
};

// PUT /api/contacts/:id - update contact
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, number, relationship, email, fcmToken, notes } = req.body || {};

    const contact = await Contact.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: { name, number, relationship, email, fcmToken, notes } },
      { new: true }
    );

    if (!contact) return res.status(404).json({ message: "Contact not found" });

    res.json({ contact });
  } catch (err) {
    console.error("updateContact error", err);
    res.status(500).json({ message: "Failed to update contact" });
  }
};

// DELETE /api/contacts/:id - delete contact
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findOneAndDelete({ _id: id, user: req.userId });
    if (!deleted) return res.status(404).json({ message: "Contact not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteContact error", err);
    res.status(500).json({ message: "Failed to delete contact" });
  }
};

// POST /api/contacts/:id/fcm-token - update FCM token for a contact
export const updateFCMToken = async (req, res) => {
  try {
    const { id } = req.params;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    const contact = await Contact.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: { fcmToken } },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ 
      success: true, 
      message: "FCM token updated successfully",
      contact 
    });
  } catch (err) {
    console.error("updateFCMToken error", err);
    res.status(500).json({ message: "Failed to update FCM token" });
  }
};
