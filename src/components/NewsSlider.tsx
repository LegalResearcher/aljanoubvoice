import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Slide {
  id: string | number;
  title: string;
  category: string;
  image: string;
  categoryColor: string;
}

const NewsSlider = ({ slides }: { slides: Slide[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = slides.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const changeSlide = (direction: number) => {
    setCurrentIndex((prev) => {
      const newIndex = prev + direction;
      if (newIndex < 0) return totalSlides - 1;
      if (newIndex >= totalSlides) return 0;
      return newIndex;
    });
  };

  const now = new Date();
  const dayName = now.toLocaleDateString('ar-YE', { weekday: 'long' });
  const date = now.toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' });
  const time = now.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });

  return (
    <section className="w-full mb-8">
      {/* Last Update Bar */}
      <div className="w-full mb-1">
        <div className="bg-white border-b border-gray-200 rounded-t-lg py-2 px-4 flex items-center justify-center shadow-sm">
          <span className="text-accentRed font-bold text-xs sm:text-sm ml-2">
            آخر تحديث:
          </span>
          <span className="text-southBlue font-bold text-xs sm:text-sm">
            {dayName} – {date} – {time}
          </span>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative group">
        <div className="relative h-[400px] md:h-[550px] lg:h-[650px] rounded-b-lg overflow-hidden shadow-xl">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slider-item absolute inset-0 cursor-pointer transition duration-500 ${
                index === currentIndex ? "active" : ""
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8 lg:p-12 text-white">
                <span className={`${slide.categoryColor} text-white text-sm font-bold px-4 py-2 rounded mb-4 inline-block shadow-md`}>
                  {slide.category}
                </span>
                <h3 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mt-2 drop-shadow-lg">
                  {slide.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex justify-center -mt-6 sm:-mt-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg p-2 flex gap-1.5 border border-gray-200">
            {slides.slice(0, 10).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition duration-300 flex-shrink-0 ${
                  index === currentIndex
                    ? "bg-accentRed text-white border-2 border-white shadow-md"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => changeSlide(-1)}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition duration-300 hidden md:block z-20"
        >
          <ChevronRight className="text-xl" />
        </button>
        <button
          onClick={() => changeSlide(1)}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition duration-300 hidden md:block z-20"
        >
          <ChevronLeft className="text-xl" />
        </button>
      </div>
    </section>
  );
};

export default NewsSlider;
