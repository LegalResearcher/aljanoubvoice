const Parser = require("rss-parser");

module.exports = async function handler(req, res) {
  try {
    const botToken = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({ error: "Missing Telegram credentials" });
    }

    const FEED_URL = "https://aljanoubvoice.vercel.app/api/rss";

    const parser = new Parser({
      customFields: {
        item: ["image", "media:content", "enclosure"]
      }
    });

    const feed = await parser.parseURL(FEED_URL);

    if (!feed.items || feed.items.length === 0) {
      return res.status(200).json({ ok: false, message: "No items found" });
    }

    const latest = feed.items[0];

    const cacheKey = "LATEST_PUBLISHED_ID";
    const lastPublishedId = global[cacheKey];

    if (lastPublishedId === latest.guid) {
      return res.status(200).json({ ok: true, message: "Already published" });
    }

    global[cacheKey] = latest.guid;

    let imageUrl = null;

    if (latest.enclosure && latest.enclosure.url) {
      imageUrl = latest.enclosure.url;
    } else if (latest["media:content"] && latest["media:content"].$ && latest["media:content"].$.url) {
      imageUrl = latest["media:content"].$.url;
    }

    const messageText = `📰 *${latest.title}*\n\n🔗 ${latest.link}`;

    if (imageUrl) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: imageUrl,
          caption: messageText,
          parse_mode: "Markdown"
        })
      });
    } else {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "Markdown"
        })
      });
    }

    return res.status(200).json({ ok: true, published: latest.title });

  } catch (err) {
    console.error("RSS Publish Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
