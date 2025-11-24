import { Link } from "react-router-dom";
import sailLogo from "@/assets/sail-logo.png";

const Header = () => {
  const currentDate = new Date().toLocaleDateString('ar-YE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-900 text-gray-400 text-xs py-2 border-b border-gray-700">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <i className="far fa-calendar-alt ml-1"></i> {currentDate}
          </div>
          <div>
            <i className="fas fa-map-marker-alt ml-1"></i> ينطلق من العاصمة عدن
          </div>
          <div className="hidden md:flex gap-3">
            <a href="#" className="hover:text-white"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="hover:text-white"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-white"><i className="fab fa-telegram-plane"></i></a>
            <a href="#" className="hover:text-white"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div className="text-center md:text-right">
            <Link to="/" className="flex items-center justify-center md:justify-end gap-3 group">
              {/* Sail Logo */}
              <img 
                src={sailLogo} 
                alt="Sail Logo" 
                className="w-12 h-12 md:w-16 md:h-16 object-contain transition-transform group-hover:scale-110"
              />
              
              {/* Text */}
              <div className="flex flex-col items-start">
                <h1 className="text-3xl md:text-4xl font-black text-southBlue leading-tight">
                  الجنوب <span className="text-accentRed">فويس</span>
                </h1>
                <span className="text-xs text-gray-500 font-semibold tracking-wide group-hover:text-southBlue transition">
                  منبر إعلامي جنوبي حُر ومستقل
                </span>
              </div>
            </Link>
          </div>
          
          {/* Ad Space */}
          <div className="hidden md:block w-[728px] h-[90px] bg-gray-200 flex items-center justify-center text-gray-400 text-sm border border-gray-300 rounded">
            مساحة إعلانية 728x90
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
