import { Resend } from "resend";
import crypto from "node:crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Leon Helg <leon@hikebeast.ch>";
const REPLY_TO = "leon@hikebeast.ch";
const SITE = "https://hikebeast.ch";

const html = (link) => `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;color:#1d1d1f;line-height:1.5;max-width:560px;">
    <p>Hey there,</p>
    <p>Thanks for grabbing the Swiss Hidden Gems free sample. Your guide is ready:</p>
    <p><a href="${link}" style="display:inline-block;background:#1d1d1f;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:500;">Open the guide →</a></p>
    <p style="color:#6e6e73;font-size:14px;">15 hand-picked spots to get you started. The full edition has 100+ hidden gems with exact GPS coordinates, wildcamp info, and lifetime updates — <a href="https://whop.com/gorped/hidden-gems-switzerland-e8/" style="color:#0071e3;">see it here</a>.</p>
    <p>Have fun out there,<br/>Leon</p>
  </div>
`;

async function logSignup({ email, subscriberId, token, sentAt }) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "signup",
        secret: process.env.SHEETS_SECRET,
        sent_at: sentAt,
        email,
        subscriber_id: subscriberId || "",
        token,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error("Sheet log failed:", err);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, subscriber_id } = req.body ?? {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const token = crypto.randomBytes(12).toString("base64url");
  const link = `${SITE}/api/g?t=${token}`;
  const sentAt = new Date().toISOString();

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      replyTo: REPLY_TO,
      subject: "Your Swiss Hidden Gems free sample",
      html: html(link),
    });
    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Email failed to send" });
    }
    await logSignup({ email, subscriberId: subscriber_id, token, sentAt });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
