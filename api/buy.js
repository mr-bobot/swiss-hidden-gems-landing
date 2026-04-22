const WHOP = "https://whop.com/gorped/hidden-gems-switzerland-e8/";

export default async function handler(req, res) {
  const { t: token, s: subscriberId } = req.query;

  res.setHeader("Cache-Control", "no-store");
  res.redirect(302, WHOP);

  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "buy_click",
        secret: process.env.SHEETS_SECRET,
        token: token || "",
        subscriber_id: subscriberId || "",
        clicked_at: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error("Buy click log failed:", err);
  }
}
