import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // Parse the path to determine type and ID
    const { id, path } = req.query;
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).send('Configuration error');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Default meta tags
    let title = 'الجنوب فويس | South Voice';
    let description = 'آخر أخبار اليمن والجنوب - أخبار عدن، محلية، دولية، رياضة، تقنية، وأكثر';
    let image = 'https://aljanoubvoice.vercel.app/sail-logo.png';
    let url = 'https://aljanoubvoice.vercel.app';
    let type = 'website';
    
    // If it's a post page
    if (id) {
      const { data: post, error } = await supabase
        .from('posts')
        .select('*, authors(id, name, image_url, bio)')
        .eq('id', id)
        .maybeSingle();
      
      if (post && !error) {
        title = post.meta_title || post.title;
        description = post.meta_description || post.excerpt || post.title.substring(0, 160);
        url = `https://aljanoubvoice.vercel.app/post/${id}`;
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
  <meta property="og:url" content="${url}" />
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
  <meta name="twitter:url" content="${url}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${title}" />
  <meta name="twitter:site" content="@aljanoubvoice" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${url}" />
  
  <!-- Redirect to actual page -->
  <meta http-equiv="refresh" content="0;url=${url}">
  <script>window.location.href = '${url}';</script>
</head>
<body>
  <p>جارٍ إعادة التوجيه إلى <a href="${url}">${title}</a>...</p>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Error in og function:', error);
    res.status(500).send('Internal server error');
  }
}
