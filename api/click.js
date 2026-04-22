import { addTag } from "../lib/manychat.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, subscriber_id } = req.body ?? {};

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

  if (subscriber_id) {
    tasks.push(addTag(subscriber_id, "email_link_clicked"));
  }

  await Promise.all(tasks);

  return res.status(200).json({ ok: true });
}
