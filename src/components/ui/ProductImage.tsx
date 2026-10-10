
"use client";

import { useState } from "react";
import Image from "next/image";

// ==========================================
// TYPES
// ==========================================

type ProductImageProps = {
  name: string;
  icon?: string;
  category?: string;
  size?: number;
  transparent?: boolean;
};

// ==========================================
// TWEMOJI CONFIGURATION
// ==========================================

const TWEMOJI_BASE =
  "https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.2/assets/svg";

// ==========================================
// TEXT NORMALIZATION
// ==========================================

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFC")
    .replace(/য়/g, "য়")
    .replace(/ড়/g, "ড়")
    .replace(/ঢ়/g, "ঢ়")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function matches(
  name: string,
  keywords: string[]
): boolean {
  return keywords.some((keyword) =>
    name.includes(normalizeText(keyword))
  );
}

// ==========================================
// CATEGORY NORMALIZATION
// ==========================================

function normalizeCategory(
  category: string
): string {
  const value = normalizeText(category);

  const aliases: Record<string, string> = {
    chal: "chal",
    rice: "chal",
    "চাল": "chal",

    dal: "dal",
    daal: "dal",
    lentil: "dal",
    pulses: "dal",
    "ডাল": "dal",

    tel: "tel",
    oil: "tel",
    "edible oil": "tel",
    "তেল": "tel",

    sobji: "sobji",
    vegetable: "sobji",
    vegetables: "sobji",
    "সবজি": "sobji",

    mach: "mach",
    fish: "mach",
    seafood: "mach",
    "মাছ": "mach",

    mangsho: "mangsho",
    mangso: "mangsho",
    meat: "mangsho",
    "মাংস": "mangsho",

    "dim dudh": "dim-dudh",
    "egg milk": "dim-dudh",
    eggs: "dim-dudh",
    dairy: "dim-dudh",
    milk: "dim-dudh",
    "ডিম দুধ": "dim-dudh",
    "ডিম ও দুধ": "dim-dudh",

    moshla: "moshla",
    mosla: "moshla",
    masala: "moshla",
    spices: "moshla",
    spice: "moshla",
    "মসলা": "moshla",
    "মশলা": "moshla",
  };

  return aliases[value] || value;
}

// ==========================================
// PRODUCT NAME EMOJI MATCHING
// ==========================================

function getSpecificEmoji(
  name: string
): string | null {
  const n = normalizeText(name);

  // RICE
  // Check rice before fish to prevent
  // accidental matches in Bengali names.

  if (
    matches(n, [
      "চাল",
      "মিনিকেট",
      "নাজিরশাইল",
      "বাসমতি",
      "স্বর্ণমুচি",
      "স্বর্ণামুচি",
      "স্বর্ণমুছি",
      "আতপ",
      "পোলাও",
      "rice",
    ])
  ) {
    return "🍚";
  }

  // SHRIMP
  if (
    matches(n, [
      "চিংড়ি",
      "চিংড়ি",
      "চিংরি",
      "চিংড়ী",
      "shrimp",
      "prawn",
    ])
  ) {
    return "🦐";
  }

  // FISH
  // Avoid short ambiguous keywords such as
  // "কৈ" that can match unrelated names.

  if (
    matches(n, [
      "তেলাপিয়া",
      "তেলাপিয়া",
      "tilapia",
      "telapia",
      "রুই মাছ",
      "রুই",
      "কাতলা",
      "ইলিশ",
      "পাঙ্গাস",
      "পাঙাশ",
      "কৈ মাছ",
      "শিং মাছ",
      "মাগুর",
      "বোয়াল",
      "বোয়াল",
      "fish",
      "মাছ",
    ])
  ) {
    return "🐟";
  }

  // LENTILS
  if (
    matches(n, [
      "ডাল",
      "ছোলা",
      "মসুর",
      "মুগ",
      "মাষকলাই",
      "lentil",
      "pulses",
    ])
  ) {
    return "🫘";
  }

  // VEGETABLES
  if (
    matches(n, [
      "পেঁয়াজ",
      "পেঁয়াজ",
      "পেয়াজ",
      "onion",
    ])
  ) {
    return "🧅";
  }

  if (matches(n, ["রসুন", "garlic"])) {
    return "🧄";
  }

  if (matches(n, ["আলু", "potato"])) {
    return "🥔";
  }

  if (
    matches(n, [
      "বেগুন",
      "eggplant",
      "brinjal",
    ])
  ) {
    return "🍆";
  }

  if (
    matches(n, [
      "টমেটো",
      "tomato",
    ])
  ) {
    return "🍅";
  }

  if (
    matches(n, [
      "শসা",
      "cucumber",
    ])
  ) {
    return "🥒";
  }

  if (
    matches(n, [
      "গাজর",
      "carrot",
    ])
  ) {
    return "🥕";
  }

  if (
    matches(n, [
      "মরিচ",
      "chili",
      "chilli",
    ])
  ) {
    return "🌶️";
  }

  if (
    matches(n, [
      "আদা",
      "ginger",
    ])
  ) {
    return "🫚";
  }

  if (
    matches(n, [
      "ধনেপাতা",
      "ধনে পাতা",
      "coriander leaves",
    ])
  ) {
    return "🌿";
  }

  if (
    matches(n, [
      "ঢেঁড়স",
      "ঢেঁড়স",
      "শাক",
      "বাঁধাকপি",
      "ফুলকপি",
      "লাউ",
      "করলা",
      "cabbage",
      "cauliflower",
    ])
  ) {
    return "🥬";
  }

  // OIL
  if (
    matches(n, [
      "তেল",
      "সয়াবিন",
      "সয়াবিন",
      "সরিষার তেল",
      "পাম অয়েল",
      "sunflower oil",
      "cooking oil",
    ])
  ) {
    return "🫙";
  }

  // MEAT
  if (
    matches(n, [
      "মুরগি",
      "মুরগী",
      "চিকেন",
      "chicken",
    ])
  ) {
    return "🍗";
  }

  if (
    matches(n, [
      "গরুর",
      "খাসির",
      "beef",
      "mutton",
    ])
  ) {
    return "🥩";
  }

  if (
    matches(n, [
      "হাঁস",
      "হাসের",
      "duck",
    ])
  ) {
    return "🦆";
  }

  // EGGS AND DAIRY
  if (matches(n, ["ডিম", "egg"])) {
    return "🥚";
  }

  if (matches(n, ["দুধ", "milk"])) {
    return "🥛";
  }

  if (
    matches(n, [
      "দই",
      "yogurt",
      "yoghurt",
    ])
  ) {
    return "🥛";
  }

  if (
    matches(n, [
      "মাখন",
      "butter",
    ])
  ) {
    return "🧈";
  }

  if (
    matches(n, [
      "পনির",
      "চিজ",
      "cheese",
    ])
  ) {
    return "🧀";
  }

  // SPICES AND GROCERIES
  if (
    matches(n, [
      "লবণ",
      "salt",
    ])
  ) {
    return "🧂";
  }

  if (
    matches(n, [
      "চিনি",
      "sugar",
    ])
  ) {
    return "🍬";
  }

  if (
    matches(n, [
      "আটা",
      "ময়দা",
      "ময়দা",
      "flour",
    ])
  ) {
    return "🌾";
  }

  if (
    matches(n, [
      "হলুদ",
      "turmeric",
    ])
  ) {
    return "🟡";
  }

  if (
    matches(n, [
      "মসলা",
      "মশলা",
      "জিরা",
      "দারুচিনি",
      "এলাচ",
      "লবঙ্গ",
      "গোলমরিচ",
      "masala",
      "spice",
    ])
  ) {
    return "🫙";
  }

  return null;
}

