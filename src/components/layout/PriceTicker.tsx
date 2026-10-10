
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  loadBazarProducts,
  banglaPrice,
  banglaPercent,
  type BazarProduct,
} from "@/lib/bazar-data";

const TWEMOJI_BASE =
  "https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.2/assets/svg";

// ==========================================
// PRODUCT EMOJI MAPPING
// ==========================================

function getEmojiForProduct(
  name: string,
  fallback: string
): string {
  const n = name.trim();

  if (n.includes("চাল")) return "🍚";
  if (n.includes("ডাল") || n.includes("ছোলা")) return "🫘";
  if (n.includes("তেল")) return "🫙";

  if (n.includes("পেঁয়াজ") || n.includes("পেঁয়াজ")) {
    return "🧅";
  }

  if (n.includes("রসুন")) return "🧄";
  if (n.includes("আলু")) return "🥔";
  if (n.includes("বেগুন")) return "🍆";
  if (n.includes("মরিচ")) return "🌶️";
  if (n.includes("আদা")) return "🫚";

  if (n.includes("চিংড়ি") || n.includes("চিংড়ি")) {
    return "🦐";
  }

  if (n.includes("মাছ")) return "🐟";
  if (n.includes("মুরগি")) return "🍗";

  if (n.includes("গরুর") || n.includes("খাসির")) {
    return "🥩";
  }

  if (n.includes("ডিম")) return "🥚";
  if (n.includes("দুধ")) return "🥛";
  if (n.includes("লবণ")) return "🧂";

  return fallback;
}

// ==========================================
// EMOJI URL GENERATOR
// ==========================================

function getTwemojiUrl(emoji: string): string {
  const code = Array.from(emoji)
    .map((character) =>
      character.codePointAt(0)!.toString(16)
    )
    .filter((value) => value !== "fe0f")
    .join("-");

  return `${TWEMOJI_BASE}/${code}.svg`;
}

// ==========================================
// TICKER EMOJI
// ==========================================

function TickerEmoji({
  product,
}: {
  product: BazarProduct;
}) {
  const emoji = getEmojiForProduct(
    product.name,
    product.icon
  );

  const [failedUrl, setFailedUrl] = useState<string | null>(
    null
  );

  if (!emoji) return null;

  const url = getTwemojiUrl(emoji);
  const failed = failedUrl === url;

  if (failed) {
    return (
      <span
        role="img"
        aria-label={product.name}
        className="shrink-0 bg-transparent text-[18px] leading-none"
      >
        {emoji}
      </span>
    );
  }

  return (
    <Image
      src={url}
      alt={product.name}
      width={18}
      height={18}
      unoptimized
      className="block h-[18px] w-[18px] shrink-0 bg-transparent object-contain"
      onError={() => setFailedUrl(url)}
    />
  );
}

// ==========================================
// TICKER PRODUCT ITEMS
// ==========================================

function TickerItems({
  products,
}: {
  products: BazarProduct[];
}) {
  return (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {products.map((product) => {
        const change = product.change;

        return (
          <div
            key={product.id}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap"
          >
            <TickerEmoji product={product} />

            <span className="text-[13px] font-semibold text-[#233B2B]">
              {product.name}
            </span>

            <span className="text-[13px] font-bold text-[#152E1E]">
              {banglaPrice(product.price)}
            </span>

            {change !== null && Number.isFinite(change) && (
              <span
                className={
                  "text-[12px] font-bold " +
                  (change > 0
                    ? "text-red-600"
                    : change < 0
                      ? "text-green-600"
                      : "text-gray-500")
                }
              >
                {change > 0
                  ? "▲"
                  : change < 0
                    ? "▼"
                    : "—"}{" "}
                {banglaPercent(Math.abs(change))}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// MAIN PRICE TICKER
// ==========================================

export default function PriceTicker() {
  const [products, setProducts] = useState<BazarProduct[]>(
    []
  );

  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchTickerData() {
      try {
        const result = await loadBazarProducts();

        if (!active) return;

        setProducts(result.products);
        setError(false);
      } catch (err) {
        console.error("Price ticker error:", err);

        if (active) {
          setError(true);
        }
      }
    }

    void fetchTickerData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex h-[48px] w-full overflow-hidden border-y border-[#DDE9DF] bg-white">
      {/* FULL-WIDTH SCROLLING PRODUCTS */}
      <div className="flex min-w-0 flex-1 items-center overflow-hidden">
        {products.length > 0 ? (
          <div className="bazar-marquee flex w-max items-center">
            <TickerItems products={products} />

            {/* Duplicate items for seamless scrolling */}
            <div
              aria-hidden="true"
              className="flex shrink-0"
            >
              <TickerItems products={products} />
            </div>
          </div>
        ) : (
          <p className="px-5 text-xs text-gray-500">
            {error
              ? "বাজার দর লোড করা যায়নি"
              : "বাজার দর লোড হচ্ছে..."}
          </p>
        )}
      </div>
    </div>
  );
}
