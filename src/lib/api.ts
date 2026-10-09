
import type { Product } from "@/types/product";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.abcz.workers.dev/api/bazardor";

type ApiObject = Record<string, unknown>;

function asObject(value: unknown): ApiObject {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as ApiObject;
  }

  return {};
}

function firstValue(
  object: ApiObject,
  keys: string[]
): unknown {
  for (const key of keys) {
    const value = object[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return undefined;
}

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const banglaDigits = "০১২৩৪৫৬৭৮৯";

  const normalized = value
    .replace(/[০-৯]/g, (digit) =>
      String(banglaDigits.indexOf(digit))
    )
    .replace(/,/g, "")
    .replace(/[▲▼৳%]/g, "")
    .trim();

  if (!normalized) return null;

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}

function getIcon(
  name: string,
  category: string,
  existing?: unknown
): string {
  const supplied = toText(existing);

  if (supplied) return supplied;

  const text = `${name} ${category}`.toLowerCase();

  if (text.includes("চাল")) return "🍚";
  if (text.includes("ডাল")) return "🫘";
  if (text.includes("তেল")) return "🫙";
  if (text.includes("পেঁয়াজ")) return "🧅";
  if (text.includes("আলু")) return "🥔";
  if (text.includes("রসুন")) return "🧄";
  if (text.includes("মরিচ")) return "🌶️";
  if (text.includes("ডিম")) return "🥚";
  if (text.includes("দুধ")) return "🥛";
  if (text.includes("মাছ")) return "🐟";
  if (text.includes("মাংস")) return "🍗";
  if (text.includes("মসলা")) return "🌶️";
  if (text.includes("সবজি")) return "🥬";

  return "🛒";
}

function normalizeProduct(
  value: unknown,
  index: number
): Product {
  const item = asObject(value);

  const name =
    toText(
      firstValue(item, [
        "name_bn",
        "nameBn",
        "name",
        "title",
        "productName",
      ])
    ) || `পণ্য ${index + 1}`;

  const categoryValue = firstValue(item, [
    "category",
    "category_name",
    "categoryName",
  ]);

  const category =
    typeof categoryValue === "object"
      ? toText(
          firstValue(asObject(categoryValue), [
            "name",
            "slug",
          ])
        )
      : toText(categoryValue);

  const priceObject = asObject(item.price);

  const price = toNumber(
    firstValue(item, [
      "current_price",
      "currentPrice",
      "today_price",
      "todayPrice",
      "average_price",
      "averagePrice",
    ]) ??
      firstValue(priceObject, [
        "current",
        "today",
        "average",
        "value",
      ]) ??
      item.price
  );

  const previousPrice = toNumber(
    firstValue(item, [
      "previous_price",
      "previousPrice",
      "yesterday_price",
      "yesterdayPrice",
    ]) ??
      firstValue(priceObject, [
        "previous",
        "yesterday",
      ])
  );

  let change = toNumber(
    firstValue(item, [
      "change_percent",
      "changePercent",
      "price_change_percent",
      "priceChangePercent",
      "percentageChange",
      "change_percentage",
    ])
  );

  if (change === null) {
    const rawChange = firstValue(item, [
      "change",
      "priceChange",
      "trend",
    ]);

    if (
      typeof rawChange === "number" ||
      typeof rawChange === "string"
    ) {
      change = toNumber(rawChange);
    } else {
      change = toNumber(
        firstValue(asObject(rawChange), [
          "percent",
          "percentage",
          "value",
        ])
      );
    }
  }

  const direction = toText(
    firstValue(item, [
      "direction",
      "price_direction",
      "change_direction",
    ])
  ).toLowerCase();

  if (change !== null) {
    if (
      direction === "down" ||
      direction === "decrease" ||
      direction === "fall"
    ) {
      change = -Math.abs(change);
    }

    if (
      direction === "up" ||
      direction === "increase" ||
      direction === "rise"
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

  const id =
    toText(
      firstValue(item, [
        "id",
        "_id",
        "product_id",
        "productId",
        "slug",
      ])
    ) || String(index + 1);

  const unit =
    toText(
      firstValue(item, [
        "unit_bn",
        "unit",
        "unitName",
        "price_unit",
      ])
    ) || "প্রতি কেজি";

  return {
    id,
    name,
    category,
    unit,
    icon: getIcon(
      name,
      category,
      firstValue(item, ["emoji", "icon"])
    ),
    price,
    change,
  };
}

function findProductArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;

  const object = asObject(data);

  for (const key of ["products", "data", "items", "results"]) {
    const result = object[key];

    if (Array.isArray(result)) return result;

    if (result && typeof result === "object") {
      const nested = asObject(result);

      if (Array.isArray(nested.products)) {
        return nested.products;
      }

      if (Array.isArray(nested.items)) {
        return nested.items;
      }
    }
  }

  return [];
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("পণ্যের তথ্য লোড করা যায়নি");
  }

  const data: unknown = await response.json();

  const items = findProductArray(data);

  if (items.length === 0) {
    throw new Error(
      "API থেকে পণ্যের তালিকা পাওয়া যায়নি"
    );
  }

  return items.map(normalizeProduct);
}
