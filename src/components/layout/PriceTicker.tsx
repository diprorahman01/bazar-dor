
"use client";

import { useEffect, useState } from "react";

import {
  loadBazarProducts,
  banglaPrice,
  banglaPercent,
  type BazarProduct,
} from "@/lib/bazar-data";

const TWEMOJI_BASE =
  "https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.2/assets/svg";

function getEmojiForProduct(name: string, fallback: string) {
  const n = name.trim();

  // Match grocery items to the closest available Twemoji
  if (n.includes("চাল")) return "🍚";
  if (n.includes("ডাল") || n.includes("ছোলা")) return "🫘";
  if (n.includes("তেল")) return "🫙";

  if (n.includes("পেঁয়াজ") || n.includes("পেঁয়াজ")) return "🧅";
  if (n.includes("রসুন")) return "🧄";
  if (n.includes("আলু")) return "🥔";
  if (n.includes("বেগুন")) return "🍆";
  if (n.includes("মরিচ")) return "🌶️";
  if (n.includes("আদা")) return "🫚";

  if (n.includes("চিংড়ি") || n.includes("চিংড়ি")) return "🦐";
  if (n.includes("মাছ")) return "🐟";

  if (n.includes("মুরগি")) return "🍗";
  if (n.includes("গরুর") || n.includes("খাসির")) return "🥩";

  if (n.includes("ডিম")) return "🥚";
  if (n.includes("দুধ")) return "🥛";
  if (n.includes("লবণ")) return "🧂";

  return fallback;
}

function getTwemojiUrl(emoji: string) {
  const code = Array.from(emoji)
    .map((character) =>
      character.codePointAt(0)!.toString(16)
    )
    .filter((code) => code !== "fe0f")
    .join("-");

  return `${TWEMOJI_BASE}/${code}.svg`;
}

function TickerEmoji({
  product,
}: {
  product: BazarProduct;
}) {
  const emoji = getEmojiForProduct(
    product.name,
    product.icon
  );

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [emoji]);

  if (!emoji) return null;

  return failed ? (
    <span
      role="img"
      aria-label={product.name}
      className="shrink-0 bg-transparent text-[18px] leading-none"
    >
      {emoji}
    </span>
  ) : (
    <img
      src={getTwemojiUrl(emoji)}
      alt={product.name}
      width={18}
      height={18}
      className="block h-[18px] w-[18px] shrink-0 bg-transparent object-contain"
      onError={() => setFailed(true)}
    />
  );
}

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

            {change !== null && (
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
                {banglaPercent(change)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PriceTicker() {
  const [products, setProducts] = useState<
    BazarProduct[]
  >([]);

  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchTickerData() {
      try {
        const result = await loadBazarProducts();

        if (active) {
          setProducts(result.products);
          setError(false);
        }
      } catch (err) {
        console.error("Price ticker error:", err);

        if (active) {
          setError(true);
        }
      }
    }

    fetchTickerData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="flex h-[48px] w-full overflow-hidden border-y border-[#DDE9DF] bg-white">
        <div className="z-10 flex shrink-0 items-center bg-[#16803D] px-4 text-[13px] font-bold text-white md:px-6">
          আজকের বাজার দর
        </div>

        <div className="flex min-w-0 flex-1 items-center overflow-hidden">
          {products.length > 0 ? (
            <div className="bazar-marquee flex w-max items-center">
              <TickerItems products={products} />

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

      <style jsx global>{`
        @keyframes bazar-marquee-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .bazar-marquee {
          animation: bazar-marquee-scroll
            70s linear infinite;
          will-change: transform;
        }

        .bazar-marquee:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .bazar-marquee {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
