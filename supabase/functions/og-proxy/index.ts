import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const postId = url.searchParams.get('id')

    if (!postId) {
      return new Response('Post ID is required', { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: post, error } = await supabase
      .from('posts')
      .select('*, authors(id, name, image_url, bio)')
      .eq('id', postId)
      .maybeSingle()

    if (error || !post) {
      return new Response('Post not found', { status: 404 })
    }

    // الموقع الرسمي
    const siteUrl = 'https://aljnoubvoice.com'
    const postUrl = `${siteUrl}/post/${postId}`

    // معالجة رابط الصورة
    let absoluteImageUrl = ''
    if (post.image_url) {
      if (post.image_url.startsWith('http')) {
        absoluteImageUrl = post.image_url.replace('http://', 'https://')
      } else if (post.image_url.includes('supabase.co')) {
        absoluteImageUrl = `https://${post.image_url}`
      } else {
        absoluteImageUrl = `${siteUrl}${post.image_url.startsWith('/') ? '' : '/'}${post.image_url}`
      }
    }

    const title = post.meta_title || post.title
    const description = post.meta_description || post.excerpt || post.title.substring(0, 160)

    const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} | الجنوب فويس</title>
    <meta name="description" content="${description}" />

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    ${absoluteImageUrl ? `
    <meta property="og:image" content="${absoluteImageUrl}" />
    <meta property="og:image:secure_url" content="${absoluteImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    ` : ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${postUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    ${absoluteImageUrl ? `<meta name="twitter:image" content="${absoluteImageUrl}" />` : ''}

    <!-- Telegram -->
    ${absoluteImageUrl ? `<link rel="image_src" href="${absoluteImageUrl}" />` : ''}

    <link rel="canonical" href="${postUrl}" />

    <!-- Redirect -->
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
