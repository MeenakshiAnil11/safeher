// backend/controllers/sosController.js
import SOSLog from "../models/SOSLogs.js";
import Contact from "../models/Contact.js";
import User from "../models/User.js";
import admin from "../utils/firebaseAdmin.js"; // Firebase Admin for FCM push notifications
import { sendEmail } from "../config/mailer.js";
import { sendSMS } from "../config/sms.js";
import { ACTIVITY_EVENTS, createActivityLog } from "../services/activityLogService.js";

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
    const { lat, lng, message, accuracy, timestamp } = req.body || {};

    // Create log with enhanced location data
    const log = await SOSLog.create({
      user: req.userId,
      coords: { lat, lng },
      message: message || "SOS triggered",
      status: "open",
      accuracy: accuracy,
      timestamp: timestamp || new Date(),
    });
    await createActivityLog({
      userId: req.userId,
      eventType: ACTIVITY_EVENTS.SOS_TRIGGERED,
      description: "SOS triggered",
      location: { lat, lng },
    });

    // Load user and contacts
    const [user, contacts, admins] = await Promise.all([
      User.findById(req.userId).select("name email phone").lean(),
      Contact.find({ user: req.userId }).lean(),
      User.find({ role: "admin", isActive: true }).select("email").lean(),
    ]);

    const link = mapsLink(lat, lng);
    const appleMapsLink = lat && lng ? `https://maps.apple.com/?q=${lat},${lng}` : '';
    const osmLink = lat && lng ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15` : '';

    // Enhanced email body with multiple map links
    const htmlBody = (recipientName = "") => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ff4444; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY SOS ALERT</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h2 style="color: #333; margin-top: 0;">Emergency Details</h2>
          <p style="font-size: 16px; margin-bottom: 10px;">
            <strong>${recipientName ? `Hello ${recipientName},` : "Hello,"}</strong>
          </p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>${user?.name || "A user"}</strong> has triggered an emergency SOS alert and needs immediate assistance.
          </p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #ff4444;">
            <h3 style="margin-top: 0; color: #333;">Contact Information</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 8px;"><strong>Name:</strong> ${user?.name || "Not provided"}</li>
              <li style="margin-bottom: 8px;"><strong>Email:</strong> ${user?.email || "Not provided"}</li>
              <li style="margin-bottom: 8px;"><strong>Phone:</strong> ${user?.phone || "Not provided"}</li>
              <li style="margin-bottom: 8px;"><strong>Message:</strong> ${message || "SOS triggered"}</li>
              <li style="margin-bottom: 8px;"><strong>Time:</strong> ${new Date(log.createdAt).toLocaleString()}</li>
              ${accuracy ? `<li style="margin-bottom: 8px;"><strong>Location Accuracy:</strong> ±${Math.round(accuracy)} meters</li>` : ""}
            </ul>
          </div>
          
          ${link ? `
          <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #007bff;">
            <h3 style="margin-top: 0; color: #333;">📍 Location Information</h3>
            <p style="margin-bottom: 10px;"><strong>Coordinates:</strong> ${lat?.toFixed(6)}, ${lng?.toFixed(6)}</p>
            <div style="margin-top: 15px;">
              <h4 style="margin-bottom: 10px; color: #333;">Open Location in Maps:</h4>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${link ? `<a href="${link}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">🗺️ Google Maps</a>` : ""}
                ${appleMapsLink ? `<a href="${appleMapsLink}" style="background: #000; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">🍎 Apple Maps</a>` : ""}
                ${osmLink ? `<a href="${osmLink}" style="background: #7cbb00; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">🌍 OpenStreetMap</a>` : ""}
              </div>
            </div>
          </div>
          ` : ""}
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-top: 15px;">
            <h4 style="margin-top: 0; color: #856404;">⚠️ Important Instructions</h4>
            <ul style="color: #856404; margin-bottom: 0;">
              <li>Contact the person immediately</li>
              <li>If no response, contact local emergency services</li>
              <li>Share this location information with emergency responders</li>
              <li>Keep this email for your records</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This is an automated emergency alert from SafeHer Safety App</p>
        </div>
      </div>
    `;

    // Enhanced SMS text with location details
    const smsText = `🚨 EMERGENCY SOS ALERT 🚨

${user?.name || "A user"} needs immediate help!

Message: ${message || "SOS triggered"}
Time: ${new Date(log.createdAt).toLocaleString()}
${lat && lng ? `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}` : ""}
${accuracy ? `Accuracy: ±${Math.round(accuracy)}m` : ""}

${link ? `Maps: ${link}` : ""}

Please contact them immediately or call emergency services if no response.`;

    // Notify contacts via email (where available)
    const contactEmails = contacts.map((c) => c.email).filter(Boolean);
    
    // Add specific email for testing
    const testEmail = "meenakshianil33@gmail.com";
    if (!contactEmails.includes(testEmail)) {
      contactEmails.push(testEmail);
    }
    
    console.log(`📧 Sending emails to ${contactEmails.length} contacts:`, contactEmails);
    await Promise.all(
      contactEmails.map((to) =>
        sendEmail({ to, subject: "🚨 EMERGENCY SOS ALERT - Immediate Action Required", html: htmlBody() }).catch((e) => {
          console.error("Email to contact failed", to, e.message);
        })
      )
    );

    // Notify admins by email
    const adminEmails = admins.map((a) => a.email).filter(Boolean);
    console.log(`📧 Sending emails to ${adminEmails.length} admins:`, adminEmails);
    await Promise.all(
      adminEmails.map((to) =>
        sendEmail({ to, subject: "🚨 SOS Alert - New Emergency Incident", html: htmlBody("Admin") }).catch((e) => {
          console.error("Email to admin failed", to, e.message);
        })
      )
    );

    // Notify contacts via SMS (if Twilio configured)
    // Note: using 'number' field from Contact model, not 'phone'
    const contactPhones = contacts.map((c) => c.number).filter(Boolean);
    console.log(`📱 Sending SMS to ${contactPhones.length} contacts:`, contactPhones);
    await Promise.all(
      contactPhones.map((to) =>
        sendSMS({ to, body: smsText }).catch((e) => {
          console.error("SMS to contact failed", to, e?.message || e);
        })
      )
    );

    res.status(201).json({ 
      ok: true, 
      log,
      message: "SOS alert sent successfully",
      contactsNotified: {
        email: contactEmails.length,
        sms: contactPhones.length,
        total: contacts.length
      }
    });
  } catch (err) {
    console.error("createSOS error", err);
    res.status(500).json({ message: "Failed to send SOS" });
  }
};

