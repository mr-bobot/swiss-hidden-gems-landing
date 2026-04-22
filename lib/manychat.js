const API_BASE = "https://api.manychat.com/fb";

async function manychatPost(path, body) {
  const apiKey = process.env.MANYCHAT_API_KEY;
  if (!apiKey) return;
  try {
    await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error(`ManyChat ${path} failed:`, err);
  }
}

export async function addTag(subscriberId, tagName) {
  if (!subscriberId || !tagName) return;
  await manychatPost("/subscriber/addTagByName", {
    subscriber_id: subscriberId,
    tag_name: tagName,
  });
}

export async function setEmail(subscriberId, email) {
  if (!subscriberId || !email) return;
  await manychatPost("/subscriber/setCustomFieldByName", {
    subscriber_id: subscriberId,
    field_name: "Email",
    field_value: email,
  });
}
