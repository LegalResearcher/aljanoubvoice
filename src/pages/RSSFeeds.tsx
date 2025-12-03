import { Rss, Copy, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const rssFeeds = [
  { name: "الرئيسي (جميع الأخبار)", slug: "", url: "https://aljnoubvoice.com/api/rss" },
  { name: "أخبار عدن", slug: "aden", url: "https://aljnoubvoice.com/api/rss/aden" },
  { name: "أخبار محلية", slug: "local", url: "https://aljnoubvoice.com/api/rss/local" },
  { name: "أخبار وتقارير", slug: "reports", url: "https://aljnoubvoice.com/api/rss/reports" },
  { name: "اليمن في الصحافة", slug: "press", url: "https://aljnoubvoice.com/api/rss/press" },
  { name: "شؤون دولية", slug: "intl", url: "https://aljnoubvoice.com/api/rss/intl" },
  { name: "آراء واتجاهات", slug: "opinions", url: "https://aljnoubvoice.com/api/rss/opinions" },
  { name: "علوم وتكنولوجيا", slug: "tech", url: "https://aljnoubvoice.com/api/rss/tech" },
  { name: "رياضة", slug: "sports", url: "https://aljnoubvoice.com/api/rss/sports" },
  { name: "فيديو", slug: "video", url: "https://aljnoubvoice.com/api/rss/video" },
  { name: "اقتصاد", slug: "economy", url: "https://aljnoubvoice.com/api/rss/economy" },
  { name: "ثقافة وفن", slug: "culture", url: "https://aljnoubvoice.com/api/rss/culture" },
  { name: "صحة", slug: "health", url: "https://aljnoubvoice.com/api/rss/health" },
  { name: "منوعات", slug: "misc", url: "https://aljnoubvoice.com/api/rss/misc" },
];

const RSSFeeds = () => {
  const { toast } = useToast();

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "تم نسخ رابط RSS",
        description: "يمكنك الآن لصق الرابط في قارئ RSS الخاص بك",
      });
    } catch (err) {
      toast({
        title: "حدث خطأ",
        description: "لم يتم نسخ الرابط",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-southLight" dir="rtl">
      <Helmet>
        <title>خلاصات RSS - الجنوب فويس</title>
        <meta name="description" content="اشترك في خلاصات RSS للجنوب فويس وتابع آخر الأخبار من جميع الأقسام" />
      </Helmet>
      
      <Header />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-southBlue text-white px-6 py-3 rounded-full mb-4">
            <Radio className="w-6 h-6" />
            <h1 className="text-2xl md:text-3xl font-bold">خلاصات RSS – الجنوب فويس</h1>
          </div>
          <p className="text-southGray max-w-2xl mx-auto">
            اشترك في خلاصات RSS للبقاء على اطلاع بآخر الأخبار والتقارير. انسخ رابط القسم المطلوب وأضفه إلى قارئ RSS المفضل لديك.
          </p>
        </div>

        {/* RSS Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rssFeeds.map((feed) => (
            <Card 
              key={feed.slug || "main"} 
              className="bg-white border border-gray-200 hover:shadow-lg hover:border-southBlue/30 transition-all duration-300"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Rss className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{feed.name}</h3>
                    <p className="text-xs text-gray-500 truncate" dir="ltr">{feed.url}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={feed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-southBlue text-white text-center py-2 px-3 rounded-lg text-sm font-medium hover:bg-southBlue/90 transition"
                  >
                    فتح RSS
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(feed.url)}
                    className="flex items-center gap-1 border-gray-300 hover:bg-gray-100"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">نسخ</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-10 bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Rss className="w-5 h-5 text-orange-500" />
            ما هي خلاصات RSS؟
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            RSS (Really Simple Syndication) هي تقنية تتيح لك متابعة آخر الأخبار من مواقعك المفضلة دون الحاجة لزيارتها يدوياً. 
            يمكنك استخدام تطبيقات قراءة RSS مثل Feedly أو Inoreader للاشتراك في خلاصاتنا والحصول على التحديثات فور نشرها.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RSSFeeds;
