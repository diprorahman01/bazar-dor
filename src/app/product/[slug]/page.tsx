
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductImage from "@/components/ui/ProductImage";

const API = "/api/bazardor";

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

const categoryNames: Record<string, string> = {
  chal: "চাল",
  dal: "ডাল",
  tel: "তেল",
  sobji: "সবজি",
  mach: "মাছ",
  mangsho: "মাংস",
  "dim-dudh": "ডিম-দুধ",
  moshla: "মসলা",
};

const categoryAliases: Record<string, string> = {
  rice: "chal",
  daal: "dal",
  lentil: "dal",
  oil: "tel",
  vegetables: "sobji",
  vegetable: "sobji",
  fish: "mach",
  meat: "mangsho",
  mangso: "mangsho",
  "egg-milk": "dim-dudh",
  eggs: "dim-dudh",
  milk: "dim-dudh",
  spices: "moshla",
  spice: "moshla",
  masala: "moshla",
};

function obj(value: unknown): Json {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Json)
    : {};
}

function str(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function num(value: unknown): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value !== "string") return null;

  const digits = "০১২৩৪৫৬৭৮৯";

  const cleaned = value
    .replace(/[০-৯]/g, (digit) =>
      String(digits.indexOf(digit))
    )
    .replace(/[,৳₹%\s]/g, "")
    .trim();

  if (!cleaned) return null;

  const result = Number(cleaned);

  return Number.isFinite(result) ? result : null;
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

function normalizeCategory(value: string): string {
  const key = value.trim().toLowerCase();

  if (categoryNames[key]) return key;
  if (categoryAliases[key]) return categoryAliases[key];

  const banglaMatch = Object.entries(
    categoryNames
  ).find(([, name]) => name === value);

  return banglaMatch?.[0] ?? "chal";
}

