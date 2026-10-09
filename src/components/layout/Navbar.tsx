
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

// ============================================
// TWEMOJI CONFIGURATION
// ============================================

const TWEMOJI_BASE =
  "https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.2/assets/svg";

// ============================================
// CATEGORY DATA
// ============================================

const categories = [
  { name: "চাল", slug: "chal", emoji: "🍚" },
  { name: "ডাল", slug: "dal", emoji: "🫘" },
  { name: "তেল", slug: "tel", emoji: "🫙" },
  { name: "সবজি", slug: "sobji", emoji: "🥬" },
  { name: "মাছ", slug: "mach", emoji: "🐟" },
  { name: "মাংস", slug: "mangsho", emoji: "🍗" },
  { name: "ডিম-দুধ", slug: "dim-dudh", emoji: "🥛" },
  { name: "মসলা", slug: "moshla", emoji: "🌶️" },
];

// ============================================
// CONVERT EMOJI TO TWEMOJI SVG URL
// ============================================

function getTwemojiUrl(emoji: string): string {
  const code = Array.from(emoji)
    .map((character) =>
      character.codePointAt(0)!.toString(16)
    )
    .filter((value) => value !== "fe0f")
    .join("-");

  return `${TWEMOJI_BASE}/${code}.svg`;
}

// ============================================
// CATEGORY ICON
// ============================================

function CategoryIcon({
  name,
  emoji,
}: {
  name: string;
  emoji: string;
}) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [emoji]);

  if (error) {
    return (
      <span
        role="img"
        aria-label={name}
        className="inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center bg-transparent text-[15px] leading-none"
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={getTwemojiUrl(emoji)}
      alt={name}
      width={17}
      height={17}
      className="h-[17px] w-[17px] shrink-0 bg-transparent object-contain"
      onError={() => setError(true)}
    />
  );
}

// ============================================
// PROFILE AVATAR
// ============================================

function ProfileAvatar({
  name,
  image,
  size = 36,
}: {
  name: string;
  image?: string | null;
  size?: number;
}) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F0F4F1]"
      style={{
        width: size,
        height: size,
      }}
    >
      {image && !imageError ? (
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <UserRound
          size={Math.round(size * 0.55)}
          className="text-[#64786A]"
        />
      )}
    </div>
  );
}

// ============================================
// MAIN NAVBAR
// ============================================

