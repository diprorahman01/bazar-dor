
function Hero() {
  const [today, setToday] = useState("");

  useEffect(() => {
    const updateDate = () => {
      const formattedDate = new Intl.DateTimeFormat("bn-BD", {
        timeZone: "Asia/Dhaka",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());

      setToday(formattedDate);
    };

    updateDate();

    const timer = setInterval(updateDate, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative mb-10 overflow-hidden rounded-[22px] border border-[#DEE7E0] bg-white px-5 py-6 sm:px-7 md:px-8 md:py-8">
      <div className="flex flex-col items-center justify-between gap-5 md:flex-row md:gap-8">
        {/* Left Content */}
        <div className="w-full text-center md:w-3/5 md:text-left">
          <span className="inline-flex items-center rounded-full bg-[#E9F8EF] px-3 py-1.5 text-xs font-semibold text-[#16803D]">
            {today || "আজকের বাজার দর"}
          </span>

          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-[#192B20] sm:text-3xl lg:text-[36px]">
            আজকের বাজারের দাম এক নজরে
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#788679]">
            চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম —
            বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন ও সর্বোচ্চ এবং
            দামের পরিবর্তন এক জায়গায়।
          </p>

          <a
            href="#all-products"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#008B3D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007432]"
          >
            সব পণ্য দেখুন
          </a>
        </div>

        {/* Right Image */}
        <div className="flex w-full justify-center md:w-2/5 md:justify-end">
          <img
            src="/images/bazar-hero.png"
            alt="বাজার দর সবজির ঝুড়ি"
            className="h-auto w-[170px] object-contain sm:w-[210px] md:w-[230px]"
          />
        </div>
      </div>
    </section>
  );
}
