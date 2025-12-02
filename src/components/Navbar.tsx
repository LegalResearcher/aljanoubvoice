import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, X, Rss } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "الرئيسية", href: "/" },
    { label: "أخبار عدن", href: "/aden" },
    { label: "أخبار محلية", href: "/local" },
    { label: "أخبار وتقارير", href: "/reports" },
    { label: "اليمن في الصحافة", href: "/press" },
    { label: "شؤون دولية", href: "/intl" },
    { label: "اقتصاد", href: "/economy" },
    { label: "آراء واتجاهات", href: "/opinions" },
    { label: "ثقافة وفن", href: "/culture" },
    { label: "علوم وتكنولوجيا", href: "/tech" },
    { label: "صحة", href: "/health" },
    { label: "رياضة", href: "/sports" },
    { label: "منوعات", href: "/misc" },
    { label: "فيديو", href: "/video", highlight: true },
  ];

  return (
    <nav className="bg-southBlue sticky top-0 z-50 shadow-lg border-b-4 border-accentRed">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white text-2xl focus:outline-none"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex gap-6 text-white font-bold text-sm lg:text-base">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  className={`py-4 border-b-2 border-transparent hover:border-accentRed transition ${
                    item.highlight ? "text-accentRed hover:text-white" : ""
                  }`}
                >
                  {item.label}
                  {item.highlight && <i className="fas fa-play-circle mr-1"></i>}
                </Link>
              </li>
            ))}
          </ul>

          {/* Search Icon */}
          <div className="text-white cursor-pointer hover:text-accentRed transition">
            <Search className="text-lg" />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-southBlue border-t border-gray-700">
          <ul className="flex flex-col text-white font-semibold p-4 gap-3">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  className={`block hover:text-accentRed ${
                    item.highlight ? "text-accentRed" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {/* RSS Feeds Link - Mobile Only */}
            <li className="border-t border-gray-700 pt-3 mt-2">
              <Link
                to="/rss-feeds"
                className="flex items-center gap-2 text-orange-400 hover:text-orange-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <Rss className="w-4 h-4" />
                خلاصات RSS
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
