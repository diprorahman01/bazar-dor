
import type { Product } from "@/types/product";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.api-store.workers.dev/api/bazardor";

type DataObject = Record<string, unknown>;

function isObject(value: unknown): value is DataObject {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function findField(
  object: DataObject,
  keys: string[]
): unknown {
  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return undefined;
}

function getText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  return "";
}

function getNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const digits = "০১২৩৪৫৬৭৮৯";

  const normalized = value
    .replace(/[০-৯]/g, (digit) =>
      String(digits.indexOf(digit))
    )
    .replace(/,/g, "")
    .replace(/[৳%▲▼]/g, "")
    .trim();

  if (!normalized) return null;

  const match = normalized.match(/-?\d+(\.\d+)?/);

  if (!match) return null;

  const number = Number(match[0]);

  return Number.isFinite(number) ? number : null;
}

function getNumericField(
  object: DataObject,
  keys: string[]
): number | null {
  for (const key of keys) {
    const number = getNumber(object[key]);

    if (number !== null) return number;
  }

  return null;
}

function getEmoji(
  name: string,
  category: string
): string {
  const text = `${name} ${category}`.toLowerCase();

  if (text.includes("চাল") || text.includes("rice"))
    return "🍚";

  if (text.includes("ডাল") || text.includes("lentil"))
    return "🫘";

  if (text.includes("তেল") || text.includes("oil"))
    return "🫙";

  if (text.includes("আলু")) return "🥔";
  if (text.includes("পেঁয়াজ")) return "🧅";
  if (text.includes("মরিচ")) return "🌶️";
  if (text.includes("রসুন")) return "🧄";
  if (text.includes("আদা")) return "🫚";
  if (text.includes("ডিম")) return "🥚";
  if (text.includes("দুধ")) return "🥛";
  if (text.includes("মাছ")) return "🐟";
  if (text.includes("মাংস")) return "🍗";
  if (text.includes("সবজি")) return "🥬";

  return "🛒";
}

function getProductArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;

  if (!isObject(data)) return [];

  const keys = [
    "products",
    "data",
    "items",
    "results",
  ];

  for (const key of keys) {
    const value = data[key];

    if (Array.isArray(value)) return value;

    if (isObject(value)) {
      const nested = getProductArray(value);

      if (nested.length > 0) return nested;
    }
  }

  return [];
}

function getMarketPrices(
  item: DataObject
): number[] {
  const possibleFields = [
    "markets",
    "bazaars",
    "bazars",
    "market_prices",
    "marketPrices",
    "bazar_prices",
    "bazarPrices",
    "prices",
  ];

  const prices: number[] = [];

  for (const field of possibleFields) {
    const value = item[field];

    if (!Array.isArray(value)) continue;

    for (const market of value) {
      if (!isObject(market)) continue;

      const price = getNumericField(market, [
        "price",
        "current_price",
        "currentPrice",
        "today_price",
        "todayPrice",
        "average",
        "avg",
      ]);

      if (price !== null) {
        prices.push(price);
      }
    }

    if (prices.length > 0) break;
  }

  return prices;
}

function normalizeProduct(
  raw: unknown,
  index: number
): Product {
  const item: DataObject = isObject(raw) ? raw : {};

  const id =
    getText(
      findField(item, [
        "id",
        "_id",
        "product_id",
        "productId",
        "slug",
      ])
    ) || String(index + 1);

  const name =
    getText(
      findField(item, [
        "name_bn",
        "nameBn",
        "nameBangla",
        "name",
        "title",
        "product_name",
        "productName",
      ])
    ) || `পণ্য ${index + 1}`;

  const rawCategory = findField(item, [
    "category",
    "category_name",
    "categoryName",
  ]);

  const category = isObject(rawCategory)
    ? getText(
        findField(rawCategory, [
          "name_bn",
          "name",
          "slug",
        ])
      )
    : getText(rawCategory);

  const unit =
    getText(
      findField(item, [
        "unit_bn",
        "unit",
        "unitName",
        "price_unit",
        "priceUnit",
      ])
    ) || "প্রতি কেজি";

  const priceObject = isObject(item.price)
    ? item.price
    : {};

  const marketPrices = getMarketPrices(item);

  let price = getNumericField(item, [
    "current_price",
    "currentPrice",
    "today_price",
    "todayPrice",
    "avg_price",
    "avgPrice",
    "average_price",
    "averagePrice",
    "price",
    "price_today",
  ]);

  if (price === null) {
    price = getNumericField(priceObject, [
      "current",
      "today",
      "average",
      "avg",
      "value",
      "amount",
    ]);
  }

  if (price === null && marketPrices.length > 0) {
    price =
      marketPrices.reduce((sum, p) => sum + p, 0) /
      marketPrices.length;
  }

  const previousPrice =
    getNumericField(item, [
      "previous_price",
      "previousPrice",
      "yesterday_price",
      "yesterdayPrice",
      "old_price",
      "oldPrice",
      "last_price",
      "lastPrice",
    ]) ??
    getNumericField(priceObject, [
      "previous",
      "yesterday",
      "old",
    ]);

  let change = getNumericField(item, [
    "change_percent",
    "changePercent",
    "price_change_percent",
    "priceChangePercent",
    "change_percentage",
    "changePercentage",
    "percentage_change",
    "percentageChange",
    "percent_change",
    "percentChange",
    "change_pct",
  ]);

  const rawChange = findField(item, [
    "change",
    "price_change",
    "priceChange",
  ]);

  if (change === null) {
    if (isObject(rawChange)) {
      change = getNumericField(rawChange, [
        "percent",
        "percentage",
        "percentChange",
        "changePercent",
      ]);
    } else if (
      typeof rawChange === "string" &&
      rawChange.includes("%")
    ) {
      change = getNumber(rawChange);
    }
  }

  const direction = getText(
    findField(item, [
      "direction",
      "trend",
      "change_direction",
      "price_direction",
    ])
  ).toLowerCase();

  if (change !== null) {
    if (
      ["down", "decrease", "fall", "decreased"].includes(
        direction
      )
    ) {
      change = -Math.abs(change);
    }

    if (
      ["up", "increase", "rise", "increased"].includes(
        direction
      )
    ) {
      change = Math.abs(change);
    }
  }

  if (
    change === null &&
    price !== null &&
    previousPrice !== null &&
    previousPrice !== 0
  ) {
    change =
      ((price - previousPrice) / previousPrice) * 100;
  }

  return {
    id,
    name,
    category,
    unit,
    icon:
      getText(findField(item, ["emoji", "icon"])) ||
      getEmoji(name, category),
    price,
    change,
  };
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${BASE_URL}/products`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Products API error: ${response.status}`
    );
  }

  const data: unknown = await response.json();

  const rawProducts = getProductArray(data);

  if (rawProducts.length === 0) {
    throw new Error(
      "API থেকে পণ্যের তালিকা পাওয়া যায়নি"
    );
  }

  return rawProducts.map(normalizeProduct);
}
