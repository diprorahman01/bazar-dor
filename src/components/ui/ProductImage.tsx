
"use client";

import { useEffect, useState } from "react";

type ProductImageProps = {
  name: string;
  icon?: string;
  size?: number;
  transparent?: boolean;
};

const TWEMOJI_BASE =
  "https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.2/assets/svg";

// ============================================
// MATCH PRODUCT ICONS TO FIGMA DESIGN
// ============================================

function getProductEmoji(
  name: string,
  fallback: string
): string {
  const n = name
    .trim()
    .normalize("NFC")
    .replace(/য়/g, "য়")
    .replace(/ঁ/g, "ঁ");

  // RICE
  if (
    n.includes("চাল") ||
    n.includes("মিনিকেট") ||
    n.includes("নাজিরশাইল") ||
    n.includes("বাসমতি")
  ) {
    return "🍚";
  }

  // LENTILS
  if (
    n.includes("ডাল") ||
    n.includes("ছোলা")
  ) {
    return "🫘";
  }

  // COOKING OIL
  if (n.includes("তেল")) {
    return "🫙";
  }

  // VEGETABLES
  if (
    n.includes("পেঁয়াজ") ||
    n.includes("পেয়াজ")
  ) {
    return "🧅";
  }

  if (n.includes("রসুন")) return "🧄";
  if (n.includes("আলু")) return "🥔";
  if (n.includes("বেগুন")) return "🍆";
  if (n.includes("মরিচ")) return "🌶️";
  if (n.includes("আদা")) return "🫚";
  if (n.includes("টমেটো")) return "🍅";
  if (n.includes("ধনেপাতা")) return "🌿";
  if (n.includes("ঢেঁড়স")) return "🥬";

  // FISH
  if (
    n.includes("চিংড়ি") ||
    n.includes("চিংরি")
  ) {
    return "🦐";
  }

  if (
    n.includes("রুই") ||
    n.includes("কাতলা") ||
    n.includes("তেলাপিয়া") ||
    n.includes("পাঙ্গাস") ||
    n.includes("ইলিশ") ||
    n.includes("মাছ")
  ) {
    return "🐟";
  }

  // MEAT
  if (
    n.includes("মুরগি") ||
    n.includes("চিকেন")
  ) {
    return "🍗";
  }

  if (
    n.includes("গরুর") ||
    n.includes("খাসির")
  ) {
    return "🥩";
  }

  if (
    n.includes("হাঁস") ||
    n.includes("হাসের")
  ) {
    return "🦆";
  }

  // EGGS AND DAIRY
  if (n.includes("ডিম")) return "🥚";
  if (n.includes("দুধ")) return "🥛";
  if (n.includes("দই")) return "🥛";
  if (n.includes("মাখন")) return "🧈";

  // OTHER GROCERIES
  if (n.includes("লবণ")) return "🧂";
  if (n.includes("চিনি")) return "🍬";
  if (n.includes("আটা")) return "🌾";
  if (n.includes("ময়দা")) return "🌾";
  if (n.includes("হলুদ")) return "🟡";
  if (n.includes("মসলা")) return "🫙";

  return fallback;
}

// ============================================
// EMOJI TO TWEMOJI SVG URL
// ============================================

function getTwemojiUrl(emoji: string): string {
  const code = Array.from(emoji)
    .map((character) =>
      character.codePointAt(0)!.toString(16)
    )
    .filter((code) => code !== "fe0f")
    .join("-");

  return `${TWEMOJI_BASE}/${code}.svg`;
}

// ============================================
// PRODUCT IMAGE COMPONENT
// ============================================

export default function ProductImage({
  name,
  icon = "",
  size = 28,
  transparent = false,
}: ProductImageProps) {
  const emoji = getProductEmoji(name, icon);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [emoji]);

  return (
    <div
      className={
        "flex shrink-0 items-center justify-center overflow-hidden " +
        (transparent
          ? "bg-transparent"
          : "rounded-xl bg-[#F0F5F1]")
      }
      style={{
        width: transparent ? size : size + 16,
        height: transparent ? size : size + 16,
      }}
    >
      {emoji && !failed ? (
        <img
          src={getTwemojiUrl(emoji)}
          alt={name}
          width={size}
          height={size}
          className="block shrink-0 object-contain"
          style={{
            width: size,
            height: size,
          }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          role="img"
          aria-label={name}
          className="leading-none"
          style={{
            fontSize: size,
          }}
        >
          {emoji}
        </span>
      )}
    </div>
  );
}
