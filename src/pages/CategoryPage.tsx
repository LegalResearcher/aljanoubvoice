import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Ticker from "@/components/Ticker";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";

interface CategoryPageProps {
  category: string;
  title: string;
}

const CategoryPage = ({ category, title }: CategoryPageProps) => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-southGray">
      <Header />
      <Navbar />
      <Ticker />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 border-r-4 border-southBlue pr-3">
          <h1 className="text-3xl md:text-4xl font-bold text-southBlue">{title}</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-southBlue"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">لا توجد أخبار في هذا القسم حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map(post => (
              <NewsCard
                key={post.id}
                title={post.title}
                image={post.image_url || 'https://placehold.co/400x300/333/fff'}
                category={post.category}
                categoryColor="text-accentRed"
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;
