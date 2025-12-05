module.exports = async function handler(req, res) {
  try {
    const botToken = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({ error: "Missing Telegram credentials" });
    }

    const FEED_URL = (process.env.SITE_URL || 'https://aljnoubvoice.com') + "/api/rss";

    // Fetch RSS feed
    const response = await fetch(FEED_URL, { method: 'GET' });
    if (!response.ok) {
      console.error('Failed to fetch RSS:', response.status, await response.text());
      return res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }

    const xmlText = await response.text();

    // Parse items
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];

      const getTag = (tag) => {
        const regex = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([\\s\\S]*?)<\\/${tag}>`);
        const m = itemXml.match(regex);
        return m ? (m[1] || m[2] || '').trim() : '';
      };

      const getEnclosure = () => {
        const encMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*>/);
        return encMatch ? encMatch[1] : null;
      };

      items.push({
        title: getTag('title'),
        link: getTag('link'),
        guid: getTag('guid') || getTag('link'),
        description: getTag('description'),
        enclosure: getEnclosure()
      });
    }

    if (items.length === 0) {
      return res.status(200).json({ ok: false, message: "No items found" });
    }

    const latest = items[0];

    // Simple in-memory duplicate prevention (may not persist in serverless)
    const cacheKey = "LATEST_PUBLISHED_ID";
    const lastPublishedId = global[cacheKey];

    if (lastPublishedId === latest.guid) {
      return res.status(200).json({ ok: true, message: "Already published" });
    }

    global[cacheKey] = latest.guid;

    const imageUrl = latest.enclosure;
    const messageText = `📰 *${latest.title}*\n\n🔗 ${latest.link}`;

    // Send to Telegram
    if (imageUrl) {
      const sendPhotoRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: imageUrl,
          caption: messageText,
          parse_mode: "Markdown"
        })
      });
      if (!sendPhotoRes.ok) {
        console.error('Telegram sendPhoto failed:', await sendPhotoRes.text());
      }
    } else {
      const sendMsgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "Markdown"
        })
      });
      if (!sendMsgRes.ok) {
        console.error('Telegram sendMessage failed:', await sendMsgRes.text());
      }
    }

    return res.status(200).json({ ok: true, published: latest.title });

  } catch (err) {
    console.error("RSS Publish Error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};
