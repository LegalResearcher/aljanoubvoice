import { Link } from "react-router-dom";
import { Rss } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-12 pb-6 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

        <div className="md:col-span-1">
          <h3 className="text-white text-xl font-bold mb-4">الجنوب فويس</h3>
          <p className="text-sm leading-6 mb-4">
            منبر إعلامي جنوبي حُر ومستقل، ينطلق من العاصمة عدن لينقل الحقيقة كما هي، منحازاً لقضايا المواطن وتطلعات الشارع الجنوبي.
          </p>
          <div className="flex gap-3">
            <a 
              href="https://www.facebook.com/share/19LJWZ9EWP/" 
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
            >
              <i className="fab fa-facebook-f"></i>
            </a>

            <a 
              href="https://x.com/aljanoubvoice?t=m2LEG-iIS-72vwvbsHkwaw&s=09" 
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            <a 
              href="https://youtube.com/@aljanoubvoice?si=--HRO1paUZcqN_eT" 
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-red-600 hover:text-white transition"
            >
              <i className="fab fa-youtube"></i>
            </a>

            <a 
              href="https://t.me/aljnoubvoice" 
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-blue-500 hover:text-white transition"
            >
              <i className="fab fa-telegram-plane"></i>
            </a>

            <a 
              href="https://whatsapp.com/channel/0029Vb35SXf0VycNope3QR0l" 
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-green-500 hover:text-white transition"
            >
              <i className="fab fa-whatsapp"></i>
            </a>

            <a 
              href="https://aljnoubvoice.com/api/rss"
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-orange-500 hover:text-white transition"
            >
              <Rss className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-white text-lg font-bold mb-4">أقسام الموقع</h3>
          <ul className="text-sm space-y-2">
            <li><Link to="/aden" className="hover:text-white transition">أخبار عدن</Link></li>
            <li><Link to="/local" className="hover:text-white transition">محافظات الجنوب</Link></li>
            <li><Link to="/reports" className="hover:text-white transition">تقارير وتحليلات</Link></li>
            <li><Link to="/tech" className="hover:text-white transition">علوم وتكنولوجيا</Link></li>
            <li><Link to="/sports" className="hover:text-white transition">الرياضة</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white text-lg font-bold mb-4">تواصل معنا</h3>
          <ul className="text-sm space-y-3">
            <li><i className="fas fa-envelope ml-2"></i> contact@southvoice.net</li>
            <li><i className="fab fa-whatsapp ml-2"></i> +967 7X XXX XXXX</li>
            <li><i className="fas fa-map-marker-alt ml-2"></i> اليمن - العاصمة عدن</li>
          </ul>
        </div>

        <div>
          <h3 className="text-white text-lg font-bold mb-4">اشترك في النشرة</h3>
          <p className="text-xs mb-3">احصل على آخر أخبار عدن في بريدك.</p>
          <div className="flex">
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              className="w-full p-2 rounded-r text-gray-800 focus:outline-none text-sm"
            />
            <button className="bg-accentRed text-white px-3 rounded-l hover:bg-red-700 transition">
              اشترك
            </button>
          </div>
        </div>

      </div>

      <div className="border-t border-gray-800 pt-6 text-center text-sm">
        <p>
          جميع الحقوق محفوظة &copy; 2025{" "}
          <span className="text-white">الجنوب فويس</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
