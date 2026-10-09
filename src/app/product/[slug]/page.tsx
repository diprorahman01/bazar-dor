
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductImage from "@/components/ui/ProductImage";

const API = "https://api.api-store.workers.dev/api/bazardor";

type Json = Record<string, unknown>;

type Market = {
  name: string;
  division: string;
  min: number | null;
  max: number | null;
  avg: number | null;
};

type Product = {
  id: string;
  name: string;
  image: string;
  unit: string;
  category: string;
  categorySlug: string;
  today: number | null;
  yesterday: number | null;
  change: number;
  markets: Market[];
};

function obj(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
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

function firstNum(...values: unknown[]): number | null {
  for (const value of values) {
    const result = num(value);
    if (result !== null) return result;
  }
  return null;
}

function bn(value: number): string {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(value);
}

function price(value: number | null): string {
  return value === null ? "—" : `${bn(value)} টাকা`;
}

function parseMarket(value: unknown): Market | null {
  const m = obj(value);
  if (!Object.keys(m).length) return null;

  const min = firstNum(m.min, m.minPrice, m.minimum, m.lowest);
  const max = firstNum(m.max, m.maxPrice, m.maximum, m.highest);
  const avg = firstNum(m.avg, m.average, m.avgPrice, m.price);

  if (min === null && max === null && avg === null) return null;

  return {
    name:
      str(m.marketBn) ||
      str(m.marketNameBn) ||
      str(m.market) ||
      str(m.nameBn) ||
      str(m.name) ||
      "অজানা বাজার",
    division:
      str(m.divisionBn) ||
      str(m.division) ||
      str(m.districtBn) ||
      str(m.district) ||
      "—",
    min,
    max,
    avg:
      avg ??
      (min !== null && max !== null
        ? (min + max) / 2
        : min ?? max),
  };
}

function parseProduct(payload: unknown, slug: string): Product | null {
  const root = obj(payload);
  const data = obj(root.data);

  const p =
    (Object.keys(obj(root.product)).length && obj(root.product)) ||
    (Object.keys(obj(data.product)).length && obj(data.product)) ||
    (Object.keys(data).length && data) ||
    root;

  const name = str(p.nameBn) || str(p.name);
  if (!name) return null;

  const categoryObj = obj(p.category);

  const categorySlug =
    str(p.categorySlug) ||
    str(categoryObj.slug) ||
    str(p.category) ||
    "chal";

  const categoryNames: Record<string, string> = {
    chal: "চাল",
    dal: "ডাল",
    tel: "তেল",
    sobji: "সবজি",
    mach: "মাছ",
    mangso: "মাংস",
    "dim-dudh": "ডিম-দুধ",
    moshla: "মসলা",
  };

  const today = firstNum(p.today, p.todayPrice, p.price);
  const yesterday = firstNum(p.yesterday, p.yesterdayPrice);

  const changeObj = obj(p.change);

  let change = firstNum(changeObj.pct, p.changePct, p.changePercent);

  if (change === null) {
    change =
      today !== null && yesterday !== null && yesterday !== 0
        ? ((today - yesterday) / yesterday) * 100
        : 0;
  }

  const direction = str(changeObj.dir).toLowerCase();

  if (direction === "down" || direction === "decrease") {
    change = -Math.abs(change);
  } else if (direction === "up" || direction === "increase") {
    change = Math.abs(change);
  }

  const marketsArray =
    (Array.isArray(p.markets) && p.markets) ||
    (Array.isArray(p.marketPrices) && p.marketPrices) ||
    (Array.isArray(p.prices) && p.prices) ||
    (Array.isArray(root.markets) && root.markets) ||
    [];

  return {
    id: String(p.id ?? slug),
    name,
    image: str(p.image) || "🛒",
    unit: str(p.unitBn) || str(p.unit) || "কেজি",
    category:
      str(p.categoryNameBn) ||
      str(categoryObj.nameBn) ||
      categoryNames[categorySlug] ||
      "পণ্য",
    categorySlug,
    today,
    yesterday,
    change,
    markets: marketsArray
      .map(parseMarket)
      .filter((m): m is Market => m !== null),
  };
}

function ChangeText({ change }: { change: number }) {
  if (Math.abs(change) < 0.001) {
    return <span className="text-[#637067]">— ০.০%</span>;
  }

  return (
    <span
      className={`font-semibold ${
        change > 0 ? "text-[#EE353C]" : "text-[#00994A]"
      }`}
    >
      {change > 0 ? "▲" : "▼"} {bn(Math.abs(change))}%
    </span>
  );
}

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        const response = await fetch(
          `${API}/products/${encodeURIComponent(slug)}`,
          { cache: "no-store" }
        );

        if (!response.ok) throw new Error("Product request failed");

        const payload: unknown = await response.json();
        const parsed = parseProduct(payload, slug);

        if (!parsed) throw new Error("Product not found");

        if (active) setProduct(parsed);
      } catch {
        if (active) setError("পণ্যের তথ্য পাওয়া যায়নি।");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (slug) void load();

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-[75vh] bg-[#F0F5F1] px-4 py-10">
        <div className="mx-auto max-w-[1120px] animate-pulse space-y-5">
          <div className="h-5 w-48 rounded bg-[#DCE5DE]" />
          <div className="h-36 rounded-2xl bg-white" />
          <div className="h-[450px] rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (!product || error) {
    return (
      <main className="min-h-[75vh] bg-[#F0F5F1] px-4 py-16 text-center">
        <h1 className="text-xl font-bold">
          {error || "পণ্য পাওয়া যায়নি।"}
        </h1>
        <Link
          href="/"
          className="mt-4 inline-block text-[#008A40] hover:underline"
        >
          ← হোম পেজে ফিরে যান
        </Link>
      </main>
    );
  }

  const difference =
    product.today !== null && product.yesterday !== null
      ? product.today - product.yesterday
      : null;

  const minimums = product.markets
    .map((m) => m.min)
    .filter((v): v is number => v !== null);

  const maximums = product.markets
    .map((m) => m.max)
    .filter((v): v is number => v !== null);

  const averages = product.markets
    .map((m) => m.avg)
    .filter((v): v is number => v !== null);

  const minimum = minimums.length ? Math.min(...minimums) : null;
  const maximum = maximums.length ? Math.max(...maximums) : null;
  const average = averages.length
    ? averages.reduce((a, b) => a + b, 0) / averages.length
    : null;

  return (
    <main className="min-h-[calc(100vh-190px)] bg-[#F0F5F1] px-4 pb-28 pt-7">
      <div className="mx-auto max-w-[1120px]">
        {/* BREADCRUMB */}
        <nav className="mb-7 flex flex-wrap items-center gap-3 text-[13px] text-[#27362C]">
          <Link href="/" className="hover:text-[#008A40]">
            হোম
          </Link>
          <span>›</span>
          <Link
            href={`/category/${product.categorySlug}`}
            className="hover:text-[#008A40]"
          >
            {product.category}
          </Link>
          <span>›</span>
          <span>{product.name}</span>
        </nav>

        {/* PRODUCT HEADER */}
        <section className="flex flex-col justify-between gap-5 rounded-2xl border border-[#DFE7E0] bg-white px-5 py-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <ProductImage
              name={product.name}
              icon={product.image}
              size={48}
            />

            <div className="min-w-0">
              <h1 className="text-[24px] font-bold leading-tight text-[#1B2920] sm:text-[27px]">
                {product.name}
              </h1>

              <p className="mt-1 text-[13px] text-[#69776E]">
                প্রতি {product.unit} · {product.category}
              </p>

              {difference !== null && (
                <p className="mt-1 text-[12px] text-[#344239]">
                  গতকালের তুলনায় আজ দাম{" "}
                  {difference > 0
                    ? "বেড়েছে"
                    : difference < 0
                      ? "কমেছে"
                      : "অপরিবর্তিত"}
                  {difference !== 0 && (
                    <> · {price(Math.abs(difference))}</>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="min-w-[116px] self-start rounded-2xl bg-[#F0F5F1] px-4 py-3 text-center sm:self-auto">
            <p className="text-[12px] text-[#6B786E]">
              আজকের দাম
            </p>

            <p className="mt-1 text-[27px] font-bold leading-none text-[#1C2A20]">
              {product.today === null ? "—" : bn(product.today)}
            </p>

            <p className="mt-1 text-[12px] text-[#6B786E]">
              টাকা / {product.unit}
            </p>

            <p className="mt-1 text-[12px]">
              <ChangeText change={product.change} />
            </p>
          </div>
        </section>

        {/* PRICE SUMMARY */}
        <section className="mt-5 rounded-2xl border border-[#DFE7E0] bg-white px-5 py-5">
          <h2 className="mb-3 text-[17px] font-bold text-[#1B2920]">
            দামের সারসংক্ষেপ
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#DFE7E0] px-5 py-4">
              <p className="text-[12px] text-[#6A786E]">
                সর্বনিম্ন দাম
              </p>
              <p className="mt-1 text-[22px] font-bold text-[#009A4A]">
                {price(minimum)}
              </p>
              <p className="text-[12px] text-[#6A786E]">
                সবচেয়ে কম দামের বাজার
              </p>
            </div>

            <div className="rounded-2xl border border-[#DFE7E0] px-5 py-4">
              <p className="text-[12px] text-[#6A786E]">
                সর্বোচ্চ দাম
              </p>
              <p className="mt-1 text-[22px] font-bold text-[#E63840]">
                {price(maximum)}
              </p>
              <p className="text-[12px] text-[#6A786E]">
                সবচেয়ে বেশি দামের বাজার
              </p>
            </div>

            <div className="rounded-2xl border border-[#DFE7E0] px-5 py-4">
              <p className="text-[12px] text-[#6A786E]">
                গড় দাম
              </p>
              <p className="mt-1 text-[22px] font-bold text-[#009A4A]">
                {price(average)}
              </p>
              <p className="text-[12px] text-[#6A786E]">
                প্রতি {product.unit}-এর হিসাবে
              </p>
            </div>
          </div>

          {/* MARKET TABLE */}
          <h2 className="mb-3 mt-6 text-[17px] font-bold text-[#1B2920]">
            বাজারভিত্তিক আজকের দাম
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-[#DFE7E0]">
            <table className="w-full min-w-[650px] border-collapse text-left text-[13px] text-[#26332A]">
              <thead className="bg-[#FAFCFA] text-[#77847B]">
                <tr>
                  <th className="px-4 py-3 font-semibold">বাজার</th>
                  <th className="px-4 py-3 font-semibold">বিভাগ</th>
                  <th className="px-4 py-3 font-semibold">সর্বনিম্ন</th>
                  <th className="px-4 py-3 font-semibold">সর্বোচ্চ</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    গড়
                  </th>
                </tr>
              </thead>

              <tbody>
                {product.markets.map((market, index) => (
                  <tr
                    key={`${market.name}-${index}`}
                    className={`border-t border-[#DDE5DF] ${
                      index % 2 === 0
                        ? "bg-white"
                        : "bg-[#F0F5F1]"
                    }`}
                  >
                    <td className="px-4 py-3">{market.name}</td>
                    <td className="px-4 py-3">{market.division}</td>
                    <td className="px-4 py-3">{price(market.min)}</td>
                    <td className="px-4 py-3">{price(market.max)}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      {price(market.avg)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {product.markets.length === 0 && (
              <p className="border-t border-[#DFE7E0] px-4 py-8 text-center text-sm text-[#6B786E]">
                এই পণ্যের বাজারভিত্তিক দামের তথ্য পাওয়া যায়নি।
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
