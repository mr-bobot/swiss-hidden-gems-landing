import { addTag } from "../lib/manychat.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, subscriber_id, via } = req.body ?? {};

  const tasks = [];

  const url = process.env.SHEETS_WEBHOOK_URL;
  if (url) {
    tasks.push(
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "download",
          secret: process.env.SHEETS_SECRET,
          token: token || "",
          subscriber_id: subscriber_id || "",
          via: via || "direct",
          downloaded_at: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(5000),
      }).catch((err) => console.error("Download log failed:", err)),
    );
  }

  if (subscriber_id) {
    tasks.push(addTag(subscriber_id, "pdf_downloaded"));
  }

  await Promise.all(tasks);

  return res.status(200).json({ ok: true });
}
