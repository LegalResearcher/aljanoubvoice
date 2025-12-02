export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const chatId = process.env.TG_CHAT_ID;
      const botToken = process.env.TG_BOT_TOKEN;

      // قراءة البيانات المرسلة من تليجرام
      const body = req.body;

      // رد تجريبي
      const text = "البوت جاهز ويعمل 🔥";

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
        }),
      });

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  return res.status(200).send("Telegram webhook is active");
}
