
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import ProductImage from "@/components/ui/ProductImage";

const API =
  "https://api.api-store.workers.dev/api/bazardor";

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

type CategoryInfo = {
  name: string;
  icon: string;
  aliases: string[];
  keywords: string[];
};

// ============================================
// CATEGORY CONFIGURATION
// ============================================

const categoryInfo: Record<string, CategoryInfo> = {
  chal: {
    name: "চাল",
    icon: "🍚",
    aliases: ["chal", "rice", "চাল"],
    keywords: [
      "চাল",
      "মিনিকেট",
      "নাজিরশাইল",
      "বাসমতি",
    ],
  },

  dal: {
    name: "ডাল",
    icon: "🌱",
    aliases: [
      "dal",
      "daal",
      "lentil",
      "pulses",
      "ডাল",
    ],
    keywords: [
      "ডাল",
      "ছোলা",
      "মসুর",
      "মুগ",
      "মাষকলাই",
    ],
  },

  tel: {
    name: "তেল",
    icon: "🛢️",
    aliases: [
      "tel",
      "oil",
      "edible-oil",
      "তেল",
    ],
    keywords: [
      "তেল",
      "সয়াবিন",
      "সয়াবিন",
      "সরিষা",
      "পাম অয়েল",
    ],
  },

  sobji: {
    name: "সবজি",
    icon: "🥬",
    aliases: [
      "sobji",
      "vegetable",
      "vegetables",
      "সবজি",
    ],
    keywords: [
      "আলু",
      "পেঁয়াজ",
      "পেঁয়াজ",
      "রসুন",
      "বেগুন",
      "টমেটো",
      "শসা",
      "ঢেঁড়স",
      "ঢেঁড়স",
      "ফুলকপি",
      "বাঁধাকপি",
    ],
  },

  mach: {
    name: "মাছ",
    icon: "🐟",
    aliases: [
      "mach",
      "fish",
      "seafood",
      "মাছ",
    ],
    keywords: [
      "মাছ",
      "ইলিশ",
      "রুই",
      "কাতলা",
      "পাঙ্গাস",
      "তেলাপিয়া",
      "চিংড়ি",
      "চিংড়ি",
    ],
  },

  // IMPORTANT:
  // The canonical slug is "mangsho",
  // matching your existing Navbar URL.

  mangsho: {
    name: "মাংস",
    icon: "🍗",
    aliases: [
      "mangsho",
      "mangso",
      "mangsh",
      "meat",
      "মাংস",
    ],
    keywords: [
      "মাংস",
      "গরুর",
      "খাসির",
      "মুরগি",
      "চিকেন",
      "হাঁসের",
    ],
  },

  "dim-dudh": {
    name: "ডিম-দুধ",
    icon: "🥛",
    aliases: [
      "dim-dudh",
      "dim_dudh",
      "egg-milk",
      "egg-milk-dairy",
      "eggs-dairy",
      "eggs",
      "egg",
      "dairy",
      "milk",
      "ডিম-দুধ",
      "ডিম ও দুধ",
      "ডিম",
      "দুধ",
    ],
    keywords: [
      "ডিম",
      "দুধ",
      "দই",
      "মাখন",
      "পনির",
      "চিজ",
    ],
  },

  moshla: {
    name: "মসলা",
    icon: "🌶️",
    aliases: [
      "moshla",
      "mosla",
      "mashla",
      "masala",
      "spice",
      "spices",
      "মসলা",
      "মশলা",
    ],
    keywords: [
      "মসলা",
      "মশলা",
      "হলুদ",
      "জিরা",
      "ধনে",
      "মরিচ গুঁড়া",
      "মরিচ গুড়া",
      "গরম মসলা",
      "দারুচিনি",
      "এলাচ",
      "লবঙ্গ",
      "গোলমরিচ",
    ],
  },
};

// ============================================
// CATEGORY URL ALIASES
// ============================================

