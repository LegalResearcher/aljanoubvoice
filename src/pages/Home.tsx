import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Featured posts for slider
  const featuredPosts = posts.filter(post => post.featured).slice(0, 10);
  const sliderSlides = featuredPosts.length >= 10 ? featuredPosts.map(post => ({
    id: post.id,
    title: post.title,
    category: post.category,
    image: post.image_url || 'https://placehold.co/1200x800/1A2B49/FFF?text=' + post.category,
    categoryColor: getCategoryColor(post.category)
  })) : [
    {
      id: 1,
      title: "مراقب إقتصادي: ماهو موقف البنك المركزي في عدن على فرض عقوبات الخزانة الأمريكية",
      category: "اقتصاد",
      image: "https://placehold.co/1200x800/1A2B49/FFF?text=البنك+المركزي",
      categoryColor: "bg-accentRed"
    },
    {
      id: 2,
      title: "اجتماع موسع في العاصمة عدن يناقش خطة الطوارئ لتحسين الخدمات الأساسية",
      category: "أخبار عدن",
      image: "https://placehold.co/1200x800/2c3e50/FFF?text=عدن",
      categoryColor: "bg-southBlue"
    },
    {
      id: 3,
      title: "انخفاض أسعار المشتقات النفطية في الأسواق المحلية بعد وصول شحنات جديدة",
      category: "اقتصاد",
      image: "https://placehold.co/1200x800/16a34a/FFF?text=النفط",
      categoryColor: "bg-green-600"
    },
    {
      id: 4,
      title: "الكشف عن خطة حكومية شاملة لمكافحة الفساد في المؤسسات العامة",
      category: "أخبار وتقارير",
      image: "https://placehold.co/1200x800/dc2626/FFF?text=مكافحة+الفساد",
      categoryColor: "bg-accentRed"
    },
    {
      id: 5,
      title: "وحدة عدن يتوج بكأس البطولة بعد فوزه في مباراة الديربي الحاسمة",
      category: "رياضة",
      image: "https://placehold.co/1200x800/059669/FFF?text=رياضة",
      categoryColor: "bg-emerald-600"
    },
    {
      id: 6,
      title: "إطلاق مشروع رقمي ضخم لتحديث منظومة التعليم في المحافظات الجنوبية",
      category: "علوم وتكنولوجيا",
      image: "https://placehold.co/1200x800/7c3aed/FFF?text=تعليم+رقمي",
      categoryColor: "bg-purple-600"
    },
    {
      id: 7,
      title: "المبعوث الأممي يصل صنعاء في زيارة لبحث تجديد الهدنة وفتح المعابر",
      category: "شؤون دولية",
      image: "https://placehold.co/1200x800/ea580c/FFF?text=الأمم+المتحدة",
      categoryColor: "bg-orange-600"
    },
    {
      id: 8,
      title: "افتتاح مهرجان عدن الثقافي السنوي بحضور شخصيات فنية وأدبية بارزة",
      category: "ثقافة وفن",
      image: "https://placehold.co/1200x800/8b5cf6/FFF?text=ثقافة",
      categoryColor: "bg-violet-600"
    },
    {
      id: 9,
      title: "حملة صحية واسعة للتوعية بأهمية التطعيمات في المدارس والمراكز الصحية",
      category: "صحة",
      image: "https://placehold.co/1200x800/0891b2/FFF?text=صحة",
      categoryColor: "bg-cyan-600"
    },
    {
      id: 10,
      title: "تنظيم معرض فني كبير يستعرض تراث وحضارة الجنوب عبر العصور",
      category: "منوعات",
      image: "https://placehold.co/1200x800/ec4899/FFF?text=تراث",
      categoryColor: "bg-pink-600"
    }
  ];

  // Posts by category
  const adenPosts = posts.filter(post => post.category === "أخبار عدن").slice(0, 4);
  const localPosts = posts.filter(post => post.category === "أخبار محلية").slice(0, 4);
  const reportsPosts = posts.filter(post => post.category === "أخبار وتقارير").slice(0, 2);
  const pressPosts = posts.filter(post => post.category === "اليمن في الصحافة").slice(0, 3);
  const intlPosts = posts.filter(post => post.category === "شؤون دولية").slice(0, 2);
  const opinionsPosts = posts.filter(post => post.category === "آراء واتجاهات").slice(0, 2);
  const techPosts = posts.filter(post => post.category === "علوم وتكنولوجيا").slice(0, 1);
  const sportsPosts = posts.filter(post => post.category === "رياضة").slice(0, 1);

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
            <a href="/aden" className="text-sm text-gray-500 hover:text-accentRed">
              المزيد <i className="fas fa-angle-left"></i>
            </a>
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
                />
                <div className="lg:col-span-4 flex flex-col gap-4">
                  {adenPosts.slice(1, 4).map(post => (
                    <NewsCard
                      key={post.id}
                      variant="sidebar"
                      title={post.title}
                      image={post.image_url || 'https://placehold.co/150x150/2c3e50/fff'}
                      category={post.category}
                      timeAgo="منذ ساعة"
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <NewsCard
                  variant="hero"
                  title="اجتماع موسع في العاصمة عدن لمناقشة سبل تحسين الخدمات الأساسية"
                  excerpt="ترأس محافظ العاصمة عدن صباح اليوم اجتماعاً استثنائياً ضم مدراء المكاتب التنفيذية..."
                  image="https://placehold.co/800x600/1A2B49/FFF?text=عدن+اليوم"
                  category="هام"
                  categoryColor="bg-accentRed"
                />
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <NewsCard
                    variant="sidebar"
                    title="توضيح هام من مكتب التربية والتعليم حول موعد الامتحانات النهائية"
                    image="https://placehold.co/150x150/2c3e50/fff"
                    category="أخبار عدن"
                    timeAgo="منذ ساعة"
                  />
                  <NewsCard
                    variant="sidebar"
                    title="صندوق النظافة يدشن حملة واسعة في مديرية المنصورة"
                    image="https://placehold.co/150x150/2c3e50/fff"
                    category="أخبار عدن"
                    timeAgo="منذ ساعتين"
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* Local News Grid */}
        <section id="local">
          <div className="flex items-center justify-between mb-4 border-r-4 border-southBlue pr-3">
            <h2 className="text-2xl font-bold text-southBlue">أخبار محلية</h2>
            <a href="/local" className="text-sm text-gray-500 hover:text-accentRed">
              المزيد <i className="fas fa-angle-left"></i>
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {localPosts.length > 0 ? (
              localPosts.map(post => (
                <NewsCard
                  key={post.id}
                  title={post.title}
                  image={post.image_url || 'https://placehold.co/400x300/333/fff'}
                  category={post.category}
                  categoryColor="text-accentRed"
                />
              ))
            ) : (
              <>
                <NewsCard
                  title="تدشين مشروع الطاقة الشمسية في المكلا"
                  image="https://placehold.co/400x300/333/fff?text=حضرموت"
                  category="حضرموت"
                  categoryColor="text-accentRed"
                />
                <NewsCard
                  title="القبائل تؤكد وقوفها صفاً واحداً لحفظ الأمن"
                  image="https://placehold.co/400x300/333/fff?text=أبين"
                  category="أبين"
                  categoryColor="text-accentRed"
                />
                <NewsCard
                  title="افتتاح سوق تجاري جديد في عتق"
                  image="https://placehold.co/400x300/333/fff?text=شبوة"
                  category="شبوة"
                  categoryColor="text-accentRed"
                />
                <NewsCard
                  title="محافظ لحج يتفقد سير العمل في طريق الوهط"
                  image="https://placehold.co/400x300/333/fff?text=لحج"
                  category="لحج"
                  categoryColor="text-accentRed"
                />
              </>
            )}
          </div>
        </section>

        {/* Reports and Press */}
        <section id="reports" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 border-r-4 border-southBlue pr-3">
              <h2 className="text-2xl font-bold text-southBlue">أخبار وتقارير</h2>
              <a href="/reports" className="text-sm text-gray-500 hover:text-accentRed">
                المزيد <i className="fas fa-angle-left"></i>
              </a>
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
                  />
                ))
              ) : (
                <>
                  <NewsCard
                    variant="list"
                    title="في ذكرى التأسيس.. قراءة سياسية في مسار القضية الجنوبية والمكاسب المحققة"
                    excerpt="يستعرض هذا التقرير أهم المحطات التاريخية التي مرت بها القضية الجنوبية..."
                    image="https://placehold.co/300x200/555/fff?text=تقرير+سياسي"
                    category="ملفات خاصة"
                  />
                  <NewsCard
                    variant="list"
                    title="تدهور العملة المحلية.. أسباب اقتصادية أم ضغوطات سياسية؟"
                    excerpt="تشهد العملة المحلية تراجعاً مستمراً أمام العملات الأجنبية..."
                    image="https://placehold.co/300x200/555/fff?text=تقرير+اقتصادي"
                    category="اقتصاد"
                  />
                </>
              )}
            </div>
          </div>

          {/* Press Coverage Sidebar */}
          <div id="press" className="lg:col-span-1">
            <div className="bg-white p-4 rounded shadow border-t-4 border-gray-600 h-full">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-xl font-bold text-southBlue">اليمن في الصحافة</h2>
                <a href="/press" className="text-sm text-gray-500 hover:text-accentRed">
                  المزيد <i className="fas fa-angle-left"></i>
                </a>
              </div>
              <div className="space-y-4">
                <div className="group">
                  <span className="text-xs text-accentRed font-bold block mb-1">الشرق الأوسط</span>
                  <a href="#" className="font-bold text-sm text-gray-800 leading-6 group-hover:text-southBlue block">
                    "المبعوث الأممي يكثف تحركاته لتمديد الهدنة وفتح المعابر..."
                  </a>
                </div>
                <div className="border-t border-gray-100 pt-3 group">
                  <span className="text-xs text-accentRed font-bold block mb-1">الجارديان البريطانية</span>
                  <a href="#" className="font-bold text-sm text-gray-800 leading-6 group-hover:text-southBlue block">
                    "تقرير دولي يحذر من تداعيات انعدام الأمن الغذائي..."
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* International and Opinions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section id="intl" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 border-r-4 border-southBlue pr-3">
              <h2 className="text-2xl font-bold text-southBlue">شؤون دولية</h2>
              <a href="/intl" className="text-sm text-gray-500 hover:text-accentRed">
                المزيد <i className="fas fa-angle-left"></i>
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative rounded overflow-hidden">
                <img src="https://placehold.co/400x300/444/fff" className="w-full h-40 object-cover brightness-75 hover:brightness-100 transition" alt="دولي" />
                <h3 className="absolute bottom-0 p-3 text-white font-bold text-sm bg-gradient-to-t from-black/80 to-transparent w-full">
                  تطورات الأزمة الأوكرانية والموقف الأوروبي
                </h3>
              </div>
              <div className="relative rounded overflow-hidden">
                <img src="https://placehold.co/400x300/444/fff" className="w-full h-40 object-cover brightness-75 hover:brightness-100 transition" alt="دولي" />
                <h3 className="absolute bottom-0 p-3 text-white font-bold text-sm bg-gradient-to-t from-black/80 to-transparent w-full">
                  انتخابات الرئاسة الأمريكية.. السباق يبدأ مبكراً
                </h3>
              </div>
            </div>
          </section>

          <section id="opinions" className="lg:col-span-1">
            <div className="bg-southBlue text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">آراء واتجاهات</h2>
                <a href="/opinions" className="text-sm text-gray-300 hover:text-white">
                  المزيد <i className="fas fa-angle-left"></i>
                </a>
              </div>
            </div>
            <div className="bg-white p-4 rounded-b-lg shadow border border-gray-200 space-y-4">
              <div className="flex items-center gap-3">
                <img src="https://placehold.co/100x100/ccc/333?text=كاتب" className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" alt="كاتب" />
                <div>
                  <h4 className="font-bold text-southBlue text-sm hover:text-accentRed cursor-pointer">
                    عدن.. استحقاقات المرحلة
                  </h4>
                  <span className="text-xs text-gray-500">بقلم: صالح محمد</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Tech and Sports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section id="tech">
            <div className="flex items-center justify-between mb-4 border-r-4 border-purple-600 pr-3">
              <h2 className="text-2xl font-bold text-southBlue">علوم وتكنولوجيا</h2>
              <a href="/tech" className="text-sm text-gray-500 hover:text-purple-600">
                المزيد <i className="fas fa-angle-left"></i>
              </a>
            </div>
            <div className="flex gap-4 bg-white p-3 rounded shadow">
              <img src="https://placehold.co/150x150/6b21a8/fff" className="w-32 h-24 object-cover rounded" alt="تكنولوجيا" />
              <div>
                <h3 className="font-bold text-sm text-gray-800 mb-2">
                  أحدث تسريبات آيفون 16.. المواصفات والسعر المتوقع
                </h3>
                <span className="text-xs text-purple-600 font-semibold">تكنولوجيا</span>
              </div>
            </div>
          </section>

          <section id="sports">
            <div className="flex items-center justify-between mb-4 border-r-4 border-green-600 pr-3">
              <h2 className="text-2xl font-bold text-southBlue">رياضة</h2>
              <a href="/sports" className="text-sm text-gray-500 hover:text-green-600">
                المزيد <i className="fas fa-angle-left"></i>
              </a>
            </div>
            <div className="flex gap-4 bg-white p-3 rounded shadow">
              <img src="https://placehold.co/150x150/16a34a/fff" className="w-32 h-24 object-cover rounded" alt="رياضة" />
              <div>
                <h3 className="font-bold text-sm text-gray-800 mb-2">
                  وحدة عدن يحسم ديربي العاصمة ويفوز بكأس البطولة
                </h3>
                <span className="text-xs text-green-600 font-semibold">رياضة محلية</span>
              </div>
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
            <a href="/video" className="text-gray-300 hover:text-white text-sm">
              المزيد <i className="fas fa-angle-left"></i>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-700 flex items-center justify-center relative group cursor-pointer">
                <img src="https://placehold.co/800x450/000/fff?text=فيديو+رئيسي" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition" alt="فيديو" />
                <i className="fas fa-play-circle text-6xl text-white absolute opacity-90 group-hover:scale-110 transition"></i>
              </div>
              <h3 className="text-white font-bold text-xl mt-4">
                جولة خاصة للكاميرا في أسواق عدن القديمة ورصد آراء المواطنين
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 bg-southLight/50 p-2 rounded hover:bg-southLight cursor-pointer transition">
                <div className="w-24 h-16 bg-black relative flex-shrink-0">
                  <img src="https://placehold.co/150x100/000/fff" className="w-full h-full object-cover opacity-80" alt="فيديو" />
                  <i className="fas fa-play text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                </div>
                <div className="text-white text-sm font-semibold">
                  تقرير مصور: معاناة الصيادين في ساحل أبين
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
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
    "فيديو": "bg-indigo-600"
  };
  return colors[category] || "bg-accentRed";
}

export default Home;