export default function Navbar() {
  const pathname = usePathname();

  const { data: session, isPending } =
    authClient.useSession();

  const user = session?.user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [banglaDate, setBanglaDate] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const fullName =
    user?.name?.trim() || "ব্যবহারকারী";

  const firstName =
    fullName.split(/\s+/)[0];

  const email = user?.email || "";
  const profileImage = user?.image || null;

  // ============================================
  // BANGLADESH DATE
  // ============================================

  useEffect(() => {
    const date = new Intl.DateTimeFormat("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    }).format(new Date());

    setBanglaDate(date);
  }, []);

  // ============================================
  // CLOSE MENUS WHEN ROUTE CHANGES
  // ============================================

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // ============================================
  // CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK
  // ============================================

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // ============================================
  // SIGN OUT
  // ============================================

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(
          result.error.message || "Sign out failed"
        );
      }

      setProfileOpen(false);
      setMenuOpen(false);

      window.location.assign("/");
    } catch (error) {
      console.error("Sign out failed:", error);

      alert(
        "সাইন আউট করা যায়নি। আবার চেষ্টা করুন।"
      );

      setSigningOut(false);
    }
  }

  return (
    <header className="relative z-50 w-full bg-white">
      {/* =====================================
          FIRST ROW: LOGO AND AUTHENTICATION
      ===================================== */}

      <div className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* WEBSITE LOGO */}

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

          {/* =====================================
              RIGHT SIDE: AUTH / PROFILE
          ===================================== */}

          <div className="flex items-center gap-3">
            {isPending ? (
              <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
            ) : user ? (
              /* =====================================
                  LOGGED-IN PROFILE
              ===================================== */

              <div
                ref={profileRef}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen(!profileOpen)
                  }
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition hover:bg-[#F3F7F4]"
                >
                  <ProfileAvatar
                    name={fullName}
                    image={profileImage}
                    size={36}
                  />

                  <span className="hidden max-w-[140px] truncate text-[13px] font-medium text-[#1C2B20] sm:block">
                    {firstName}
                  </span>

                  <ChevronDown
                    size={13}
                    className={`text-gray-500 transition-transform ${
                      profileOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {/* =====================================
                    PROFILE DROPDOWN
                ===================================== */}

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[256px] rounded-2xl border border-[#DEE7DF] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(0,0,0,0.16)]"
                  >
                    {/* USER DETAILS */}

                    <div className="mb-4">
                      <p className="truncate text-[14px] font-semibold text-[#1C2B20]">
                        {fullName}
                      </p>

                      <p className="mt-0.5 truncate text-[12px] text-[#657269]">
                        {email}
                      </p>
                    </div>

                    {/* MY PROFILE */}

                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex items-center gap-2 py-1 text-[13px] text-[#26352A] transition hover:text-[#008b3d]"
                    >
                      <UserRound
                        size={16}
                        className="text-[#6385A2]"
                      />

                      <span>আমার প্রোফাইল</span>
                    </Link>

                    {/* SIGN OUT */}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="mt-3 flex items-center gap-2 py-1 text-[13px] text-[#F04444] transition hover:text-red-700 disabled:opacity-50"
                    >
                      <LogOut size={16} />

                      <span>
                        {signingOut
                          ? "সাইন আউট হচ্ছে..."
                          : "সাইন আউট"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* =====================================
                  LOGGED-OUT BUTTONS
              ===================================== */

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
            )}

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
              aria-label={
                menuOpen
                  ? "মেনু বন্ধ করুন"
                  : "মেনু খুলুন"
              }
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 md:hidden"
            >
              {menuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================
          SECOND ROW: CATEGORY NAVIGATION
      ===================================== */}

      <nav className="hidden border-b border-gray-100 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-start gap-3 px-4 py-2 lg:gap-5">
          {categories.map((category) => {
            const active =
              pathname ===
              `/category/${category.slug}`;

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
                  name={category.name}
                  emoji={category.emoji}
                />

                <span>{category.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* =====================================
          MOBILE NAVIGATION
      ===================================== */}

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <p className="mb-3 text-sm font-semibold text-gray-500">
            পণ্যের ক্যাটাগরি
          </p>

          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => {
              const active =
                pathname ===
                `/category/${category.slug}`;

              return (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className={`flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium ${
                    active
                      ? "bg-[#008b3d] text-white"
                      : "bg-[#f0f5f1] text-gray-700 hover:bg-green-50"
                  }`}
                >
                  <CategoryIcon
                    name={category.name}
                    emoji={category.emoji}
                  />

                  <span>{category.name}</span>
                </Link>
              );
            })}
          </div>

          {/* =====================================
              MOBILE AUTHENTICATION
          ===================================== */}

          {!isPending && !user && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
              <Link
                href="/signin"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="rounded-md border border-[#008b3d] py-2.5 text-center text-sm font-medium text-[#008b3d]"
              >
                সাইন ইন
              </Link>

              <Link
                href="/signup"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="rounded-md bg-[#008b3d] py-2.5 text-center text-sm font-medium text-white"
              >
                সাইন আপ
              </Link>
            </div>
          )}

          {/* MOBILE PROFILE LINK */}

          {!isPending && user && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <Link
                href="/profile"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="flex items-center gap-2 rounded-md bg-[#F0F5F1] px-3 py-3 text-sm font-medium text-[#25372B]"
              >
                <UserRound size={17} />
                আমার প্রোফাইল
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-sm font-medium text-red-500 disabled:opacity-50"
              >
                <LogOut size={17} />
                {signingOut
                  ? "সাইন আউট হচ্ছে..."
                  : "সাইন আউট"}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