// Share location with specific contacts
export const shareLocation = async (req, res) => {
  try {
    const { contacts, location, message } = req.body || {};

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ message: "Contacts array is required" });
    }

    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: "Valid location data is required" });
    }

    // Load user info
    const user = await User.findById(req.userId).select("name email phone").lean();
    await createActivityLog({
      userId: req.userId,
      eventType: ACTIVITY_EVENTS.LOCATION_SHARING_ENABLED,
      description: "Location sharing enabled",
      location: { lat: location.latitude, lng: location.longitude },
    });

    const link = mapsLink(location.latitude, location.longitude);
    const appleMapsLink = `https://maps.apple.com/?q=${location.latitude},${location.longitude}`;
    const osmLink = `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=15`;

    // Email body for location sharing
    const htmlBody = (recipientName = "") => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #007bff; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">📍 Location Shared</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h2 style="color: #333; margin-top: 0;">Location Information</h2>
          <p style="font-size: 16px; margin-bottom: 10px;">
            <strong>${recipientName ? `Hello ${recipientName},` : "Hello,"}</strong>
          </p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>${user?.name || "A user"}</strong> has shared their current location with you.
          </p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff;">
            <h3 style="margin-top: 0; color: #333;">Location Details</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 8px;"><strong>Coordinates:</strong> ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}</li>
              <li style="margin-bottom: 8px;"><strong>Accuracy:</strong> ±${Math.round(location.accuracy || 0)} meters</li>
              <li style="margin-bottom: 8px;"><strong>Time:</strong> ${new Date(location.timestamp || new Date()).toLocaleString()}</li>
              <li style="margin-bottom: 8px;"><strong>Message:</strong> ${message || "Location shared"}</li>
            </ul>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #333;">📍 Open Location in Maps</h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <a href="${link}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">🗺️ Google Maps</a>
              <a href="${appleMapsLink}" style="background: #000; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">🍎 Apple Maps</a>
              <a href="${osmLink}" style="background: #7cbb00; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">🌍 OpenStreetMap</a>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This location was shared via SafeHer Safety App</p>
        </div>
      </div>
    `;

    // SMS text for location sharing
    const smsText = `📍 Location Shared

