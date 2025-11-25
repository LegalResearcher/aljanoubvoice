import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RelatedNewsProps {
  currentPostId: string;
  category: string;
}

const RelatedNews = ({ currentPostId, category }: RelatedNewsProps) => {
  const { data: relatedPosts = [], isLoading } = useQuery({
    queryKey: ['related-posts', currentPostId, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('category', category)
        .neq('id', currentPostId)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-southBlue"></div>
      </div>
    );
  }

  if (!relatedPosts || relatedPosts.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-2xl md:text-3xl font-bold text-southBlue mb-6 border-r-4 border-accentRed pr-3">
        أخبار ذات صلة
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {post.image_url && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-southBlue text-base mb-2 line-clamp-2 leading-snug">
                {post.title}
              </h3>
              <p className="text-xs text-gray-500">
                {formatDate(post.created_at)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedNews;