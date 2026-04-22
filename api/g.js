export default async function handler(req, res) {
  const { t: token, s: subscriberId } = req.query;

  const params = new URLSearchParams();
  params.set("via", "email");
  if (token) params.set("t", token);
  if (subscriberId) params.set("s", subscriberId);

  res.setHeader("Cache-Control", "no-store");
  return res.redirect(302, `/free/download?${params.toString()}`);
}
