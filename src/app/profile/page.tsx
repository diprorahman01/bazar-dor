
"use client";

import { useEffect, useState } from "react";

import Hero from "@/components/home/Hero";
import PriceChangeSection from "@/components/home/PriceChangeSection";
import ProductCard from "@/components/products/ProductCard";
import ProductSkeleton from "@/components/ui/ProductSkeleton";

import { getProducts } from "@/lib/api";
import type { Product } from "@/types/product";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      try {
        const data = await getProducts();

        if (mounted) {
          setProducts(data);
          setError("");
        }
      } catch (err) {
        console.error("Products error:", err);

        if (mounted) {
          setError("পণ্যের তথ্য লোড করা যায়নি।");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const increasedProducts = products
    .filter((product) =>
      product.change !== null && product.change > 0
    )
    .sort((a, b) => (b.change ?? 0) - (a.change ?? 0))
    .slice(0, 6);

  const decreasedProducts = products
    .filter((product) =>
      product.change !== null && product.change < 0
    )
    .sort((a, b) => (a.change ?? 0) - (b.change ?? 0))
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f0f5f1]">
      <div className="mx-auto max-w-6xl px-4 py-6">

        {/* Hero */}
        <Hero />

        {/* API Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="mt-10 space-y-10">
            <section>
              <h2 className="mb-4 text-lg font-bold">
                ▲ আজ দাম বেড়েছে
              </h2>
              <ProductSkeleton count={6} />
            </section>

            <section>
              <h2 className="mb-4 text-lg font-bold">
                ▼ আজ দাম কমেছে
              </h2>
              <ProductSkeleton count={6} />
            </section>

            <section id="সব-পণ্য">
              <h2 className="mb-4 text-lg font-bold">
                সব পণ্য
              </h2>
              <ProductSkeleton count={9} />
            </section>
          </div>
        ) : (
          !error && (
            <>
              {/* Section A */}
              <PriceChangeSection
                title="আজ দাম বেড়েছে"
                type="up"
                products={increasedProducts}
              />

              {/* Section B */}
              <PriceChangeSection
                title="আজ দাম কমেছে"
                type="down"
                products={decreasedProducts}
              />

              {/* Section C */}
              <section
                id="সব-পণ্য"
                className="mt-12 scroll-mt-24"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  সব পণ্য
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  প্রতিটি পণ্যের সর্বশেষ দাম ও দামের পরিবর্তন
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              </section>
            </>
          )
        )}
      </div>
    </main>
  );
}