${user?.name || "A user"} shared their location with you.

Message: ${message || "Location shared"}
Time: ${new Date(location.timestamp || new Date()).toLocaleString()}
Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
Accuracy: ±${Math.round(location.accuracy || 0)}m

Maps: ${link}`;

    // Send notifications to specified contacts
    const emailResults = [];
    const smsResults = [];

    for (const contact of contacts) {
      if (contact.email) {
        try {
          await sendEmail({ 
            to: contact.email, 
            subject: "📍 Location Shared - SafeHer", 
            html: htmlBody(contact.name || contact.email) 
          });
          emailResults.push({ contact: contact.email, success: true });
        } catch (error) {
          console.error("Email to contact failed", contact.email, error.message);
          emailResults.push({ contact: contact.email, success: false, error: error.message });
        }
      }

      // Use 'number' field (Contact model) instead of 'phone'
      const phoneNumber = contact.number || contact.phone;
      if (phoneNumber) {
        try {
          await sendSMS({ to: phoneNumber, body: smsText });
          smsResults.push({ contact: phoneNumber, success: true });
        } catch (error) {
          console.error("SMS to contact failed", phoneNumber, error?.message || error);
          smsResults.push({ contact: phoneNumber, success: false, error: error?.message || error });
        }
      }
    }

    res.status(200).json({ 
      ok: true,
      message: "Location shared successfully",
      results: {
        email: emailResults,
        sms: smsResults,
        totalContacts: contacts.length
      }
    });
  } catch (err) {
    console.error("shareLocation error", err);
    res.status(500).json({ message: "Failed to share location" });
  }
};

// New SOS endpoint with location tracking
export const sendSOS = async (req, res) => {
  try {
    const { latitude, longitude, message } = req.body;
    
    // Validate location data
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: "Location data is required (latitude and longitude)" 
      });
    }

    // Get user info
    const user = await User.findById(req.userId).select("name email phone").lean();
    
    // Get emergency contacts
    const contacts = await Contact.find({ user: req.userId }).lean();
    
    if (!contacts || contacts.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No emergency contacts found. Please add emergency contacts first." 
      });
    }

    // Create Google Maps link
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const timestamp = new Date().toLocaleString();

    // Create SOS log entry
    const log = await SOSLog.create({
      user: req.userId,
      coords: { lat: latitude, lng: longitude },
      message: message || "Emergency SOS triggered",
      status: "open",
      timestamp: new Date(),
    });
    await createActivityLog({
      userId: req.userId,
      eventType: ACTIVITY_EVENTS.SOS_TRIGGERED,
      description: "SOS triggered",
      location: { lat: latitude, lng: longitude },
    });

    // Prepare SMS message
    const smsMessage = `🚨 EMERGENCY SOS ALERT

${user?.name || "A user"} needs immediate help!

Location: ${latitude}, ${longitude}
Time: ${timestamp}
${message ? `Message: ${message}` : ""}

Open in Maps: ${mapsLink}

