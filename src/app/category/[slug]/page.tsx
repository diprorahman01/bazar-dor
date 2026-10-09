
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProductImage from "@/components/ui/ProductImage";

const API = "https://api.api-store.workers.dev/api/bazardor";

type Product = {
  id: string;
  name: string;
  image: string;
  unit: string;
  today: number | null;
  change: number;
  category: string;
};

type SortOption = "default" | "low" | "high";

const categoryInfo: Record<
  string,
  { name: string; icon: string }
> = {
  chal: { name: "চাল", icon: "🍚" },
  dal: { name: "ডাল", icon: "🫘" },
  tel: { name: "তেল", icon: "🫙" },
  sobji: { name: "সবজি", icon: "🥬" },
  vegetable: { name: "সবজি", icon: "🥬" },
  mach: { name: "মাছ", icon: "🐟" },
  fish: { name: "মাছ", icon: "🐟" },
  mangso: { name: "মাংস", icon: "🍗" },
  meat: { name: "মাংস", icon: "🍗" },
  "dim-dudh": { name: "ডিম-দুধ", icon: "🥛" },
  "egg-milk": { name: "ডিম-দুধ", icon: "🥛" },
  moshla: { name: "মসলা", icon: "🌶️" },
  spice: { name: "মসলা", icon: "🌶️" },
};

// ============================================
// DATA HELPERS
// ============================================

function obj(value: unknown): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// Convert Bengali digits to English digits.
// Example: "৳১,২৫০.৫০" -> 1250.5
function num(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const bengaliDigits = "০১২৩৪৫৬৭৮৯";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const easternArabicDigits = "۰۱۲۳۴۵۶۷۸۹";

  const normalized = value
    .trim()
    .replace(/[০-৯]/g, (digit) =>
      String(bengaliDigits.indexOf(digit))
    )
    .replace(/[٠-٩]/g, (digit) =>
      String(arabicDigits.indexOf(digit))
    )
    .replace(/[۰-۹]/g, (digit) =>
      String(easternArabicDigits.indexOf(digit))
    )
    .replace(/[,٬\s৳₹]/g, "")
    .replace(/٫/g, ".");

  if (!normalized || !/^[+-]?\d*\.?\d+$/.test(normalized)) {
    return null;
  }

  const result = Number(normalized);

  return Number.isFinite(result) ? result : null;
}

function bn(value: number): string {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(value);
}

// ============================================
// NORMALIZE API PRODUCTS
// ============================================

function normalizeProduct(value: unknown): Product | null {
  const p = obj(value);
  const changeData = obj(p.change);

  const id = p.id;
  const name = str(p.nameBn) || str(p.name);

  if (id === undefined || id === null || !name) {
    return null;
  }

  const today = num(p.today) ?? num(p.price);
  const yesterday = num(p.yesterday);

  let change =
    num(changeData.pct) ?? num(p.changePct);

  if (change === null) {
    change =
      today !== null &&
      yesterday !== null &&
      yesterday !== 0
        ? ((today - yesterday) / yesterday) * 100
        : 0;
  }

  const direction = str(changeData.dir).toLowerCase();

  if (direction === "down" || direction === "decrease") {
    change = -Math.abs(change);
  } else if (
    direction === "up" ||
    direction === "increase"
  ) {
    change = Math.abs(change);
  }

  const categoryObject = obj(p.category);

  return {
    id: String(id),
    name,
    image: str(p.image) || "🛒",
    unit: str(p.unitBn) || str(p.unit) || "কেজি",
    today,
    change,
    category:
      str(p.categorySlug) ||
      str(categoryObject.slug) ||
      str(p.category),
  };
}

function extractProducts(payload: unknown): Product[] {
  const root = obj(payload);
  const data = root.data;
  const dataObject = obj(data);

  const array =
    (Array.isArray(payload) && payload) ||
    (Array.isArray(root.products) && root.products) ||
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(data) && data) ||
    (Array.isArray(dataObject.products) &&
      dataObject.products) ||
    (Array.isArray(dataObject.items) &&
      dataObject.items) ||
    [];

  return array
    .map(normalizeProduct)
    .filter((item): item is Product => item !== null);
}

// ============================================
// PRICE CHANGE BADGE
// ============================================

