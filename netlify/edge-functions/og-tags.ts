import { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  // Check if request is from Facebook or Telegram bot
  const userAgent = request.headers.get('user-agent') || '';
  const isSocialBot = /facebookexternalhit|Facebot|facebookcatalog|FacebookBot|TelegramBot/i.test(userAgent);
  
  // If not a social bot, continue to the normal page
  if (!isSocialBot) {
    return context.next();
  }
  
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Extract post ID from URL
  const postMatch = pathname.match(/^\/post\/([^\/]+)/);
  const postId = postMatch ? postMatch[1] : null;
  
  // Default meta tags
  let title = 'الجنوب فويس | South Voice';
  let description = 'آخر أخبار اليمن والجنوب - أخبار عدن، محلية، دولية، رياضة، تقنية، وأكثر';
  let image = 'https://aljanoubvoice.vercel.app/sail-logo.png';
  let pageUrl = `https://aljanoubvoice.vercel.app${pathname}`;
  let type = 'website';
  
  // If it's a post page, fetch post data
  if (postId) {
    try {
      const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || 'https://qajnvzxmijetcldztkwl.supabase.co';
      const supabaseKey = Deno.env.get('VITE_SUPABASE_PUBLISHABLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFham52enhtaWpldGNsZHp0a3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDcwMjUsImV4cCI6MjA3OTMyMzAyNX0.AZSCNxPO9xOeII9FxsRqPlnbgh5rBnMutK0lG2MB55Y';
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/posts?id=eq.${postId}&select=*,authors(id,name,image_url,bio)`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      
      const posts = await response.json();
      const post = posts && posts.length > 0 ? posts[0] : null;
      
      if (post) {
        title = post.meta_title || post.title;
        description = post.meta_description || post.excerpt || post.title.substring(0, 160);
        type = 'article';
        
        // Handle image URL - make it absolute with HTTPS
        if (post.image_url) {
          if (post.image_url.startsWith('http://') || post.image_url.startsWith('https://')) {
            image = post.image_url.replace('http://', 'https://');
          } else if (post.image_url.includes('supabase.co')) {
            image = post.image_url.startsWith('https://') ? post.image_url : `https://${post.image_url}`;
          } else {
            image = `https://aljanoubvoice.vercel.app${post.image_url.startsWith('/') ? '' : '/'}${post.image_url}`;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  }
  
  // Generate HTML with Open Graph tags
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:site_name" content="الجنوب فويس | South Voice" />
  <meta property="og:locale" content="ar_AR" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${pageUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${title}" />
  <meta name="twitter:site" content="@aljanoubvoice" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${pageUrl}" />
  
  <!-- Redirect to actual page -->
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
  <script>window.location.href = '${pageUrl}';</script>
</head>
<body>
  <p>جارٍ إعادة التوجيه إلى <a href="${pageUrl}">${title}</a>...</p>
</body>
</html>`;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
