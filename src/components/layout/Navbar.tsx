
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const categories = [
  {
    name: "চাল",
    slug: "chal",
    image: "/images/rice.png",
    emoji: "🍚",
  },
  {
    name: "ডাল",
    slug: "dal",
    image: "/images/dal.png",
    emoji: "🫘",
  },
  {
    name: "তেল",
    slug: "tel",
    image: "/images/oil.png",
    emoji: "🛢️",
  },
  {
    name: "সবজি",
    slug: "sobji",
    image: "/images/vegetable.png",
    emoji: "🥬",
  },
  {
    name: "মাছ",
    slug: "mach",
    image: "/images/fish.png",
    emoji: "🐟",
  },
  {
    name: "মাংস",
    slug: "mangsho",
    image: "/images/meat.png",
    emoji: "🍗",
  },
  {
    name: "ডিম-দুধ",
    slug: "dim-dudh",
    image: "/images/milk.png",
    emoji: "🥛",
  },
  {
    name: "মসলা",
    slug: "moshla",
    image: "/images/spice.png",
    emoji: "🌶️",
  },
];

function CategoryIcon({
  image,
  name,
  emoji,
}: {
  image: string;
  name: string;
  emoji: string;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return <span className="text-sm">{emoji}</span>;
  }

  return (
    <Image
      src={image}
      alt={name}
      width={17}
      height={17}
      className="h-[17px] w-[17px] object-contain"
      onError={() => setError(true)}
    />
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [banglaDate, setBanglaDate] = useState("");

  useEffect(() => {
    const date = new Intl.DateTimeFormat("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    }).format(new Date());

    setBanglaDate(date);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="w-full bg-white">

      {/* First Row: Logo and Authentication */}
      <div className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

          {/* Website Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#008b3d] p-2">
              <Image
                src="/images/logo-icon.png"
                alt="BazarDor Logo"
                width={32}
                height={32}
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-[20px] font-bold leading-tight text-[#17251b]">
                বাজার দর
              </h1>

              <p className="mt-0.5 text-[11px] text-gray-500">
                {banglaDate || "বাংলাদেশের বাজারদর"}
              </p>
            </div>
          </Link>

          {/* Desktop Authentication Buttons */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/signin"
              className="text-[13px] font-medium text-gray-700 transition hover:text-green-700"
            >
              সাইন ইন
            </Link>

            <Link
              href="/signup"
              className="rounded-md bg-[#008b3d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#006d30]"
            >
              সাইন আপ
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={
              menuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"
            }
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </div>

      {/* Second Row: Category Navigation */}
      <nav className="hidden border-b border-gray-100 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-start gap-3 px-4 py-2 lg:gap-5">

          {categories.map((category) => {
            const active =
              pathname === `/category/${category.slug}`;

            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium transition ${
                  active
                    ? "bg-[#008b3d] text-white"
                    : "text-[#27352c] hover:bg-green-50 hover:text-[#008b3d]"
                }`}
              >
                <CategoryIcon
                  image={category.image}
                  name={category.name}
                  emoji={category.emoji}
                />

                <span>{category.name}</span>
              </Link>
            );
          })}

        </div>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">

          <p className="mb-3 text-sm font-semibold text-gray-500">
            পণ্যের ক্যাটাগরি
          </p>

          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => {
              const active =
                pathname === `/category/${category.slug}`;

              return (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium ${
                    active
                      ? "bg-[#008b3d] text-white"
                      : "bg-[#f0f5f1] text-gray-700 hover:bg-green-50"
                  }`}
                >
                  <CategoryIcon
                    image={category.image}
                    name={category.name}
                    emoji={category.emoji}
                  />

                  <span>{category.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Authentication */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">

            <Link
              href="/signin"
              onClick={() => setMenuOpen(false)}
              className="rounded-md border border-[#008b3d] py-2.5 text-center text-sm font-medium text-[#008b3d]"
            >
              সাইন ইন
            </Link>

            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="rounded-md bg-[#008b3d] py-2.5 text-center text-sm font-medium text-white"
            >
              সাইন আপ
            </Link>

          </div>
        </div>
      )}
    </header>
  );
}

