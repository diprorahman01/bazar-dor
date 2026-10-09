
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LogOut,
  UserRound,
  Pencil,
  Mail,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();

  const {
    data: session,
    isPending,
    error: sessionError,
  } = authClient.useSession();

  const user = session?.user;

  const [signingOut, setSigningOut] = useState(false);

  // Redirect unauthenticated users to sign in
  useEffect(() => {
    if (!isPending && !sessionError && !user) {
      toast.error("প্রোফাইল দেখতে আগে সাইন ইন করুন");

      router.replace("/signin?redirect=/profile");
    }
  }, [isPending, sessionError, user, router]);

  // ==========================================
  // SIGN OUT
  // ==========================================

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        toast.error(
          result.error.message || "সাইন আউট করা যায়নি"
        );
        return;
      }

      toast.success("সফলভাবে সাইন আউট হয়েছে");

      router.replace("/signin");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);

      toast.error(
        "সাইন আউট করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setSigningOut(false);
    }
  }

  // ==========================================
  // LOADING SKELETON
  // ==========================================

  if (isPending) {
    return (
      <main className="min-h-[65vh] bg-[#F1F6F2] px-4 py-20">
        <div className="mx-auto max-w-[630px] animate-pulse">
          <div className="mb-6 h-8 w-48 rounded bg-gray-200" />

          <div className="mb-5 h-28 rounded-2xl bg-white" />

          <div className="h-64 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  // ==========================================
  // SESSION ERROR
  // ==========================================

  if (sessionError) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#F1F6F2] px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-red-600">
            সেশনের তথ্য লোড করা যায়নি।
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-[#008C3C] px-5 py-2 text-white"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </main>
    );
  }

  // Wait while redirecting to sign in
  if (!user) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#F1F6F2] px-4">
        <div className="text-center">
          <UserRound
            size={36}
            className="mx-auto mb-3 text-[#008C3C]"
          />

          <p className="text-sm text-[#788679]">
            সাইন ইন পেজে নিয়ে যাওয়া হচ্ছে...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // USER INFORMATION
  // ==========================================

  const displayName = user.name || "ব্যবহারকারী";
  const displayEmail = user.email || "";
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-[70vh] bg-[#F1F6F2] px-4 py-12">
      <div className="mx-auto max-w-[630px]">
        {/* PAGE HEADER */}

        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-[#15251B]">
            আমার প্রোফাইল
          </h1>

          <p className="mt-1 text-sm text-[#788679]">
            আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।
          </p>
        </div>

        {/* USER INFORMATION CARD */}

        <div className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-[#DEE7E0] bg-white p-5">
          {user.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="h-[68px] w-[68px] rounded-xl object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-[68px] w-[68px] items-center justify-center rounded-xl bg-[#EFF3F0] text-[27px] font-bold text-[#008C3C]">
              {firstLetter}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="break-words text-lg font-bold text-[#15251B]">
              {displayName}
            </h2>

            <p className="mt-1 break-all text-sm text-[#788679]">
              {displayEmail}
            </p>
          </div>

          {/* SIGN OUT BUTTON */}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-red-400 px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={16} />

            {signingOut
              ? "অপেক্ষা করুন..."
              : "সাইন আউট"}
          </button>
        </div>

        {/* PROFILE DETAILS CARD */}

        <div className="rounded-2xl border border-[#DEE7E0] bg-white p-6 sm:p-9">
          <h3 className="mb-7 text-lg font-bold text-[#15251B]">
            ব্যক্তিগত তথ্য
          </h3>

          {/* NAME */}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-[#15251B]">
              নাম
            </label>

            <div className="flex min-h-[48px] items-center rounded-lg border border-[#DEE7E0] bg-[#FAFCFA] px-4 py-3">
              <UserRound
                size={18}
                className="mr-3 shrink-0 text-[#788679]"
              />

              <p className="break-words text-sm text-[#15251B]">
                {displayName}
              </p>
            </div>
          </div>

          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#15251B]">
              ইমেইল
            </label>

            <div className="flex min-h-[48px] items-center rounded-lg border border-[#DEE7E0] bg-[#FAFCFA] px-4 py-3">
              <Mail
                size={18}
                className="mr-3 shrink-0 text-[#788679]"
              />

              <p className="break-all text-sm text-[#15251B]">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* UPDATE INFORMATION BUTTON */}

          <Link
            href="/profile/edit"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#008C3C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007431] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008C3C]"
          >
            <Pencil size={17} />

            Update Information

            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}
