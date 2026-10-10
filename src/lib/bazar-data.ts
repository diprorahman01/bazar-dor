
export type BazarProduct = {
  id: string;
  name: string;
  unit: string;
  icon: string;
  price: number | null;
  change: number | null;
  demo: boolean;
};

const DEFAULT_API_BASE =
  "https://openapi.programming-hero.com/api/bazardor";

const API_BASE = (
  process.env.NEXT_PUBLIC_BAZARDOR_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  DEFAULT_API_BASE
).replace(/\/+$/, "");

type ApiProduct = {
  id?: string | number;
  nameBn?: string;
  name_bn?: string;
  name?: string;
  unit?: string;
  image?: string;
  emoji?: string;
  icon?: string;
  today?: number | string;
  yesterday?: number | string;
  current_price?: number | string;
  price?: number | string;
  change?: {
    dir?: string;
    direction?: string;
    pct?: number | string;
    percent?: number | string;
  };
};

function getProductsArray(data: unknown): ApiProduct[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const result = data as Record<string, unknown>;

  if (Array.isArray(result.products)) {
    return result.products;
  }

  if (Array.isArray(result.items)) {
    return result.items;
  }

  if (Array.isArray(result.results)) {
    return result.results;
  }

  if (result.data) {
    return getProductsArray(result.data);
  }

  return [];
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const digits = "০১২৩৪৫৬৭৮৯";

    const normalized = value
      .replace(/[০-৯]/g, (digit) =>
        String(digits.indexOf(digit))
      )
      .replace(/,/g, "")
      .replace(/[৳%▲▼]/g, "")
      .trim();

    const match = normalized.match(/-?\d+(\.\d+)?/);

    if (!match) return null;

    const parsed = Number(match[0]);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeProduct(
  item: ApiProduct,
  index: number
): BazarProduct {
  const price = toNumber(
    item.today ?? item.current_price ?? item.price
  );

  const yesterday = toNumber(item.yesterday);

  const percentage = toNumber(
    item.change?.pct ?? item.change?.percent
  );

  let change: number | null = null;

  if (percentage !== null) {
    const direction = (
      item.change?.dir ??
      item.change?.direction ??
      ""
    ).toLowerCase();

    if (direction === "up") {
      change = Math.abs(percentage);
    } else if (direction === "down") {
      change = -Math.abs(percentage);
    } else if (direction === "same") {
      change = 0;
    } else {
      change = percentage;
    }
  } else if (
    price !== null &&
    yesterday !== null &&
    yesterday > 0
  ) {
    change = ((price - yesterday) / yesterday) * 100;
  }

  return {
    id: String(item.id ?? index + 1),
    name:
      item.nameBn ??
      item.name_bn ??
      item.name ??
      "নাম পাওয়া যায়নি",
    unit: item.unit ?? "kg",
    icon:
      item.image ??
      item.emoji ??
      item.icon ??
      "",
    price,
    change,
    demo: false,
  };
}

export async function loadBazarProducts(): Promise<{
  products: BazarProduct[];
  usingDemo: boolean;
}> {
  try {
    const url = `${API_BASE}/products`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `BazarDor API returned HTTP ${response.status}`
      );
    }

    const data: unknown = await response.json();
    const items = getProductsArray(data);

    if (!items.length) {
      throw new Error(
        "BazarDor API returned no products."
      );
    }

    return {
      products: items.map(normalizeProduct),
      usingDemo: false,
    };
  } catch (error) {
    console.error(
      "Unable to load BazarDor products:",
      error
    );

    return {
      products: [],
      usingDemo: false,
    };
  }
}

export function banglaPrice(
  price: number | null
): string {
  if (price === null) {
    return "দাম পাওয়া যায়নি";
  }

  return (
    new Intl.NumberFormat("bn-BD", {
      maximumFractionDigits: 2,
    }).format(price) + " টাকা"
  );
}

export function banglaPercent(
  value: number | null
): string {
  if (value === null) {
    return "তথ্য নেই";
  }

  return (
    new Intl.NumberFormat("bn-BD", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(Math.abs(value)) + "%"
  );
}

export function banglaUnit(unit: string): string {
  const units: Record<string, string> = {
    kg: "প্রতি কেজি",
    g: "প্রতি গ্রাম",
    gram: "প্রতি গ্রাম",
    litre: "প্রতি লিটার",
    liter: "প্রতি লিটার",
    dozen: "প্রতি ডজন",
    piece: "প্রতি পিস",
    pcs: "প্রতি পিস",
  };

  return units[unit.trim().toLowerCase()] ?? unit;
}
