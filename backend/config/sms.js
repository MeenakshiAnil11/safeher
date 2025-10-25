import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

let smsClient = null;
let fromNumber = null;

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
fromNumber = process.env.TWILIO_FROM;

if (sid && token && fromNumber) {
  smsClient = twilio(sid, token);
  console.log("✅ SMS provider ready to send messages");
} else {
  console.log("📵 SMS is disabled (missing TWILIO_* env)");
}

/**
 * Send an SMS text message
 * @param {{ to: string, body: string }} params
 */
export async function sendSMS({ to, body }) {
  if (!smsClient) {
    console.log("📵 SMS skipped:", { to, body });
    return;
  }
  try {
    const res = await smsClient.messages.create({
      from: fromNumber,
      to,
      body,
    });
    return res;
  } catch (err) {
    console.error("❌ SMS send failed", to, err?.message || err);
  }
}