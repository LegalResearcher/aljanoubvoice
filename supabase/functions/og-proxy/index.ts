import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const postId = url.searchParams.get('id')

    if (!postId) {
      return new Response('Post ID is required', { status: 400 })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch post data
    const { data: post, error } = await supabase
      .from('posts')
      .select('*, authors(id, name, image_url, bio)')
      .eq('id', postId)
      .maybeSingle()

    if (error || !post) {
      return new Response('Post not found', { status: 404 })
    }

    // Use the actual site URL, not the Edge Function URL
    const siteUrl = 'https://aljanoubvoice.vercel.app'
    const postUrl = `${siteUrl}/post/${postId}`

    // Prepare absolute image URL - force HTTPS
    let absoluteImageUrl = ''
    if (post.image_url) {
      if (post.image_url.startsWith('http://') || post.image_url.startsWith('https://')) {
        absoluteImageUrl = post.image_url.replace('http://', 'https://')
      } else if (post.image_url.includes('supabase.co')) {
        absoluteImageUrl = post.image_url.startsWith('https://') ? post.image_url : `https://${post.image_url}`
      } else {
        // Relative URL - make absolute with HTTPS
        absoluteImageUrl = `${siteUrl.replace('http://', 'https://')}${post.image_url.startsWith('/') ? '' : '/'}${post.image_url}`
      }
    }

    const title = post.meta_title || post.title
    const description = post.meta_description || post.excerpt || post.title.substring(0, 160)
    const author = post.authors
    
    console.log('Serving OG tags for post:', postId)
    console.log('Image URL:', absoluteImageUrl)
    console.log('Title:', title)

    // Generate HTML with Open Graph tags
    const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} | الجنوب فويس</title>
    <meta name="description" content="${description}" />
    ${post.keywords && post.keywords.length > 0 ? `<meta name="keywords" content="${post.keywords.join(', ')}" />` : ''}
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    ${absoluteImageUrl ? `
    <meta property="og:image" content="${absoluteImageUrl}" />
    <meta property="og:image:secure_url" content="${absoluteImageUrl}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${title}" />
    ` : ''}
    <meta property="og:site_name" content="الجنوب فويس | South Voice" />
    <meta property="og:locale" content="ar_AR" />
    ${post.created_at ? `<meta property="article:published_time" content="${post.created_at}" />` : ''}
    ${post.updated_at ? `<meta property="article:modified_time" content="${post.updated_at}" />` : ''}
    ${post.category ? `<meta property="article:section" content="${post.category}" />` : ''}
    ${post.tags ? post.tags.map((tag: string) => `<meta property="article:tag" content="${tag}" />`).join('\n    ') : ''}
    ${author ? `<meta property="article:author" content="${author.name}" />` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${postUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    ${absoluteImageUrl ? `
    <meta name="twitter:image" content="${absoluteImageUrl}" />
    <meta name="twitter:image:alt" content="${title}" />
    ` : ''}
    <meta name="twitter:site" content="@aljanoubvoice" />
    <meta name="twitter:creator" content="@aljanoubvoice" />
    
    <!-- Telegram specific -->
    <meta property="telegram:channel" content="@aljanoubvoice" />
    ${absoluteImageUrl ? `<link rel="image_src" href="${absoluteImageUrl}" />` : ''}
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${postUrl}" />
    
    <!-- Redirect to actual page after a moment -->
    <meta http-equiv="refresh" content="0;url=${postUrl}" />
  </head>
  <body>
    <script>window.location.href = "${postUrl}"</script>
  </body>
</html>`

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error in og-proxy:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
