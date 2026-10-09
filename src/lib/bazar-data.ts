
export type BazarProduct = {
  id: string;
  name: string;
  unit: string;
  icon: string;
  price: number | null;
  change: number | null;
  demo: boolean;
};

const API_BASE =
  "https://api.api-store.workers.dev/api/bazardor";

type ApiProduct = {
  id?: string | number;
  nameBn?: string;
  name?: string;
  unit?: string;
  image?: string;
  today?: number | string;
  yesterday?: number | string;
  change?: {
    dir?: string;
    pct?: number | string;
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
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeProduct(
  item: ApiProduct,
  index: number
): BazarProduct {
  const price = toNumber(item.today);
  const yesterday = toNumber(item.yesterday);
  const percentage = toNumber(item.change?.pct);

  let change: number | null = null;

  if (percentage !== null) {
    const direction =
      item.change?.dir?.toLowerCase();

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
      item.name ??
      "নাম পাওয়া যায়নি",
    unit: item.unit ?? "kg",

    // Use EXACTLY what the API sends.
    // No mapping, replacement, or invented emoji.
    icon:
      typeof item.image === "string"
        ? item.image
        : "",

    price,
    change,
    demo: false,
  };
}

export async function loadBazarProducts(): Promise<{
  products: BazarProduct[];
  usingDemo: boolean;
}> {
  const response = await fetch(
    `${API_BASE}/products`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(
      `BazarDor API error: ${response.status}`
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
