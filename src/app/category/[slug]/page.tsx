
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

type SortOption = "featured" | "low" | "high" | "name" | "increase" | "decrease";

const categoryInfo: Record<string, { name: string; icon: string }> = {
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

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const result = Number(value);
    return Number.isFinite(result) ? result : null;
  }
  return null;
}

function bn(value: number): string {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(value);
}

function normalizeProduct(value: unknown): Product | null {
  const p = obj(value);
  const changeData = obj(p.change);

  const id = p.id;
  const name = str(p.nameBn) || str(p.name);
  if (id === undefined || id === null || !name) return null;

  const today = num(p.today) ?? num(p.price);
  const yesterday = num(p.yesterday);

  let change = num(changeData.pct) ?? num(p.changePct);

  if (change === null) {
    change =
      today !== null && yesterday !== null && yesterday !== 0
        ? ((today - yesterday) / yesterday) * 100
        : 0;
  }

  const direction = str(changeData.dir).toLowerCase();

  if (direction === "down" || direction === "decrease") {
    change = -Math.abs(change);
  } else if (direction === "up" || direction === "increase") {
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
    (Array.isArray(dataObject.products) && dataObject.products) ||
    (Array.isArray(dataObject.items) && dataObject.items) ||
    [];

  return array
    .map(normalizeProduct)
    .filter((item): item is Product => item !== null);
}

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

export default function CategoryPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");

  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState<SortOption>("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const category = categoryInfo[slug] ?? {
    name: slug,
    icon: "🛒",
  };

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // Fetch all products so each card retains its real product ID.
        const response = await fetch(`${API}/products`, {
          cache: "no-store",
        });

        if (!response.ok) throw new Error("API request failed");

        const data: unknown = await response.json();
        const all = extractProducts(data);

        const filtered = all.filter((product) => {
          const categoryValue = product.category.toLowerCase();

          return (
            categoryValue === slug.toLowerCase() ||
            categoryValue === category.name ||
            (slug === "chal" && categoryValue === "rice")
          );
        });

        if (active) setProducts(filtered);
      } catch {
        if (active) setError("পণ্যের তথ্য লোড করা যায়নি।");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (slug) void load();

    return () => {
      active = false;
    };
  }, [slug, category.name]);

  const sortedProducts = useMemo(() => {
    const items = [...products];

    switch (sort) {
      case "low":
        return items.sort(
          (a, b) => (a.today ?? Infinity) - (b.today ?? Infinity)
        );
      case "high":
        return items.sort(
          (a, b) => (b.today ?? -Infinity) - (a.today ?? -Infinity)
        );
      case "name":
        return items.sort((a, b) => a.name.localeCompare(b.name, "bn"));
      case "increase":
        return items.sort((a, b) => b.change - a.change);
      case "decrease":
        return items.sort((a, b) => a.change - b.change);
      default:
        return items;
    }
  }, [products, sort]);

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
          <label htmlFor="category-sort" className="text-sm text-[#657168]">
            সাজান
          </label>

          <select
            id="category-sort"
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as SortOption)
            }
            className="min-w-[120px] cursor-pointer rounded-lg border border-[#D5DFD7] bg-white px-3 py-2 text-sm text-[#26332A] outline-none focus:border-[#008A40]"
          >
            <option value="featured">ফিচার্ড</option>
            <option value="low">দাম: কম থেকে বেশি</option>
            <option value="high">দাম: বেশি থেকে কম</option>
            <option value="name">নাম অনুযায়ী</option>
            <option value="increase">দাম সবচেয়ে বেড়েছে</option>
            <option value="decrease">দাম সবচেয়ে কমেছে</option>
          </select>
        </section>

        {/* PRODUCT COUNT */}
        <p className="text-sm text-[#68766C]">
          {loading
            ? "পণ্য লোড হচ্ছে..."
            : `মোট ${bn(sortedProducts.length)}টি পণ্য দেখানো হচ্ছে`}
        </p>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl bg-white"
              />
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

        {!loading && !error && sortedProducts.length === 0 && (
          <div className="rounded-2xl border border-[#DFE7E0] bg-white px-5 py-12 text-center text-sm text-[#68766C]">
            এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।
          </div>
        )}
      </div>
    </main>
  );
}
