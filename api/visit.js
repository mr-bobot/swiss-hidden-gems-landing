export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { subscriber_id } = req.body ?? {};
  if (!subscriber_id) {
    return res.status(400).json({ error: "subscriber_id required" });
  }

  const url = process.env.SHEETS_WEBHOOK_URL;
  if (url) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "visit",
          secret: process.env.SHEETS_SECRET,
          subscriber_id,
          landed_at: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch (err) {
      console.error("Visit log failed:", err);
    }
  }

  return res.status(200).json({ ok: true });
}
