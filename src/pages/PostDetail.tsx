import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Facebook, Mail, Copy, MessageCircle, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import RelatedNews from "@/components/RelatedNews";

const PostDetail = () => {
  const { id } = useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, authors(id, name, image_url, bio)')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch additional media for this post
  const { data: additionalMedia = [] } = useQuery({
    queryKey: ['post-media', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_media')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Increment views on page load
  useEffect(() => {
    if (id) {
      supabase
        .from('posts')
        .select('views')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase
              .from('posts')
              .update({ views: (data.views || 0) + 1 })
              .eq('id', id)
              .then(() => {});
          }
        });
    }
  }, [id]);


  // Copy protection feature
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        const copiedText = selection.toString();
        const postUrl = window.location.href;
        const textWithSource = `${copiedText}\n\nاقرأ المزيد: ${postUrl}`;
        
        e.clipboardData?.setData('text/plain', textWithSource);
        e.preventDefault();
        
        toast.success("تم نسخ النص مع رابط المصدر");
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = days[date.getDay()];
    const dateFormatted = date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const time = date.toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `${dayName} – ${dateFormatted} – ${time}`;
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnX = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post?.title || '')}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(post?.title + ' ' + window.location.href)}`, '_blank');
  };

  const shareOnTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post?.title || '')}`, '_blank');
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(post?.title || '')}&body=${encodeURIComponent(window.location.href)}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("تم نسخ رابط الخبر");
  };

  // Video embed helper
  const getVideoEmbed = (url: string) => {
    if (!url) return null;
    
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) {
      return (
        <iframe 
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          className="w-full aspect-video rounded-lg"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      );
    }
    
    // Facebook
    if (url.includes('facebook.com')) {
      return (
        <iframe 
          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`}
          className="w-full aspect-video rounded-lg"
          allowFullScreen
        />
      );
    }

    // TikTok
    if (url.includes('tiktok.com')) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gray-100 rounded-lg text-center hover:bg-gray-200 transition">
          <i className="fab fa-tiktok text-4xl mb-2"></i>
          <p className="text-sm">شاهد الفيديو على TikTok</p>
        </a>
      );
    }

    // Instagram
    if (url.includes('instagram.com')) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-center text-white hover:opacity-90 transition">
          <i className="fab fa-instagram text-4xl mb-2"></i>
          <p className="text-sm">شاهد على Instagram</p>
        </a>
      );
    }

    // X/Twitter
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-black rounded-lg text-center text-white hover:bg-gray-800 transition">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <p className="text-sm">شاهد على X</p>
        </a>
      );
    }
    
    // Generic link
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-southBlue rounded-lg text-center text-white hover:bg-southLight transition">
        <i className="fas fa-external-link-alt text-2xl mb-2"></i>
        <p className="text-sm">شاهد الفيديو</p>
      </a>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-southGray">
        <Header />
        <Navbar />
        <Ticker />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-southBlue"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-southGray">
        <Header />
        <Navbar />
        <Ticker />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">الخبر غير موجود</h2>
            <Link to="/" className="text-southBlue hover:text-accentRed">
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const author = (post as any).authors;

  // Get absolute URL for sharing
  const currentUrl = window.location.href;
  const siteUrl = window.location.origin;
  const absoluteImageUrl = post.image_url?.startsWith('http') 
    ? post.image_url 
    : `${siteUrl}${post.image_url}`;

  return (
    <div className="min-h-screen bg-southGray">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{post.meta_title || post.title} | الجنوب فويس</title>
        <meta name="title" content={post.meta_title || post.title} />
        <meta name="description" content={post.meta_description || post.excerpt || post.title} />
        {post.keywords && post.keywords.length > 0 && (
          <meta name="keywords" content={post.keywords.join(', ')} />
        )}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt || post.title} />
        {absoluteImageUrl && <meta property="og:image" content={absoluteImageUrl} />}
        {absoluteImageUrl && <meta property="og:image:secure_url" content={absoluteImageUrl} />}
        {absoluteImageUrl && <meta property="og:image:type" content="image/jpeg" />}
        {absoluteImageUrl && <meta property="og:image:width" content="1200" />}
        {absoluteImageUrl && <meta property="og:image:height" content="630" />}
        <meta property="og:site_name" content="الجنوب فويس | South Voice" />
        <meta property="og:locale" content="ar_AR" />
        {post.created_at && <meta property="article:published_time" content={post.created_at} />}
        {post.updated_at && <meta property="article:modified_time" content={post.updated_at} />}
        {post.category && <meta property="article:section" content={post.category} />}
        {post.tags && post.tags.map((tag: string) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={post.meta_title || post.title} />
        <meta name="twitter:description" content={post.meta_description || post.excerpt || post.title} />
        {absoluteImageUrl && <meta name="twitter:image" content={absoluteImageUrl} />}
        <meta name="twitter:site" content="@aljanoubvoice" />
        <meta name="twitter:creator" content="@aljanoubvoice" />
        
        {/* Additional SEO */}
        <link rel="canonical" href={currentUrl} />
      </Helmet>

      <Header />
      <Navbar />
      <Ticker />

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Source badge */}
        {post.source && (
          <div className="mb-2">
            <span className="text-xs text-gray-500 font-medium">
              {post.source}
            </span>
          </div>
        )}

        {/* Category badge */}
        <div className="mb-4">
          <span className="inline-block bg-southBlue text-white px-4 py-2 rounded text-sm font-bold">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-southBlue leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta info */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-gray-600 text-sm border-r-4 border-accentRed pr-3">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(post.created_at || '')}
          </span>
          {post.views !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views} مشاهدة
            </span>
          )}
          {post.reading_time && (
            <span>{post.reading_time} دقائق للقراءة</span>
          )}
        </div>

        {/* Author info for opinions */}
        {author && post.category === "آراء واتجاهات" && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm flex items-center gap-4">
            <img 
              src={author.image_url || "https://placehold.co/100x100/ccc/333?text=كاتب"} 
              alt={author.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-southBlue"
            />
            <div>
              <p className="text-sm text-gray-500">بقلم</p>
              <h4 className="font-bold text-southBlue text-lg">{author.name}</h4>
              {author.bio && <p className="text-sm text-gray-600">{author.bio}</p>}
            </div>
          </div>
        )}

        {/* Main image */}
        {post.image_url && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* External video embed */}
        {post.external_video_url && (
          <div className="mb-8">
            {getVideoEmbed(post.external_video_url)}
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <div className="mb-6 p-4 bg-white rounded-lg border-r-4 border-southBlue">
            <p className="text-lg text-gray-700 font-semibold leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        )}

        {/* Full content */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
          <div 
            className="prose prose-lg max-w-none text-gray-800"
            style={{ 
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8',
            }}
          >
            {post.content.split('\n').map((paragraph: string, index: number) => (
              paragraph.trim() ? (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ) : (
                <br key={index} />
              )
            ))}
          </div>

          {/* Additional Media */}
          {additionalMedia.length > 0 && (
            <div className="mt-8 space-y-4">
              {additionalMedia.map((media) => (
                <div key={media.id} className="rounded-lg overflow-hidden">
                  {media.media_type === 'video' ? (
                    <video 
                      src={media.media_url} 
                      controls 
                      className="w-full max-h-[500px] object-contain bg-black"
                    >
                      المتصفح لا يدعم تشغيل الفيديو
                    </video>
                  ) : (
                    <img 
                      src={media.media_url} 
                      alt="صورة إضافية" 
                      className="w-full h-auto object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Share buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-xl font-bold text-southBlue mb-4">شارك الخبر</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={shareOnFacebook}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Facebook size={20} />
              <span>فيسبوك</span>
            </button>

            <button
              onClick={shareOnX}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>X</span>
            </button>

            <button
              onClick={shareOnWhatsApp}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              <MessageCircle size={20} />
              <span>واتساب</span>
            </button>

            <button
              onClick={shareOnTelegram}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              <span>تيليجرام</span>
            </button>

            <button
              onClick={shareViaEmail}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Mail size={20} />
              <span>البريد</span>
            </button>

            <button
              onClick={copyLink}
              className="flex items-center gap-2 bg-southBlue hover:bg-southBlue/90 text-white px-4 py-2 rounded-lg transition"
            >
              <Copy size={20} />
              <span>نسخ الرابط</span>
            </button>
          </div>
        </div>

        {/* Back to home link */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-block bg-southBlue hover:bg-southBlue/90 text-white px-6 py-3 rounded-lg transition font-bold"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </article>

      {/* Related News Section */}
      <RelatedNews currentPostId={post.id} category={post.category} />

      <Footer />
    </div>
  );
};

export default PostDetail;