export default async function handler(req, res) {
  const token = req.query.t;

  if (token) {
    const url = process.env.SHEETS_WEBHOOK_URL;
    if (url) {
      try {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "click",
            secret: process.env.SHEETS_SECRET,
            token,
            clicked_at: new Date().toISOString(),
          }),
          signal: AbortSignal.timeout(5000),
        });
      } catch (err) {
        console.error("Click log failed:", err);
      }
    }
  }

  const target = token
    ? `/free/download?via=email&t=${encodeURIComponent(token)}`
    : "/free/download";
  res.setHeader("Cache-Control", "no-store");
  return res.redirect(302, target);
}
