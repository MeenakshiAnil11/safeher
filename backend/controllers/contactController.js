// backend/controllers/contactController.js
import Contact from "../models/Contact.js";

const buildUpdatePayload = (payload = {}) => {
  const update = {};
  const assignIfDefined = (key, value) => {
    if (value !== undefined) update[key] = value;
  };

  assignIfDefined("name", payload.name);
  assignIfDefined("number", payload.number);
  assignIfDefined("relationship", payload.relationship);
  assignIfDefined("email", payload.email);
  assignIfDefined("fcmToken", payload.fcmToken);
  assignIfDefined("notes", payload.notes);
  assignIfDefined("priority", payload.priority);
  assignIfDefined("notificationChannels", payload.notificationChannels);
  if (typeof payload.otpEnabled === "boolean") {
    update["otpVerification.enabled"] = payload.otpEnabled;
    if (!payload.otpEnabled) {
      update["otpVerification.isVerified"] = false;
      update["otpVerification.verifiedAt"] = null;
      update["otpVerification.otpCode"] = "";
      update["otpVerification.otpExpiresAt"] = null;
    }
  }
  return update;
};

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
    const {
      name,
      number,
      relationship = "",
      email = "",
      fcmToken = "",
      notes = "",
      priority = "secondary",
      notificationChannels = { sms: true, email: true, push: true },
      otpEnabled = false,
    } = req.body || {};
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
      priority,
      notificationChannels,
      otpVerification: {
        enabled: otpEnabled,
        isVerified: false,
      },
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
    const updatePayload = buildUpdatePayload(req.body || {});

    const contact = await Contact.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: updatePayload },
      { new: true }
    );

    if (!contact) return res.status(404).json({ message: "Contact not found" });

    res.json({ contact });
  } catch (err) {
    console.error("updateContact error", err);
    res.status(500).json({ message: "Failed to update contact" });
  }
};

// POST /api/contacts/:id/send-otp - generate OTP for contact verification
export const sendContactOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findOne({ _id: id, user: req.userId });
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    contact.otpVerification.enabled = true;
    contact.otpVerification.isVerified = false;
    contact.otpVerification.verifiedAt = null;
    contact.otpVerification.otpCode = otpCode;
    contact.otpVerification.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await contact.save();

    // In production this should be sent through SMS/Email providers.
    res.json({
      success: true,
      message: "OTP generated successfully",
      expiresInMinutes: 10,
      otpPreview: otpCode,
    });
  } catch (err) {
    console.error("sendContactOTP error", err);
    res.status(500).json({ message: "Failed to generate OTP" });
  }
};

// POST /api/contacts/:id/verify-otp - verify OTP
export const verifyContactOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otpCode } = req.body || {};
    if (!otpCode) return res.status(400).json({ message: "OTP code is required" });

    const contact = await Contact.findOne({ _id: id, user: req.userId });
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    const isExpired =
      !contact.otpVerification?.otpExpiresAt ||
      new Date(contact.otpVerification.otpExpiresAt).getTime() < Date.now();
    if (isExpired) return res.status(400).json({ message: "OTP expired. Please request a new code." });

    if (String(contact.otpVerification?.otpCode) !== String(otpCode).trim()) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    contact.otpVerification.isVerified = true;
    contact.otpVerification.verifiedAt = new Date();
    contact.otpVerification.otpCode = "";
    contact.otpVerification.otpExpiresAt = null;
    await contact.save();

    res.json({ success: true, message: "Contact verified successfully", contact });
  } catch (err) {
    console.error("verifyContactOTP error", err);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// POST /api/contacts/:id/acknowledge-sos - mark contact SOS acknowledgement
export const acknowledgeSOSByContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = "acknowledged" } = req.body || {};
    const normalized = status === "acknowledged" ? "acknowledged" : "pending";

    const contact = await Contact.findOneAndUpdate(
      { _id: id, user: req.userId },
      {
        $set: {
          "sosAcknowledgement.status": normalized,
          "sosAcknowledgement.acknowledgedAt": normalized === "acknowledged" ? new Date() : null,
        },
      },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    res.json({ success: true, contact });
  } catch (err) {
    console.error("acknowledgeSOSByContact error", err);
    res.status(500).json({ message: "Failed to update acknowledgement status" });
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
