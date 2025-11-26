import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Ticker from "@/components/Ticker";
import NewsSlider from "@/components/NewsSlider";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";

const Home = () => {
  // Fetch posts from database
  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, authors(id, name, image_url)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Featured posts for slider
  const featuredPosts = posts.filter(post => post.featured).slice(0, 10);
  const sliderSlides = featuredPosts.length > 0 ? featuredPosts.map(post => ({
    id: post.id,
    title: post.title,
    category: post.category,
    image: post.image_url || 'https://placehold.co/1200x800/1A2B49/FFF?text=' + post.category,
    categoryColor: getCategoryColor(post.category)
  })) : [
    {
      id: "1",
      title: "مراقب إقتصادي: ماهو موقف البنك المركزي في عدن على فرض عقوبات الخزانة الأمريكية",
      category: "اقتصاد",
      image: "https://placehold.co/1200x800/1A2B49/FFF?text=البنك+المركزي",
      categoryColor: "bg-accentRed"
    },
    {
      id: "2",
      title: "اجتماع موسع في العاصمة عدن يناقش خطة الطوارئ لتحسين الخدمات الأساسية",
      category: "أخبار عدن",
      image: "https://placehold.co/1200x800/2c3e50/FFF?text=عدن",
      categoryColor: "bg-southBlue"
    }
  ];

  // Posts by category with correct limits
  const adenPosts = posts.filter(post => post.category === "أخبار عدن").slice(0, 5);
  const localPosts = posts.filter(post => post.category === "أخبار محلية").slice(0, 5);
  const reportsPosts = posts.filter(post => post.category === "أخبار وتقارير").slice(0, 5);
  const pressPosts = posts.filter(post => post.category === "اليمن في الصحافة").slice(0, 3);
  const intlPosts = posts.filter(post => post.category === "شؤون دولية").slice(0, 3);
  const opinionsPosts = posts.filter(post => post.category === "آراء واتجاهات").slice(0, 5);
  const techPosts = posts.filter(post => post.category === "علوم وتكنولوجيا").slice(0, 3);
  const sportsPosts = posts.filter(post => post.category === "رياضة").slice(0, 3);
  const videoPosts = posts.filter(post => post.category === "فيديو").slice(0, 4);

  return (
    <div className="min-h-screen bg-southGray">
      <Header />
      <Navbar />
      <Ticker />

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Main Slider */}
        <NewsSlider slides={sliderSlides} />

        {/* Aden News Section */}
        <section id="aden">
          <div className="flex items-center justify-between mb-4 border-r-4 border-southBlue pr-3">
            <h2 className="text-2xl md:text-3xl font-bold text-southBlue">أخبار عدن</h2>
            <Link to="/aden" className="text-sm text-gray-500 hover:text-accentRed">
              المزيد <i className="fas fa-angle-left"></i>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {adenPosts.length > 0 ? (
              <>
                <NewsCard
                  variant="hero"
                  title={adenPosts[0].title}
                  excerpt={adenPosts[0].excerpt}
                  image={adenPosts[0].image_url || 'https://placehold.co/800x600/1A2B49/FFF?text=عدن'}
                  category="هام"
                  categoryColor="bg-accentRed"
                  postId={adenPosts[0].id}
                />
                <div className="lg:col-span-4 flex flex-col gap-4">
                  {adenPosts.slice(1, 5).map(post => (
                    <NewsCard
                      key={post.id}
                      variant="sidebar"
                      title={post.title}
                      image={post.image_url || 'https://placehold.co/150x150/2c3e50/fff'}
                      category={post.category}
                      timeAgo="منذ ساعة"
                      postId={post.id}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="lg:col-span-12 text-center py-8 text-gray-500">
                لا توجد أخبار في هذا القسم
              </div>
            )}
          </div>
        </section>

        {/* Local News Grid */}
        <section id="local">
          <div className="flex items-center justify-between mb-4 border-r-4 border-southBlue pr-3">
            <h2 className="text-2xl font-bold text-southBlue">أخبار محلية</h2>
            <Link to="/local" className="text-sm text-gray-500 hover:text-accentRed">
              المزيد <i className="fas fa-angle-left"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {localPosts.length > 0 ? (
              localPosts.map(post => (
                <NewsCard
                  key={post.id}
                  title={post.title}
                  image={post.image_url || 'https://placehold.co/400x300/333/fff'}
                  category={post.category}
                  categoryColor="text-accentRed"
                  postId={post.id}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                لا توجد أخبار في هذا القسم
              </div>
            )}
          </div>
        </section>

        {/* Reports and Press */}
        <section id="reports" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 border-r-4 border-southBlue pr-3">
              <h2 className="text-2xl font-bold text-southBlue">أخبار وتقارير</h2>
              <Link to="/reports" className="text-sm text-gray-500 hover:text-accentRed">
                المزيد <i className="fas fa-angle-left"></i>
              </Link>
            </div>
            <div className="space-y-4">
              {reportsPosts.length > 0 ? (
                reportsPosts.map(post => (
                  <NewsCard
                    key={post.id}
                    variant="list"
                    title={post.title}
                    excerpt={post.excerpt}
                    image={post.image_url || 'https://placehold.co/300x200/555/fff'}
                    category={post.category}
                    postId={post.id}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد أخبار في هذا القسم
                </div>
              )}
            </div>
          </div>

          {/* Press Coverage Sidebar */}
          <div id="press" className="lg:col-span-1">
            <div className="bg-white p-4 rounded shadow border-t-4 border-gray-600 h-full">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-xl font-bold text-southBlue">اليمن في الصحافة</h2>
                <Link to="/press" className="text-sm text-gray-500 hover:text-accentRed">
                  المزيد <i className="fas fa-angle-left"></i>
                </Link>
              </div>
              <div className="space-y-4">
                {pressPosts.length > 0 ? (
                  pressPosts.map(post => (
                    <div key={post.id} className="group border-b border-gray-100 pb-3 last:border-b-0">
                      <span className="text-xs text-accentRed font-bold block mb-1">{post.source || 'مصدر خارجي'}</span>
                      <Link to={`/post/${post.id}`} className="font-bold text-sm text-gray-800 leading-6 group-hover:text-southBlue block">
                        {post.title}
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    لا توجد أخبار
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* International and Opinions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section id="intl" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 border-r-4 border-southBlue pr-3">
              <h2 className="text-2xl font-bold text-southBlue">شؤون دولية</h2>
              <Link to="/intl" className="text-sm text-gray-500 hover:text-accentRed">
                المزيد <i className="fas fa-angle-left"></i>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {intlPosts.length > 0 ? (
                intlPosts.map(post => (
                  <Link key={post.id} to={`/post/${post.id}`} className="relative rounded overflow-hidden group">
                    <img src={post.image_url || "https://placehold.co/400x300/444/fff"} className="w-full h-40 object-cover brightness-75 group-hover:brightness-100 transition" alt={post.title} />
                    <h3 className="absolute bottom-0 p-3 text-white font-bold text-sm bg-gradient-to-t from-black/80 to-transparent w-full">
                      {post.title}
                    </h3>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  لا توجد أخبار في هذا القسم
                </div>
              )}
            </div>
          </section>

          {/* Opinions Section - Updated Design */}
          <section id="opinions" className="lg:col-span-1">
            <div className="bg-southBlue text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">آراء واتجاهات</h2>
                <Link to="/opinions" className="text-sm text-gray-300 hover:text-white">
                  المزيد <i className="fas fa-angle-left"></i>
                </Link>
              </div>
            </div>
            <div className="bg-white p-4 rounded-b-lg shadow border border-gray-200 space-y-4">
              {opinionsPosts.length > 0 ? (
                opinionsPosts.map(post => (
                  <Link key={post.id} to={`/post/${post.id}`} className="flex items-center gap-3 group">
                    <img 
                      src={(post as any).authors?.image_url || "https://placehold.co/100x100/ccc/333?text=كاتب"} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" 
                      alt={(post as any).authors?.name || post.author || "كاتب"} 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-southBlue text-sm group-hover:text-accentRed cursor-pointer truncate">
                        {post.title}
                      </h4>
                      <span className="text-xs text-gray-500">بقلم: {(post as any).authors?.name || post.author || "المحرر"}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  لا توجد مقالات
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Tech and Sports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section id="tech">
            <div className="flex items-center justify-between mb-4 border-r-4 border-purple-600 pr-3">
              <h2 className="text-2xl font-bold text-southBlue">علوم وتكنولوجيا</h2>
              <Link to="/tech" className="text-sm text-gray-500 hover:text-purple-600">
                المزيد <i className="fas fa-angle-left"></i>
              </Link>
            </div>
            <div className="space-y-4">
              {techPosts.length > 0 ? (
                techPosts.map(post => (
                  <Link key={post.id} to={`/post/${post.id}`} className="flex gap-4 bg-white p-3 rounded shadow hover:shadow-md transition">
                    <img src={post.image_url || "https://placehold.co/150x150/6b21a8/fff"} className="w-32 h-24 object-cover rounded flex-shrink-0" alt={post.title} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-800 mb-2 hover:text-purple-600 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <span className="text-xs text-purple-600 font-semibold">تكنولوجيا</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white p-4 rounded shadow text-center text-gray-500">
                  لا توجد أخبار
                </div>
              )}
            </div>
          </section>

          <section id="sports">
            <div className="flex items-center justify-between mb-4 border-r-4 border-green-600 pr-3">
              <h2 className="text-2xl font-bold text-southBlue">رياضة</h2>
              <Link to="/sports" className="text-sm text-gray-500 hover:text-green-600">
                المزيد <i className="fas fa-angle-left"></i>
              </Link>
            </div>
            <div className="space-y-4">
              {sportsPosts.length > 0 ? (
                sportsPosts.map(post => (
                  <Link key={post.id} to={`/post/${post.id}`} className="flex gap-4 bg-white p-3 rounded shadow hover:shadow-md transition">
                    <img src={post.image_url || "https://placehold.co/150x150/16a34a/fff"} className="w-32 h-24 object-cover rounded flex-shrink-0" alt={post.title} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-800 mb-2 hover:text-green-600 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <span className="text-xs text-green-600 font-semibold">رياضة</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white p-4 rounded shadow text-center text-gray-500">
                  لا توجد أخبار
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Video Section */}
      <section id="video" className="bg-southBlue py-12 mt-8 border-t-4 border-accentRed">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">
              <i className="fas fa-video text-accentRed ml-2"></i> فيديو الجنوب ڤويس
            </h2>
            <Link to="/video" className="text-gray-300 hover:text-white text-sm">
              المزيد <i className="fas fa-angle-left"></i>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {videoPosts.length > 0 ? (
              <>
                <div className="lg:col-span-2">
                  <Link to={`/post/${videoPosts[0].id}`} className="block">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-700 relative group cursor-pointer">
                      {videoPosts[0].external_video_url ? (
                        <VideoEmbed url={videoPosts[0].external_video_url} />
                      ) : videoPosts[0].image_url?.includes('mp4') || videoPosts[0].image_url?.includes('webm') ? (
                        <video src={videoPosts[0].image_url} className="w-full h-full object-cover" controls />
                      ) : (
                        <>
                          <img src={videoPosts[0].image_url || "https://placehold.co/800x450/000/fff?text=فيديو"} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition" alt={videoPosts[0].title} />
                          <i className="fas fa-play-circle text-6xl text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-90 group-hover:scale-110 transition"></i>
                        </>
                      )}
                    </div>
                  </Link>
                  <h3 className="text-white font-bold text-xl mt-4">
                    {videoPosts[0].title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {videoPosts.slice(1, 4).map(post => (
                    <Link key={post.id} to={`/post/${post.id}`} className="flex gap-3 bg-southLight/50 p-2 rounded hover:bg-southLight cursor-pointer transition">
                      <div className="w-24 h-16 bg-black relative flex-shrink-0 rounded overflow-hidden">
                        <img src={post.image_url || "https://placehold.co/150x100/000/fff"} className="w-full h-full object-cover opacity-80" alt={post.title} />
                        <i className="fas fa-play text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                      </div>
                      <div className="text-white text-sm font-semibold flex-1 min-w-0 line-clamp-2">
                        {post.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="lg:col-span-3 text-center py-8 text-gray-300">
                لا توجد فيديوهات
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Video Embed Component
const VideoEmbed = ({ url }: { url: string }) => {
  const getEmbedUrl = (url: string) => {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    
    // Facebook
    if (url.includes('facebook.com')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
    }
    
    return null;
  };

  const embedUrl = getEmbedUrl(url);
  
  if (embedUrl) {
    return (
      <iframe 
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    );
  }
  
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full bg-gray-900 text-white hover:text-accentRed transition">
      <i className="fas fa-external-link-alt text-4xl"></i>
    </a>
  );
};

// Helper function to get category colors
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "أخبار عدن": "bg-southBlue",
    "أخبار محلية": "bg-yellow-600",
    "أخبار وتقارير": "bg-accentRed",
    "اليمن في الصحافة": "bg-gray-600",
    "شؤون دولية": "bg-red-600",
    "آراء واتجاهات": "bg-blue-600",
    "علوم وتكنولوجيا": "bg-purple-600",
    "رياضة": "bg-green-600",
    "فيديو": "bg-indigo-600",
    "اقتصاد": "bg-emerald-600",
    "ثقافة وفن": "bg-violet-600",
    "صحة": "bg-cyan-600",
    "منوعات": "bg-pink-600",
    "عاجل": "bg-accentRed"
  };
  return colors[category] || "bg-accentRed";
}

export default Home;