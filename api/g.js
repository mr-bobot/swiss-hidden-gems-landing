import { addTag } from "../lib/manychat.js";

export default async function handler(req, res) {
  const token = req.query.t;
  const subscriberId = req.query.s;

  const tasks = [];

  if (token) {
    const url = process.env.SHEETS_WEBHOOK_URL;
    if (url) {
      tasks.push(
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "click",
            secret: process.env.SHEETS_SECRET,
            token,
            clicked_at: new Date().toISOString(),
          }),
          signal: AbortSignal.timeout(5000),
        }).catch((err) => console.error("Click log failed:", err)),
      );
    }
  }

  if (subscriberId) {
    tasks.push(addTag(subscriberId, "email_link_clicked"));
  }

  await Promise.all(tasks);

  const params = new URLSearchParams();
  params.set("via", "email");
  if (token) params.set("t", token);
  if (subscriberId) params.set("s", subscriberId);
  const target = `/free/download?${params.toString()}`;
  res.setHeader("Cache-Control", "no-store");
  return res.redirect(302, target);
}
