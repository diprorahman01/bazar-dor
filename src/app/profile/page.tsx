
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();

  const {
    data: session,
    isPending,
    error: sessionError,
  } = authClient.useSession();

  const user = session?.user;

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  async function handleUpdate(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const updatedName = name.trim();

    if (!updatedName) {
      toast.error("আপনার নাম লিখুন");
      return;
    }

    setSaving(true);

    try {
      const result = await authClient.updateUser({
        name: updatedName,
      });

      if (result.error) {
        toast.error(
          result.error.message ||
            "প্রোফাইল আপডেট করা যায়নি"
        );
        return;
      }

      toast.success("প্রোফাইল আপডেট হয়েছে");

      await authClient.getSession({
        query: {
          disableCookieCache: true,
        },
      });

      router.refresh();
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("প্রোফাইল আপডেট করা যায়নি");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        toast.error("সাইন আউট করা যায়নি");
        return;
      }

      window.location.assign("/signin");
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("সাইন আউট করা যায়নি");
    } finally {
      setSigningOut(false);
    }
  }

  if (isPending) {
    return (
      <main className="min-h-[65vh] bg-[#F1F6F2] px-4 py-20">
        <div className="mx-auto max-w-[630px] animate-pulse">
          <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
          <div className="mb-5 h-28 rounded-2xl bg-white" />
          <div className="h-52 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#F1F6F2] px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-red-600">
            সেশনের তথ্য লোড করা যায়নি।
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-[#008C3C] px-5 py-2 text-white"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#F1F6F2] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#DEE7E0] bg-white p-8 text-center">
          <UserRound
            size={40}
            className="mx-auto mb-4 text-[#008C3C]"
          />

          <h1 className="text-xl font-bold text-[#15251B]">
            আগে সাইন ইন করুন
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            প্রোফাইল দেখতে আপনার অ্যাকাউন্টে
            সাইন ইন করতে হবে।
          </p>

          <button
            onClick={() => router.push("/signin")}
            className="mt-6 rounded-lg bg-[#008C3C] px-6 py-2.5 font-semibold text-white hover:bg-[#007431]"
          >
            সাইন ইন করুন
          </button>
        </div>
      </main>
    );
  }

  const displayName = user.name || "ব্যবহারকারী";
  const displayEmail = user.email || "";
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-[70vh] bg-[#F1F6F2] px-4 py-12">
      <div className="mx-auto max-w-[630px]">
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

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-red-400 px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
          >
            <LogOut size={16} />
            {signingOut ? "অপেক্ষা করুন..." : "সাইন আউট"}
          </button>
        </div>

        {/* EDIT PROFILE CARD */}
        <div className="rounded-2xl border border-[#DEE7E0] bg-white p-6 sm:p-9">
          <h3 className="mb-7 text-lg font-bold text-[#15251B]">
            তথ্য
          </h3>

          <form onSubmit={handleUpdate}>
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-semibold text-[#15251B]"
            >
              নাম
            </label>

            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম লিখুন"
              required
              className="w-full rounded-lg border border-[#DEE7E0] bg-white px-4 py-3 text-sm text-[#15251B] outline-none transition focus:border-[#008C3C] focus:ring-2 focus:ring-green-100"
            />

            <label
              htmlFor="profile-email"
              className="mb-2 mt-5 block text-sm font-semibold text-[#15251B]"
            >
              ইমেইল
            </label>

            <input
              id="profile-email"
              type="email"
              value={displayEmail}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-[#DEE7E0] bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none"
            />

            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full rounded-lg bg-[#008C3C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007431] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "আপডেট হচ্ছে..." : "আপডেট"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