function ChangeBadge({ change }: { change: number }) {
  if (Math.abs(change) < 0.001) {
    return (
      <span className="rounded-full bg-[#F0F4F0] px-2.5 py-1 text-xs font-semibold text-[#526057]">
        — ০.০%
      </span>
    );
  }

  const up = change > 0;

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        up
          ? "bg-[#FFF0F1] text-[#EF343C]"
          : "bg-[#EAF8EF] text-[#079D4A]"
      }`}
    >
      {up ? "▲" : "▼"} {bn(Math.abs(change))}%
    </span>
  );
}

// ============================================
// CATEGORY PAGE
// ============================================

export default function CategoryPage() {
  const params = useParams();

  const slug = String(params.slug ?? "");

  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState<SortOption>("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const category = categoryInfo[slug] ?? {
    name: slug,
    icon: "🛒",
  };

  // ==========================================
  // FETCH CATEGORY PRODUCTS
  // ==========================================

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      setProducts([]);
      setSort("default");

      try {
        const response = await fetch(`${API}/products`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const data: unknown = await response.json();

        const all = extractProducts(data);

        const filtered = all.filter((product) => {
          const categoryValue =
            product.category.toLowerCase();

          return (
            categoryValue === slug.toLowerCase() ||
            categoryValue === category.name ||
            (slug === "chal" && categoryValue === "rice")
          );
        });

        if (active) {
          setProducts(filtered);
        }
      } catch {
        if (active) {
          setError("পণ্যের তথ্য লোড করা যায়নি।");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      void load();
    }

    return () => {
      active = false;
    };
  }, [slug, category.name]);

  // ==========================================
  // SORTING LOGIC
  // ==========================================

  const sortedProducts = useMemo(() => {
    const items = [...products];

    // Preserve original API order.
    if (sort === "default") {
      return items;
    }

    return items.sort((a, b) => {
      const priceA = a.today;
      const priceB = b.today;

      // Products without prices appear last.
      if (priceA === null && priceB === null) {
        return 0;
      }

      if (priceA === null) {
        return 1;
      }

      if (priceB === null) {
        return -1;
      }

      if (sort === "low") {
        return priceA - priceB;
      }

      return priceB - priceA;
    });
  }, [products, sort]);

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <main className="min-h-[calc(100vh-200px)] bg-[#F0F5F1] px-4 pb-24 pt-6 sm:pt-7">
      <div className="mx-auto max-w-[1120px] space-y-5">
        {/* CATEGORY HEADER */}

        <section className="flex items-center gap-4 rounded-2xl border border-[#DFE7E0] bg-white px-5 py-5 sm:px-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center text-4xl">
            {category.icon}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#1C2A20]">
              {category.name}
            </h1>

            <p className="mt-1 text-sm text-[#69776D]">
              {bn(products.length)}টি পণ্যের আজকের দাম ও পরিবর্তন
            </p>
          </div>
        </section>

        {/* SORT BAR */}

        <section className="flex min-h-[66px] items-center justify-end gap-3 rounded-2xl border border-[#DFE7E0] bg-white px-5 py-3">
          <label
            htmlFor="category-sort"
            className="text-sm font-medium text-[#657168]"
          >
            সাজান
          </label>

          <div className="relative">
            <select
              id="category-sort"
              aria-label="পণ্য সাজান"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as SortOption)
              }
              className="min-w-[170px] cursor-pointer appearance-none rounded-lg border border-[#D5DFD7] bg-white py-2 pl-3 pr-10 text-sm text-[#26332A] outline-none transition focus:border-[#008A40] focus:ring-2 focus:ring-[#008A40]/10"
            >
              <option value="default">ডিফল্ট</option>
              <option value="low">
                দাম: কম থেকে বেশি
              </option>
              <option value="high">
                দাম: বেশি থেকে কম
              </option>
            </select>

            {/* CHEVRON ICON */}

            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#657168]"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </section>

        {/* PRODUCT COUNT */}

        <p className="text-sm text-[#68766C]">
          {loading
            ? "পণ্য লোড হচ্ছে..."
            : `মোট ${bn(sortedProducts.length)}টি পণ্য দেখানো হচ্ছে`}
        </p>

        {/* ERROR MESSAGE */}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* PRODUCT GRID */}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-[#DFE7E0] bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-gray-200" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-16 rounded bg-gray-100" />
                    <div className="h-6 w-28 rounded bg-gray-200" />
                  </div>

                  <div className="h-7 w-16 rounded-full bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${encodeURIComponent(product.id)}`}
                className="group block rounded-2xl border border-[#DFE7E0] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#008A40] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#008A40]"
              >
                <div className="flex items-center gap-3">
                  <ProductImage
                    name={product.name}
                    icon={product.image}
                    size={30}
                  />

                  <div className="min-w-0">
                    <h2 className="truncate text-[16px] font-bold text-[#1B2920] group-hover:text-[#008A40]">
                      {product.name}
                    </h2>

                    <p className="text-xs text-[#6E7A70]">
                      প্রতি {product.unit}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#6E7A70]">
                      আজকের দাম
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#18261D]">
                      {product.today === null
                        ? "—"
                        : `${bn(product.today)} টাকা`}
                    </p>
                  </div>

                  <ChangeBadge change={product.change} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}

        {!loading &&
          !error &&
          sortedProducts.length === 0 && (
            <div className="rounded-2xl border border-[#DFE7E0] bg-white px-5 py-12 text-center text-sm text-[#68766C]">
              এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।
            </div>
          )}
      </div>
    </main>
  );
}
