import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

interface NewsCardProps {
  title: string;
  excerpt?: string;
  image: string;
  category: string;
  categoryColor?: string;
  timeAgo?: string;
  href?: string;
  variant?: "hero" | "sidebar" | "grid" | "list";
}

const NewsCard = ({
  title,
  excerpt,
  image,
  category,
  categoryColor = "bg-accentRed",
  timeAgo,
  href = "#",
  variant = "grid"
}: NewsCardProps) => {
  if (variant === "hero") {
    return (
      <div className="lg:col-span-8 group cursor-pointer hover-scale">
        <Link to={href}>
          <div className="relative h-[300px] md:h-[450px] rounded-lg overflow-hidden shadow-md">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-20">
              <span className={`${categoryColor} text-white text-xs px-2 py-1 rounded mb-2 inline-block`}>
                {category}
              </span>
              <h3 className="text-xl md:text-3xl font-bold text-white leading-snug group-hover:text-gray-200 transition">
                {title}
              </h3>
              {excerpt && (
                <p className="hidden md:block text-gray-300 mt-2 text-sm">
                  {excerpt}
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex gap-3 hover:shadow-md transition cursor-pointer">
        <Link to={href} className="flex gap-3 w-full">
          <img src={image} className="w-24 h-24 object-cover rounded flex-shrink-0" alt={title} />
          <div className="flex flex-col justify-between flex-1">
            <h4 className="font-bold text-southBlue text-sm leading-relaxed hover:text-accentRed transition">
              {title}
            </h4>
            {timeAgo && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo}
              </span>
            )}
          </div>
        </Link>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <article className="bg-white p-4 rounded shadow flex flex-col sm:flex-row gap-4 border border-gray-100">
        <Link to={href} className="flex flex-col sm:flex-row gap-4 w-full">
          <img src={image} className="w-full sm:w-48 h-32 object-cover rounded" alt={title} />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-southBlue hover:text-accentRed cursor-pointer mb-2">
              {title}
            </h3>
            {excerpt && (
              <p className="text-gray-600 text-sm leading-6 line-clamp-2">
                {excerpt}
              </p>
            )}
            <span className="text-xs text-gray-400 mt-2 block">
              {category}
            </span>
          </div>
        </Link>
      </article>
    );
  }

  // Default: grid variant
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden group">
      <Link to={href}>
        <div className="h-40 overflow-hidden">
          <img 
            src={image} 
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
            alt={title} 
          />
        </div>
        <div className="p-4">
          <span className={`text-xs ${categoryColor.replace('bg-', 'text-')} font-bold`}>
            {category}
          </span>
          <h3 className="font-bold text-southBlue mt-1 text-sm leading-6 group-hover:text-accentRed transition">
            {title}
          </h3>
        </div>
      </Link>
    </div>
  );
};

export default NewsCard;