// ==========================================
// CATEGORY FALLBACK EMOJI
// ==========================================

function getCategoryEmoji(
  category: string
): string | null {
  const key = normalizeCategory(category);

  const emojis: Record<string, string> = {
    chal: "🍚",
    dal: "🫘",
    tel: "🫙",
    sobji: "🥬",
    mach: "🐟",
    mangsho: "🍗",
    "dim-dudh": "🥛",
    moshla: "🌶️",
  };

  return emojis[key] || null;
}

// ==========================================
// VALIDATE API EMOJI
// ==========================================

function isSingleEmoji(
  value: string
): boolean {
  if (!value.trim()) return false;

  // Reject URLs and file paths.
  if (
    value.includes("http://") ||
    value.includes("https://") ||
    value.includes("/") ||
    value.includes(".png") ||
    value.includes(".svg")
  ) {
    return false;
  }

  // Only accept emoji-like Unicode characters.
  return /\p{Extended_Pictographic}/u.test(
    value
  );
}

// ==========================================
// FINAL EMOJI SELECTION
// ==========================================

function getProductEmoji(
  name: string,
  icon: string,
  category: string
): string {
  // 1. Prefer exact product-name matching.
  const specific = getSpecificEmoji(name);

  if (specific) {
    return specific;
  }

  // 2. Use the known category.
  const categoryEmoji =
    getCategoryEmoji(category);

  if (categoryEmoji) {
    return categoryEmoji;
  }

  // 3. Use the API icon if valid.
  if (isSingleEmoji(icon)) {
    return icon;
  }

  // 4. Safe final fallback.
  return "🛒";
}

// ==========================================
// EMOJI TO TWEMOJI URL
// ==========================================

function getTwemojiUrl(
  emoji: string
): string {
  const code = Array.from(emoji)
    .map((character) =>
      character.codePointAt(0)!
        .toString(16)
    )
    .filter(
      (code) =>
        code !== "fe0f" &&
        code !== "fe0e"
    )
    .join("-");

  return `${TWEMOJI_BASE}/${code}.svg`;
}

// ==========================================
// PRODUCT IMAGE COMPONENT
// ==========================================

export default function ProductImage({
  name,
  icon = "",
  category = "",
  size = 28,
  transparent = false,
}: ProductImageProps) {
  const emoji = getProductEmoji(
    name,
    icon,
    category
  );

  const imageUrl = getTwemojiUrl(emoji);

  const [failedUrl, setFailedUrl] =
    useState<string | null>(null);

  const imageFailed =
    failedUrl === imageUrl;

  return (
    <div
      className={
        "flex shrink-0 items-center justify-center overflow-hidden " +
        (transparent
          ? "bg-transparent"
          : "rounded-xl bg-[#F0F5F1]")
      }
      style={{
        width: transparent
          ? size
          : size + 16,
        height: transparent
          ? size
          : size + 16,
      }}
    >
      {imageFailed ? (
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
      ) : (
        <Image
          src={imageUrl}
          alt={name}
          width={size}
          height={size}
          unoptimized
          className="block shrink-0 object-contain"
          style={{
            width: size,
            height: size,
          }}
          onError={() =>
            setFailedUrl(imageUrl)
          }
        />
      )}
    </div>
  );
}
