import { createClient } from '@supabase/supabase-js';

const categoryNames = {
  aden: 'أخبار عدن',
  local: 'أخبار محلية',
  reports: 'أخبار وتقارير',
  press: 'اليمن في الصحافة',
  intl: 'شؤون دولية',
  opinions: 'آراء واتجاهات',
  tech: 'علوم وتكنولوجيا',
  sports: 'رياضة',
  video: 'فيديو الجنوب فويس',
  economy: 'اقتصاد',
  culture: 'ثقافة وفن',
  health: 'صحة',
  misc: 'منوعات'
};

export default async function handler(req, res) {
  const { category } = req.query;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).send("Missing Supabase credentials");
  }

  if (!category || !categoryNames[category]) {
    return res.status(404).send("Category not found");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const arabicCategory = categoryNames[category];

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, content, excerpt, created_at")
    .eq("category", arabicCategory)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return res.status(500).send("Error fetching data");
  }

  // 🔥 استخدم دومين موقعك الجديد
  const SITE_URL = "https://aljnoubvoice.com";

  const xmlItems = posts
    .map(post => `<item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/post/${post.id}</link>
      <description><![CDATA[${post.excerpt || post.content?.substring(0, 500) || post.title}]]></description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
    </item>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>الجنوب فويس - ${arabicCategory}</title>
    <link>${SITE_URL}</link>
    <description>آخر أخبار ${arabicCategory} من الجنوب فويس</description>
    <language>ar</language>
    ${xmlItems}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(xml);
}
