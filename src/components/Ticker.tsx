const Ticker = () => {
  const newsItems = [
    "مصدر مسؤول في كهرباء عدن: وصول شحنة وقود جديدة إلى ميناء الزيت وتشغيل محطة الرئيس خلال ساعات",
    "البنك المركزي يُصدر تعميماً هاماً لشركات الصرافة لضبط أسعار الصرف",
    "قوات الأمن تحبط محاولة تهريب في المنفذ الشمالي للعاصمة"
  ];

  return (
    <div className="bg-white border-b border-gray-200 py-2 shadow-sm">
      <div className="container mx-auto px-4 flex items-center">
        <div className="bg-accentRed text-white text-xs font-bold px-3 py-1 rounded ml-3 whitespace-nowrap animate-pulse">
          عاجـل
        </div>
        <div className="ticker-wrap overflow-hidden flex-1">
          <div className="ticker text-sm font-semibold text-southBlue">
            {newsItems.map((item, index) => (
              <span key={index}>
                {item}
                {index < newsItems.length - 1 && " &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; "}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticker;
