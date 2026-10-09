
import Image from "next/image";

export default function Hero() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e2eae4] bg-white px-6 py-7 md:px-10 md:py-8">
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
        {/* Left Content */}
        <div className="w-full text-center md:w-3/5 md:text-left">
          <span className="inline-block rounded-full bg-[#e9f8ef] px-3 py-1 text-xs font-semibold text-[#008b3d]">
            বাংলাদেশের নিত্যদিনের ২০২৬
          </span>

          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#192b20] sm:text-4xl">
            আজকের বাজারের দাম এক নজরে
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500">
            চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার
            দাম — বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন
            ও সর্বোচ্চ এবং দামের পরিবর্তন এক জায়গায়।
          </p>

          <a
            href="#সব-পণ্য"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#008b3d] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007432]"
          >
            সব পণ্য দেখুন
          </a>
        </div>

        {/* Right Image */}
        <div className="flex w-full justify-center md:w-2/5 md:justify-end">
          <Image
            src="/images/bazar-hero.png"
            alt="বাজার দর সবজির ঝুড়ি"
            width={250}
            height={250}
            priority
            className="h-auto w-[180px] object-contain sm:w-[220px] md:w-[250px]"
          />
        </div>
      </div>
    </section>
  );
}
