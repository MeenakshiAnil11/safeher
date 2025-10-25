// backend/controllers/sosController.js
import SOSLog from "../models/SOSLogs.js";
import Contact from "../models/Contact.js";
import User from "../models/User.js";
import { sendEmail } from "../config/mailer.js";
import { sendSMS } from "../config/sms.js";

function mapsLink(lat, lng) {
  if (lat == null || lng == null) return "";
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export const getSOSLogs = async (req, res) => {
  try {
    const logs = await SOSLog.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(logs);
  } catch (err) {
    console.error("getSOSLogs error", err);
    res.status(500).json({ message: "Failed to fetch SOS logs" });
  }
};

export const createSOS = async (req, res) => {
  try {
    const { lat, lng, message } = req.body || {};

    // Create log
    const log = await SOSLog.create({
      user: req.userId,
      coords: { lat, lng },
      message: message || "SOS triggered",
      status: "open",
    });

    // Load user and contacts
    const [user, contacts, admins] = await Promise.all([
      User.findById(req.userId).select("name email phone").lean(),
      Contact.find({ user: req.userId }).lean(),
      User.find({ role: "admin", isActive: true }).select("email").lean(),
    ]);

    const link = mapsLink(lat, lng);

    // Email body
    const htmlBody = (recipientName = "") => `
      <div>
        <h2>🚨 SOS Alert</h2>
        <p>${recipientName ? `Hello ${recipientName},` : "Hello,"}</p>
        <p><strong>${user?.name || "A user"}</strong> triggered an SOS alert.</p>
        <ul>
          <li><b>User Email:</b> ${user?.email || "-"}</li>
          <li><b>User Phone:</b> ${user?.phone || "-"}</li>
          <li><b>Message:</b> ${message || "SOS triggered"}</li>
          ${link ? `<li><b>Live Location:</b> <a href="${link}">${link}</a></li>` : ""}
          <li><b>Time:</b> ${new Date(log.createdAt).toLocaleString()}</li>
        </ul>
        <p>Please reach out immediately.</p>
      </div>
    `;

    // Notify contacts via email (where available)
    const contactEmails = contacts.map((c) => c.email).filter(Boolean);
    await Promise.all(
      contactEmails.map((to) =>
        sendEmail({ to, subject: "🚨 SOS Alert - Immediate Attention", html: htmlBody() }).catch((e) => {
          console.error("Email to contact failed", to, e.message);
        })
      )
    );

    // Notify admins by email
    const adminEmails = admins.map((a) => a.email).filter(Boolean);
    await Promise.all(
      adminEmails.map((to) =>
        sendEmail({ to, subject: "🚨 SOS Alert - New Incident", html: htmlBody("Admin") }).catch((e) => {
          console.error("Email to admin failed", to, e.message);
        })
      )
    );

    // Notify contacts via SMS (if Twilio configured)
    const contactPhones = contacts.map((c) => c.phone).filter(Boolean);
    const smsText = `SOS Alert: ${user?.name || "A user"} needs help. ${message || "SOS triggered"}${link ? ` ${link}` : ""}`;
    await Promise.all(
      contactPhones.map((to) =>
        sendSMS({ to, body: smsText }).catch((e) => {
          console.error("SMS to contact failed", to, e?.message || e);
        })
      )
    );

    res.status(201).json({ ok: true, log });
  } catch (err) {
    console.error("createSOS error", err);
    res.status(500).json({ message: "Failed to send SOS" });
  }
};