const categorySlugAliases: Record<string, string> = {
  rice: "chal",
  daal: "dal",
  lentil: "dal",
  pulses: "dal",

  oil: "tel",
  "edible-oil": "tel",

  vegetable: "sobji",
  vegetables: "sobji",

  fish: "mach",
  seafood: "mach",

  // FIX: Both spellings now work.
  mangso: "mangsho",
  mangsh: "mangsho",
  meat: "mangsho",

  dim_dudh: "dim-dudh",
  "egg-milk": "dim-dudh",
  "egg-milk-dairy": "dim-dudh",
  "eggs-dairy": "dim-dudh",
  eggs: "dim-dudh",
  egg: "dim-dudh",
  dairy: "dim-dudh",
  milk: "dim-dudh",

  mosla: "moshla",
  mashla: "moshla",
  masala: "moshla",
  spice: "moshla",
  spices: "moshla",
};

// ============================================
// API HELPERS
// ============================================

function obj(value: unknown): Record<string, unknown> {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function str(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function num(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const digits = "০১২৩৪৫৬৭৮৯";

  const normalized = value
    .replace(/[০-৯]/g, (digit) =>
      String(digits.indexOf(digit))
    )
    .replace(/[,৳₹%\s]/g, "")
    .trim();

  if (!normalized) return null;

  const result = Number(normalized);

  return Number.isFinite(result) ? result : null;
}

function bn(value: number): string {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(value);
}

// ============================================
// NORMALIZE API PRODUCT
// ============================================

function normalizeProduct(value: unknown): Product | null {
  const p = obj(value);
  const changeData = obj(p.change);

  const id = p.id ?? p._id;

  const name =
    str(p.nameBn) ||
    str(p.name_bn) ||
    str(p.name);

  if (id === undefined || id === null || !name) {
    return null;
  }

  const today =
    num(p.today) ??
    num(p.currentPrice) ??
    num(p.price);

  const yesterday = num(p.yesterday);

  let change =
    num(changeData.pct) ??
    num(changeData.percent) ??
    num(p.changePct);

  if (change === null) {
    change =
      today !== null &&
      yesterday !== null &&
      yesterday !== 0
        ? ((today - yesterday) / yesterday) * 100
        : 0;
  }

  const direction = (
    str(changeData.dir) ||
    str(p.direction)
  ).toLowerCase();

  if (
    ["down", "decrease", "fall"].includes(direction)
  ) {
    change = -Math.abs(change);
  } else if (
    ["up", "increase", "rise"].includes(direction)
  ) {
    change = Math.abs(change);
  } else if (direction === "same") {
    change = 0;
  }

  const categoryObject = obj(p.category);

  const category =
    str(p.categorySlug) ||
    str(p.category_slug) ||
    str(categoryObject.slug) ||
    str(categoryObject.nameBn) ||
    str(categoryObject.name) ||
    str(p.categoryName) ||
    str(p.category);

  return {
    id: String(id),
    name,
    image: str(p.image) || str(p.icon),
    unit: str(p.unitBn) || str(p.unit) || "kg",
    today,
    change,
    category,
  };
}

function extractProducts(payload: unknown): Product[] {
  function findArray(value: unknown): unknown[] {
    if (Array.isArray(value)) return value;

    const record = obj(value);

    for (const key of [
      "products",
      "items",
      "data",
      "results",
    ]) {
      const nested = record[key];

      if (Array.isArray(nested)) {
        return nested;
      }

      if (nested && typeof nested === "object") {
        const found = findArray(nested);

        if (found.length > 0) {
          return found;
        }
      }
    }

    return [];
  }

  return findArray(payload)
    .map(normalizeProduct)
    .filter(
      (item): item is Product => item !== null
    );
}

// ============================================
// CATEGORY MATCHING
// ============================================

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFC")
    .replace(/য়/g, "য়")
    .replace(/[_\s]+/g, "-");
}

function matchesCategory(
  product: Product,
  category: CategoryInfo
): boolean {
  const productCategory = normalizeText(
    product.category
  );

  const productName = normalizeText(product.name);

  // Match the category supplied by the API.
  if (
    category.aliases.some(
      (alias) =>
        normalizeText(alias) === productCategory
    )
  ) {
    return true;
  }

  // Do not put products from another recognized
  // category into this category.
  const belongsToAnotherCategory = Object.values(
    categoryInfo
  ).some((otherCategory) =>
    otherCategory.aliases.some(
      (alias) =>
        normalizeText(alias) === productCategory
    )
  );

  if (belongsToAnotherCategory) {
    return false;
  }

  // Fallback: match by product name.
  return category.keywords.some((keyword) =>
    productName.includes(normalizeText(keyword))
  );
}

// ============================================
// PRICE CHANGE BADGE
// ============================================

function ChangeBadge({
  change,
}: {
  change: number;
}) {
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
      className={
        "rounded-full px-2.5 py-1 text-xs font-semibold " +
        (up
          ? "bg-[#FFF0F1] text-[#EF343C]"
          : "bg-[#EAF8EF] text-[#079D4A]")
      }
    >
      {up ? "▲" : "▼"} {bn(Math.abs(change))}%
    </span>
  );
}

