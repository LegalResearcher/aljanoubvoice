import fetch from "node-fetch";

export default async function handler(req, res) {
  const BOT_TOKEN = process.env.TG_BOT_TOKEN;
  const CHAT_ID = process.env.TG_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: "Missing TG_BOT_TOKEN or TG_CHAT_ID" });
  }

  if (req.method === "POST") {
    const { title, link, image } = req.body;

    if (!title || !link) {
      return res.status(400).json({ error: "Missing title or link" });
    }

    const textMessage = `📰 *${title}*\n\n🔗 ${link}`;

    // أرسل النص
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: textMessage,
        parse_mode: "Markdown"
      })
    });

    // أرسل الصورة إن وجدت
    if (image) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          photo: image,
          caption: textMessage,
          parse_mode: "Markdown"
        })
      });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(200).json({ message: "Telegram Webhook Ready" });
}
