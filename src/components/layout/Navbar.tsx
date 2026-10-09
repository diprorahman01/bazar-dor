
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
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

const TWEMOJI_BASE =
  "https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.2/assets/svg";

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
// CATEGORY ICON
// ==========================================

function CategoryIcon({
  name,
  emoji,
}: {
  name: string;
  emoji: string;
}) {
  const [failedUrl, setFailedUrl] = useState<
    string | null
  >(null);

  const url = getTwemojiUrl(emoji);
  const failed = failedUrl === url;

  if (failed) {
    return (
      <span
        role="img"
        aria-label={name}
        className="inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center text-[15px] leading-none"
      >
        {emoji}
      </span>
    );
  }

  return (
    <Image
      src={url}
      alt={name}
      width={17}
      height={17}
      unoptimized
      className="h-[17px] w-[17px] shrink-0 object-contain"
      onError={() => setFailedUrl(url)}
    />
  );
}

// ==========================================
// PROFILE AVATAR
// ==========================================

function ProfileAvatar({
  name,
  image,
  size = 36,
}: {
  name: string;
  image?: string | null;
  size?: number;
}) {
  const [failedImage, setFailedImage] = useState<
    string | null
  >(null);

  const showImage =
    Boolean(image) && failedImage !== image;

  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F0F4F1]"
      style={{
        width: size,
        height: size,
      }}
    >
      {showImage && image ? (
        <Image
          src={image}
          alt={name}
          width={size}
          height={size}
          unoptimized
          className="h-full w-full object-cover"
          onError={() => setFailedImage(image)}
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

// ==========================================
// BANGLADESH DATE
// ==========================================

function getBangladeshDate(): string {
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date());
}

// ==========================================
// MAIN NAVBAR
// ==========================================

export default function Navbar() {
  const pathname = usePathname();

  const { data: session, isPending } =
    authClient.useSession();

  const user = session?.user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] =
    useState(false);
  const [signingOut, setSigningOut] =
    useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const fullName =
    user?.name?.trim() || "ব্যবহারকারী";

  const firstName = fullName.split(/\s+/)[0];
  const email = user?.email || "";
  const profileImage = user?.image || null;

  // Calculate date without setting state in an effect.
  // A fixed placeholder is used during server rendering
  // and the initial hydration render.
  const [banglaDate, setBanglaDate] = useState(
    "বাংলাদেশের বাজারদর"
  );

  useEffect(() => {
    // Update asynchronously after hydration.
    const frame = requestAnimationFrame(() => {
      setBanglaDate(getBangladeshDate());
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  // ==========================================
  // CLOSE MENUS ON NAVIGATION
  // ==========================================

  // Remember the route on which a menu was opened.
  // When the pathname changes, that menu becomes hidden
  // without calling setState inside an effect.

  const [menuRoute, setMenuRoute] = useState(
    pathname
  );

  const [profileRoute, setProfileRoute] =
    useState(pathname);

  const isMenuOpen =
    menuOpen && menuRoute === pathname;

  const isProfileOpen =
    profileOpen && profileRoute === pathname;

  function toggleMenu() {
    setMenuRoute(pathname);
    setMenuOpen(!isMenuOpen);
    setProfileOpen(false);
  }

  function toggleProfile() {
    setProfileRoute(pathname);
    setProfileOpen(!isProfileOpen);
    setMenuOpen(false);
  }

  function closeMenus() {
    setMenuOpen(false);
    setProfileOpen(false);
  }

  // ==========================================
  // OUTSIDE CLICK / ESCAPE KEY
  // ==========================================

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
        setMenuOpen(false);
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

  // ==========================================
  // SIGN OUT
  // ==========================================

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

      closeMenus();

      toast.success("সফলভাবে সাইন আউট হয়েছে");

      window.location.assign("/");
    } catch (error) {
      console.error("Sign out failed:", error);

      toast.error(
        "সাইন আউট করা যায়নি। আবার চেষ্টা করুন।"
      );

      setSigningOut(false);
    }
  }

  // ==========================================
  // NAVBAR
  // ==========================================

  return (
    <header className="relative z-50 w-full bg-white">
      {/* FIRST ROW: LOGO AND AUTHENTICATION */}

      <div className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* WEBSITE LOGO */}

          <Link
            href="/"
            onClick={closeMenus}
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
                {banglaDate}
              </p>
            </div>
          </Link>

          {/* AUTH / PROFILE */}

          <div className="flex items-center gap-3">
            {isPending ? (
              <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
            ) : user ? (
              <div
                ref={profileRef}
                className="relative"
              >
                <button
                  type="button"
                  onClick={toggleProfile}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                  aria-label="প্রোফাইল মেনু"
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
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* PROFILE DROPDOWN */}

                {isProfileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[256px] rounded-2xl border border-[#DEE7DF] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(0,0,0,0.16)]"
                  >
                    <div className="mb-4">
                      <p className="truncate text-[14px] font-semibold text-[#1C2B20]">
                        {fullName}
                      </p>

                      <p className="mt-0.5 truncate text-[12px] text-[#657269]">
                        {email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex items-center gap-2 py-1 text-[13px] text-[#26352A] transition hover:text-[#008b3d]"
                    >
                      <UserRound
                        size={16}
                        className="text-[#6385A2]"
                      />

                      <span>আমার প্রোফাইল</span>
                    </Link>

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
              onClick={toggleMenu}
              aria-label={
                isMenuOpen
                  ? "মেনু বন্ধ করুন"
                  : "মেনু খুলুন"
              }
              aria-expanded={isMenuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 md:hidden"
            >
              {isMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECOND ROW: CATEGORY NAVIGATION */}

      <nav
        aria-label="পণ্যের ক্যাটাগরি"
        className="hidden border-b border-gray-100 md:block"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-start gap-3 px-4 py-2 lg:gap-5">
          {categories.map((category) => {
            const active =
              pathname ===
              `/category/${category.slug}`;

            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                onClick={closeMenus}
                aria-current={
                  active ? "page" : undefined
                }
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

      {/* MOBILE NAVIGATION */}

      {isMenuOpen && (
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
                  onClick={closeMenus}
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

          {/* MOBILE AUTHENTICATION */}

          {!isPending && !user && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
              <Link
                href="/signin"
                onClick={closeMenus}
                className="rounded-md border border-[#008b3d] py-2.5 text-center text-sm font-medium text-[#008b3d]"
              >
                সাইন ইন
              </Link>

              <Link
                href="/signup"
                onClick={closeMenus}
                className="rounded-md bg-[#008b3d] py-2.5 text-center text-sm font-medium text-white"
              >
                সাইন আপ
              </Link>
            </div>
          )}

          {/* MOBILE PROFILE */}

          {!isPending && user && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <Link
                href="/profile"
                onClick={closeMenus}
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
