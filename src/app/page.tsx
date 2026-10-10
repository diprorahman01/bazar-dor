
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";

import {
  loadBazarProducts,
  banglaPrice,
  banglaPercent,
  banglaUnit,
  type BazarProduct,
} from "@/lib/bazar-data";

// ============================================
// PRICE CHANGE BADGE
// ============================================

function ChangeBadge({
  change,
}: {
  change: number | null;
}) {
  if (change === null || !Number.isFinite(change)) {
    return (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
        তথ্য নেই
      </span>
    );
  }

  if (change === 0) {
    return (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
        — {banglaPercent(change)}
      </span>
    );
  }

  const rising = change > 0;

  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
        rising
          ? "bg-red-50 text-red-600"
          : "bg-green-50 text-green-700"
      }`}
    >
      {rising ? "▲" : "▼"} {banglaPercent(Math.abs(change))}
    </span>
  );
}

// ============================================
// PRODUCT CARD
// ============================================

function ProductCard({
  product,
}: {
  product: BazarProduct;
}) {
  return (
    <Link
      href={`/product/${encodeURIComponent(product.id)}`}
      className="block rounded-[14px] border border-[#DEE7E0] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <ProductImage
          name={product.name}
          icon={product.icon}
          size={28}
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold text-[#15251B]">
            {product.name}
          </h3>

          <p className="mt-0.5 text-xs text-[#788679]">
            {banglaUnit(product.unit)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-[#788679]">
            আজকের বাজার দর
          </p>

          <p className="mt-1 text-[18px] font-bold text-[#15251B]">
            {banglaPrice(product.price)}
          </p>
        </div>

        <ChangeBadge change={product.change} />
      </div>
    </Link>
  );
}

// ============================================
// PRODUCT SECTION
// ============================================

function ProductSection({
  title,
  subtitle,
  products,
  direction,
  id,
}: {
  title: string;
  subtitle?: string;
  products: BazarProduct[];
  direction?: "up" | "down";
  id?: string;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id={id} className="mb-10 scroll-mt-6">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#15251B]">
          {direction === "up" && (
            <span className="text-red-500">▲</span>
          )}

          {direction === "down" && (
            <span className="text-green-600">▼</span>
          )}

          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm text-[#788679]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================
// HERO SECTION
// ============================================

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
          <Image
            src="/images/bazar-hero.png"
            alt="বাজার দর সবজির ঝুড়ি"
            width={250}
            height={250}
            priority
            className="h-auto w-[170px] object-contain sm:w-[210px] md:w-[230px]"
          />
        </div>
      </div>
    </section>
  );
}

// ============================================
// LOADING SKELETON
// ============================================

function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-[14px] border border-[#DEE7E0] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gray-100" />

        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-gray-100" />
          <div className="mt-2 h-3 w-20 rounded bg-gray-100" />
        </div>
      </div>

      <div className="mt-5 h-3 w-24 rounded bg-gray-100" />

      <div className="mt-2 flex items-center justify-between">
        <div className="h-6 w-24 rounded bg-gray-100" />
        <div className="h-6 w-16 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

function LoadingProducts() {
  return (
    <section className="mb-10">
      <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

// ============================================
// MAIN HOMEPAGE
// ============================================

export default function HomePage() {
  const [products, setProducts] = useState<BazarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        const result = await loadBazarProducts();

        if (!active) return;

        setProducts(result.products);
        setError("");
      } catch (err) {
        console.error("Failed to load BazarDor products:", err);

        if (active) {
          setError("পণ্যের তথ্য লোড করা যায়নি।");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  const risingProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.change !== null &&
          Number.isFinite(product.change) &&
          product.change > 0
      )
      .sort((a, b) => (b.change ?? 0) - (a.change ?? 0))
      .slice(0, 6);
  }, [products]);

  const fallingProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.change !== null &&
          Number.isFinite(product.change) &&
          product.change < 0
      )
      .sort((a, b) => (a.change ?? 0) - (b.change ?? 0))
      .slice(0, 6);
  }, [products]);

  return (
    <main className="min-h-screen bg-[#F1F6F2]">
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
        <Hero />

        {loading ? (
          <LoadingProducts />
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-red-700">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-lg font-bold text-[#15251B]">
              কোনো পণ্য পাওয়া যায়নি
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              বর্তমানে বাজার দরের তথ্য পাওয়া যাচ্ছে না।
            </p>
          </div>
        ) : (
          <>
            <ProductSection
              title="আজ দাম বেড়েছে"
              products={risingProducts}
              direction="up"
            />

            <ProductSection
              title="আজ দাম কমেছে"
              products={fallingProducts}
              direction="down"
            />

            <ProductSection
              id="all-products"
              title="সব পণ্য"
              subtitle={`মোট ${new Intl.NumberFormat("bn-BD").format(
                products.length
              )}টি পণ্য দেখানো হচ্ছে`}
              products={products}
            />
          </>
        )}
      </div>
    </main>
  );
}
