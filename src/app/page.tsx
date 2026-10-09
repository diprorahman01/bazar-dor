
"use client";

import { useEffect, useState } from "react";
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
  if (change === null) {
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
      className={
        "rounded-full px-3 py-1 text-xs font-semibold " +
        (rising
          ? "bg-red-50 text-red-600"
          : "bg-green-50 text-green-700")
      }
    >
      {rising ? "▲" : "▼"}{" "}
      {banglaPercent(change)}
    </span>
  );
}

// ============================================
// PRODUCT CARD
// LOCAL PNG IMAGES
// ============================================

function ProductCard({
  product,
}: {
  product: BazarProduct;
}) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="block rounded-[14px] border border-[#DEE7E0] bg-white p-4 transition-all hover:border-green-300 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <ProductImage
          name={product.name}
          icon={product.icon}
          size={28}
        />

        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold text-[#15251B]">
            {product.name}
          </h3>

          <p className="mt-0.5 text-xs text-[#788679]">
            {banglaUnit(product.unit)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
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
}: {
  title: string;
  subtitle?: string;
  products: BazarProduct[];
  direction?: "up" | "down";
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
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
  return (
    <section className="relative mb-10 overflow-hidden rounded-[22px] border border-[#D8E9DC] bg-gradient-to-r from-[#E5F5E8] to-[#F8FCF7] px-6 py-10 md:px-12 md:py-14">
      <div className="relative z-10 max-w-[650px]">
        <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের বাজার দর
        </span>

        <h1 className="mt-5 text-3xl font-extrabold leading-[1.4] text-[#153E26] md:text-5xl">
          প্রতিদিনের বাজার দর
          <br />
          এখন আপনার হাতেই
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-7 text-[#536B59] md:text-base">
          চাল, ডাল, তেল, মাছ, মাংস ও শাকসবজির
          সর্বশেষ বাজার দর এবং দাম বাড়া-কমার
          তথ্য দেখুন এক জায়গায়।
        </p>

        <a
          href="#all-products"
          className="mt-6 inline-flex rounded-xl bg-[#16803D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#106C32]"
        >
          আজকের বাজার দর দেখুন →
        </a>
      </div>

      <div className="pointer-events-none absolute bottom-2 right-10 hidden lg:block">
        <img
          src="/images/bazar-hero.png"
          alt="বাজারের পণ্য"
          className="h-[180px] w-[180px] object-contain xl:h-[220px] xl:w-[220px]"
        />
      </div>
    </section>
  );
}

// ============================================
// MAIN HOMEPAGE
// ============================================

export default function HomePage() {
  const [products, setProducts] = useState<
    BazarProduct[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        const result = await loadBazarProducts();

        if (active) {
          setProducts(result.products);
          setError("");
        }
      } catch (err) {
        console.error(
          "Failed to load BazarDor products:",
          err
        );

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

  // Top 6 products with highest price increases
  const risingProducts = products
    .filter(
      (product) =>
        product.change !== null &&
        product.change > 0
    )
    .sort(
      (a, b) =>
        (b.change ?? 0) - (a.change ?? 0)
    )
    .slice(0, 6);

  // Top 6 products with highest price decreases
  const fallingProducts = products
    .filter(
      (product) =>
        product.change !== null &&
        product.change < 0
    )
    .sort(
      (a, b) =>
        (a.change ?? 0) - (b.change ?? 0)
    )
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#F1F6F2]">
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
        <Hero />

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            পণ্যের তথ্য লোড হচ্ছে...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-5 text-red-700">
            {error}
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

            <div id="all-products">
              <ProductSection
                title="সব পণ্য"
                subtitle={`মোট ${new Intl.NumberFormat(
                  "bn-BD"
                ).format(products.length)}টি পণ্য দেখানো হচ্ছে`}
                products={products}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