Please respond immediately or call emergency services.`;

    // Prepare email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff4444; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .info-box { background: white; padding: 15px; border-radius: 6px; margin: 10px 0; }
          .btn { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 5px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚨 EMERGENCY SOS ALERT</h1>
        </div>
        
        <div class="content">
          <div class="info-box">
            <h3>Emergency Details</h3>
            <p><strong>Name:</strong> ${user?.name || "Not provided"}</p>
            <p><strong>Email:</strong> ${user?.email || "Not provided"}</p>
            <p><strong>Phone:</strong> ${user?.phone || "Not provided"}</p>
            <p><strong>Time:</strong> ${timestamp}</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
          </div>
          
          <div class="info-box">
            <h3>📍 Location Information</h3>
            <p><strong>Coordinates:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
            <a href="${mapsLink}" class="btn">📍 Open in Google Maps</a>
          </div>
          
          <div class="warning">
            <h4>⚠️ Immediate Action Required</h4>
            <ul>
              <li>Contact the person immediately</li>
              <li>If no response, call local emergency services</li>
              <li>Share this location information with responders</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This is an automated emergency alert from SafeHer Safety App</p>
        </div>
      </body>
      </html>
    `;

    // Get contact emails and add test email
    const contactEmails = contacts.map((c) => c.email).filter(Boolean);
    const testEmail = "meenakshianil33@gmail.com";
    if (!contactEmails.includes(testEmail)) {
      contactEmails.push(testEmail);
    }

    // Send emails to contacts
    console.log(`📧 Sending SOS emails to ${contactEmails.length} contacts:`, contactEmails);
    await Promise.all(
      contactEmails.map((to) =>
        sendEmail({ 
          to, 
          subject: "🚨 EMERGENCY SOS ALERT - Immediate Action Required", 
          html: emailHtml 
        }).catch((e) => {
          console.error("❌ Email to contact failed", to, e.message);
        })
      )
    );

    // Send SMS messages (if Twilio configured)
    const contactPhones = contacts.map((c) => c.number).filter(Boolean);
    console.log(`📱 Sending SOS SMS to ${contactPhones.length} contacts:`, contactPhones);
    await Promise.all(
      contactPhones.map((to) =>
        sendSMS({ to, body: smsMessage }).catch((e) => {
          console.error("SMS to contact failed", to, e?.message || e);
        })
      )
    );

    // Send FCM push notifications to emergency contacts
    const results = {
      fcm: { sent: 0, failed: 0, details: [] },
      email: contactEmails.length,
      sms: contactPhones.length
    };

    // Send FCM push notifications to each contact
    for (const contact of contacts) {
      // Send FCM push notification if token available
      if (contact.fcmToken && admin.messaging) {
        try {
          const fcmMessage = {
            notification: {
              title: '🚨 EMERGENCY SOS ALERT',
              body: `${user.name} needs immediate help! Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            },
            data: {
              type: 'sos',
              userId: user._id.toString(),
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              mapsLink: mapsLink,
              timestamp: timestamp,
              message: message || "SOS triggered"
            },
            token: contact.fcmToken,
          };

          const fcmResponse = await admin.messaging().send(fcmMessage);
          results.fcm.sent++;
          results.fcm.details.push({ 
            contact: contact.name, 
            fcmToken: contact.fcmToken.substring(0, 20) + '...', 
            status: "sent",
            fcmMessageId: fcmResponse
          });
          console.log(`✅ FCM notification sent to ${contact.name}`);
        } catch (error) {
          results.fcm.failed++;
          results.fcm.details.push({ 
            contact: contact.name, 
            status: "failed", 
            error: error.message 
          });
          console.error(`❌ FCM failed to ${contact.name}:`, error.message);
        }
      } else {
        console.log(`⚠️ No FCM token for ${contact.name} - they need to enable notifications`);
      }
    }

    // Send response
    const response = {
      success: true,
      message: "SOS alert sent successfully",
      data: {
        logId: log._id,
        location: { latitude, longitude, mapsLink },
        timestamp,
        contactsNotified: {
          total: contacts.length,
          email: contactEmails.length,
          sms: contactPhones.length,
          fcm: results.fcm.sent,
          fcmFailed: results.fcm.failed
        },
        results
      }
    };

    console.log("✅ SOS alert sent successfully:", response);
    res.status(200).json(response);

  } catch (err) {
    console.error("❌ SOS send error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send SOS alert",
      error: err.message 
    });
  }
};