function parseMarket(value: unknown): Market | null {
  const m = obj(value);

  if (!Object.keys(m).length) return null;

  const min = firstNum(
    m.min,
    m.minPrice,
    m.minimum,
    m.lowest,
    m.low
  );

  const max = firstNum(
    m.max,
    m.maxPrice,
    m.maximum,
    m.highest,
    m.high
  );

  const avg = firstNum(
    m.avg,
    m.average,
    m.avgPrice,
    m.price,
    m.mean
  );

  if (
    min === null &&
    max === null &&
    avg === null
  ) {
    return null;
  }

  return {
    name:
      str(m.marketBn) ||
      str(m.marketNameBn) ||
      str(m.marketName) ||
      str(m.market) ||
      str(m.nameBn) ||
      str(m.name) ||
      "অজানা বাজার",

    division:
      str(m.divisionBn) ||
      str(m.division) ||
      str(m.districtBn) ||
      str(m.district) ||
      str(m.location) ||
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

function findProductObject(
  payload: unknown,
  requestedId: string,
  depth = 0
): Json | null {
  if (depth > 8) return null;

  if (Array.isArray(payload)) {
    const exactMatch = payload.find((item) => {
      const record = obj(item);
      const id = str(record.id ?? record._id);

      return id === requestedId;
    });

    if (exactMatch) {
      return findProductObject(
        exactMatch,
        requestedId,
        depth + 1
      );
    }

    return null;
  }

  const root = obj(payload);

  if (!Object.keys(root).length) return null;

  const rootId = str(root.id ?? root._id);

  const rootName =
    str(root.nameBn) ||
    str(root.name_bn) ||
    str(root.name);

  if (
    rootName &&
    (!rootId || rootId === requestedId)
  ) {
    return root;
  }

  const keys = [
    "product",
    "data",
    "result",
    "item",
    "products",
    "items",
    "results",
  ];

  for (const key of keys) {
    const nested = root[key];

    if (nested === undefined || nested === null) {
      continue;
    }

    const found = findProductObject(
      nested,
      requestedId,
      depth + 1
    );

    if (found) return found;
  }

  return null;
}

function extractMarketArray(
  payload: unknown,
  product: Json
): unknown[] {
  const root = obj(payload);
  const data = obj(root.data);
  const details = obj(data.product);

  const candidates = [
    product.markets,
    product.marketPrices,
    product.market_prices,
    product.prices,
    product.marketData,
    product.market_data,
    details.markets,
    data.markets,
    data.marketPrices,
    root.markets,
    root.marketPrices,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    const nested = obj(candidate);

    for (const key of ["data", "items", "results"]) {
      if (Array.isArray(nested[key])) {
        return nested[key] as unknown[];
      }
    }
  }

  return [];
}

function parseProduct(
  payload: unknown,
  requestedId: string
): Product | null {
  const p = findProductObject(
    payload,
    requestedId
  );

  if (!p) return null;

  const name =
    str(p.nameBn) ||
    str(p.name_bn) ||
    str(p.name);

  if (!name) return null;

  const categoryObject = obj(p.category);

  const rawCategory =
    str(p.categorySlug) ||
    str(p.category_slug) ||
    str(categoryObject.slug) ||
    str(p.categoryName) ||
    str(p.category);

  const categorySlug = normalizeCategory(
    rawCategory
  );

  const category =
    str(p.categoryNameBn) ||
    str(categoryObject.nameBn) ||
    str(categoryObject.name) ||
    categoryNames[categorySlug] ||
    "পণ্য";

  const today = firstNum(
    p.today,
    p.todayPrice,
    p.currentPrice,
    p.current_price,
    p.price
  );

  const yesterday = firstNum(
    p.yesterday,
    p.yesterdayPrice,
    p.previousPrice,
    p.previous_price
  );

  const changeObj = obj(p.change);

  let change = firstNum(
    changeObj.pct,
    changeObj.percent,
    p.changePct,
    p.changePercent
  );

  if (change === null) {
    change =
      today !== null &&
      yesterday !== null &&
      yesterday !== 0
        ? ((today - yesterday) / yesterday) * 100
        : 0;
  }

  const direction = (
    str(changeObj.dir) ||
    str(changeObj.direction) ||
    str(p.direction)
  ).toLowerCase();

  if (
    ["down", "decrease", "fall"].includes(
      direction
    )
  ) {
    change = -Math.abs(change);
  } else if (
    ["up", "increase", "rise"].includes(
      direction
    )
  ) {
    change = Math.abs(change);
  } else if (direction === "same") {
    change = 0;
  }

  const markets = extractMarketArray(
    payload,
    p
  )
    .map(parseMarket)
    .filter(
      (market): market is Market =>
        market !== null
    );

  return {
    id: str(p.id ?? p._id) || requestedId,
    name,
    image:
      str(p.image) ||
      str(p.icon) ||
      "🛒",
    unit:
      str(p.unitBn) ||
      str(p.unit) ||
      "কেজি",
    category,
    categorySlug,
    today,
    yesterday,
    change,
    markets,
  };
}

async function fetchJson(
  url: string,
  signal: AbortSignal
): Promise<unknown> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${url}`
    );
  }

  return response.json();
}

async function loadProduct(
  slug: string,
  signal: AbortSignal
): Promise<Product> {
  const encodedId = encodeURIComponent(slug);

  // Try the individual product endpoint first.
  try {
    const payload = await fetchJson(
      `${API}/products/${encodedId}`,
      signal
    );

    const product = parseProduct(
      payload,
      slug
    );

    if (product) {
      return product;
    }
  } catch (error) {
    if (signal.aborted) throw error;

    console.warn(
      "Individual product request failed:",
      error
    );
  }

  // Fallback: locate the product in the list.
  const listPayload = await fetchJson(
    `${API}/products`,
    signal
  );

  const product = parseProduct(
    listPayload,
    slug
  );

  if (!product) {
    throw new Error(
      `Product ${slug} was not found in the API response.`
    );
  }

  return product;
}

function ChangeText({
  change,
}: {
  change: number;
}) {
  if (Math.abs(change) < 0.001) {
    return (
      <span className="text-[#637067]">
        — ০.০%
      </span>
    );
  }

  return (
    <span
      className={
        change > 0
          ? "font-semibold text-[#EE353C]"
          : "font-semibold text-[#00994A]"
      }
    >
      {change > 0 ? "▲" : "▼"}{" "}
      {bn(Math.abs(change))}%
    </span>
  );
}

function LoadingSkeleton() {
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

export default function ProductDetailsPage() {
  const params = useParams();

  const slug = String(
    params.slug ?? ""
  ).trim();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
  if (!slug) {
    return;
  }

  const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        const result = await loadProduct(
          slug,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setProduct(result);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error(
          "Product details error:",
          err
        );

        setError(
          "পণ্যের তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন।"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, [slug]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!product || error) {
    return (
      <main className="min-h-[75vh] bg-[#F0F5F1] px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[#1B2920]">
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
    product.today !== null &&
    product.yesterday !== null
      ? product.today - product.yesterday
      : null;

  const minimums = product.markets
    .map((market) => market.min)
    .filter(
      (value): value is number =>
        value !== null
    );

  const maximums = product.markets
    .map((market) => market.max)
    .filter(
      (value): value is number =>
        value !== null
    );

  const averages = product.markets
    .map((market) => market.avg)
    .filter(
      (value): value is number =>
        value !== null
    );

  const minimum = minimums.length
    ? Math.min(...minimums)
    : null;

  const maximum = maximums.length
    ? Math.max(...maximums)
    : null;

  const average = averages.length
    ? averages.reduce(
        (sum, value) => sum + value,
        0
      ) / averages.length
    : null;

  return (
    <main className="min-h-[calc(100vh-190px)] bg-[#F0F5F1] px-4 pb-28 pt-7">
      <div className="mx-auto max-w-[1120px]">
        {/* BREADCRUMB */}

        <nav className="mb-7 flex flex-wrap items-center gap-3 text-[13px] text-[#27362C]">
          <Link
            href="/"
            className="hover:text-[#008A40]"
          >
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
                {product.unit.startsWith("প্রতি")
                  ? product.unit
                  : `প্রতি ${product.unit}`}{" "}
                · {product.category}
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
                    <>
                      {" "}·{" "}
                      {price(
                        Math.abs(difference)
                      )}
                    </>
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
              {product.today === null
                ? "—"
                : bn(product.today)}
            </p>

            <p className="mt-1 text-[12px] text-[#6B786E]">
              টাকা / {product.unit}
            </p>

            <p className="mt-1 text-[12px]">
              <ChangeText
                change={product.change}
              />
            </p>
          </div>
        </section>

        {/* PRICE SUMMARY */}

        <section className="mt-5 rounded-2xl border border-[#DFE7E0] bg-white px-5 py-5">
          <h2 className="mb-3 text-[17px] font-bold text-[#1B2920]">
            দামের সারসংক্ষেপ
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* MINIMUM */}

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

            {/* MAXIMUM */}

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

            {/* AVERAGE */}

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
                  <th className="px-4 py-3 font-semibold">
                    বাজার
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    বিভাগ
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    সর্বনিম্ন
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    সর্বোচ্চ
                  </th>

                  <th className="px-4 py-3 text-right font-semibold">
                    গড়
                  </th>
                </tr>
              </thead>

              <tbody>
                {product.markets.map(
                  (market, index) => (
                    <tr
                      key={`${market.name}-${index}`}
                      className={`border-t border-[#DDE5DF] ${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-[#F0F5F1]"
                      }`}
                    >
                      <td className="px-4 py-3">
                        {market.name}
                      </td>

                      <td className="px-4 py-3">
                        {market.division}
                      </td>

                      <td className="px-4 py-3">
                        {price(market.min)}
                      </td>

                      <td className="px-4 py-3">
                        {price(market.max)}
                      </td>

                      <td className="px-4 py-3 text-right font-bold">
                        {price(market.avg)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {product.markets.length === 0 && (
              <p className="border-t border-[#DFE7E0] px-4 py-8 text-center text-sm text-[#6B786E]">
                এই পণ্যের বাজারভিত্তিক দামের তথ্য
                পাওয়া যায়নি।
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