// ============================================
// LOADING SKELETON
// ============================================

function CategorySkeleton() {
  return (
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
  );
}

// ============================================
// CATEGORY PAGE
// ============================================

export default function CategoryPage() {
  const params = useParams();

  const rawSlug = String(params.slug ?? "")
    .trim()
    .toLowerCase();

  const slug =
    categorySlugAliases[rawSlug] ?? rawSlug;

  const category = categoryInfo[slug];

  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [sort, setSort] =
    useState<SortOption>("default");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  useEffect(() => {
    if (!category) return;

    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      setProducts([]);
      setSort("default");

      try {
        const response = await fetch(
          `${API}/products`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status}`
          );
        }

        const data: unknown = await response.json();

        const all = extractProducts(data);

        if (all.length === 0) {
          throw new Error(
            "No valid products returned"
          );
        }

        const filtered = all.filter((product) =>
          matchesCategory(product, category)
        );

        if (active) {
          setProducts(filtered);
        }
      } catch (err) {
        console.error(
          "Category products error:",
          err
        );

        if (active) {
          setError(
            "পণ্যের তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [category]);

  // ==========================================
  // SORT PRODUCTS
  // ==========================================

  const sortedProducts = useMemo(() => {
    const items = [...products];

    if (sort === "default") {
      return items;
    }

    return items.sort((a, b) => {
      if (a.today === null) return 1;
      if (b.today === null) return -1;

      return sort === "low"
        ? a.today - b.today
        : b.today - a.today;
    });
  }, [products, sort]);

  // ==========================================
  // INVALID CATEGORY = 404
  // ==========================================

  if (!category) {
    notFound();
  }

  // ==========================================
  // RENDER CATEGORY PAGE
  // ==========================================

  return (
    <main className="min-h-[calc(100vh-200px)] bg-[#F0F5F1] px-4 pb-24 pt-6 sm:pt-7">
      <div className="mx-auto max-w-[1120px] space-y-5">
        {/* CATEGORY HEADER */}

        <section className="flex items-center gap-4 rounded-2xl border border-[#DFE7E0] bg-white px-5 py-5 sm:px-6">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center text-4xl"
            role="img"
            aria-label={category.name}
          >
            {category.icon}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#1C2A20]">
              {category.name}
            </h1>

            <p className="mt-1 text-sm text-[#69776D]">
              {loading
                ? "পণ্যের তথ্য লোড হচ্ছে..."
                : `${bn(products.length)}টি পণ্যের আজকের দাম ও পরিবর্তন`}
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
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value as SortOption
                )
              }
              disabled={loading}
              className="min-w-[170px] cursor-pointer appearance-none rounded-lg border border-[#D5DFD7] bg-white py-2 pl-3 pr-10 text-sm text-[#26332A] outline-none transition focus:border-[#008A40] focus:ring-2 focus:ring-[#008A40]/10 disabled:opacity-50"
            >
              <option value="default">
                ডিফল্ট
              </option>

              <option value="low">
                দাম: কম থেকে বেশি
              </option>

              <option value="high">
                দাম: বেশি থেকে কম
              </option>
            </select>

            <svg
              aria-hidden="true"
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

        {/* API ERROR */}

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {/* PRODUCTS */}

        {loading ? (
          <CategorySkeleton />
        ) : (
          !error && (
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
                        {product.unit.startsWith(
                          "প্রতি"
                        )
                          ? product.unit
                          : `প্রতি ${product.unit}`}
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

                    <ChangeBadge
                      change={product.change}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* EMPTY CATEGORY */}

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
