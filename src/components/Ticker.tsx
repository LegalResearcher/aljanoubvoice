import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Ticker = () => {
  // Fetch breaking news from "عاجل" category
  const { data: breakingNews = [] } = useQuery({
    queryKey: ['breaking-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title')
        .eq('category', 'عاجل')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  // Fallback news items if no breaking news
  const defaultNewsItems = [
    { id: "1", title: "مصدر مسؤول في كهرباء عدن: وصول شحنة وقود جديدة إلى ميناء الزيت وتشغيل محطة الرئيس خلال ساعات" },
    { id: "2", title: "البنك المركزي يُصدر تعميماً هاماً لشركات الصرافة لضبط أسعار الصرف" },
    { id: "3", title: "قوات الأمن تحبط محاولة تهريب في المنفذ الشمالي للعاصمة" }
  ];

  const newsItems = breakingNews.length > 0 ? breakingNews : defaultNewsItems;

  return (
    <div className="bg-white border-b border-gray-200 py-2 shadow-sm">
      <div className="container mx-auto px-4 flex items-center">
        <div className="bg-accentRed text-white text-xs font-bold px-3 py-1 rounded ml-3 whitespace-nowrap animate-pulse">
          عاجـل
        </div>
        <div className="ticker-wrap overflow-hidden flex-1">
          <div className="ticker text-sm font-semibold text-southBlue">
            {newsItems.map((item, index) => (
              <span key={item.id}>
                <Link 
                  to={`/post/${item.id}`} 
                  className="hover:text-accentRed transition"
                >
                  {item.title}
                </Link>
                {index < newsItems.length - 1 && " \u00A0\u00A0\u00A0 | \u00A0\u00A0\u00A0 "}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticker;