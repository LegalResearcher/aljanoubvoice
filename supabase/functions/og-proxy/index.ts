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

    // Get site URL from request
    const siteUrl = `${url.protocol}//${url.host}`
    const postUrl = `${siteUrl}/post/${postId}`

    // Prepare absolute image URL
    let absoluteImageUrl = ''
    if (post.image_url) {
      if (post.image_url.startsWith('http')) {
        absoluteImageUrl = post.image_url.replace('http://', 'https://')
      } else {
        absoluteImageUrl = `${siteUrl}${post.image_url.startsWith('/') ? '' : '/'}${post.image_url}`
      }
    }

    const title = post.meta_title || post.title
    const description = post.meta_description || post.excerpt || post.title
    const author = post.authors

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
