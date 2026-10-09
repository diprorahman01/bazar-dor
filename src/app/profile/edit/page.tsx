
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const router = useRouter();

  // ==========================================
  // BETTER AUTH SESSION
  // ==========================================

  const {
    data: session,
    isPending,
    error: sessionError,
  } = authClient.useSession();

  const user = session?.user;

  // ==========================================
  // COMPONENT STATES
  // ==========================================

  // null means the user has not edited the input.
  // The current name comes directly from the session.
  const [editedName, setEditedName] = useState<
    string | null
  >(null);

  const [saving, setSaving] = useState(false);

  const name = editedName ?? user?.name ?? "";

  // ==========================================
  // AUTHENTICATION CHECK
  // ==========================================

  useEffect(() => {
    if (isPending || sessionError || user) {
      return;
    }

    router.replace("/signin?redirect=/profile/edit");
  }, [isPending, sessionError, user, router]);

  // ==========================================
  // UPDATE USER INFORMATION
  // ==========================================

  async function handleUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving || !user) {
      return;
    }

    const updatedName = name.trim();

    // Validate empty name
    if (!updatedName) {
      toast.error("আপনার নাম লিখুন");
      return;
    }

    // Validate minimum length
    if (updatedName.length < 2) {
      toast.error("নাম কমপক্ষে ২ অক্ষরের হতে হবে");
      return;
    }

    // Validate maximum length
    if (updatedName.length > 100) {
      toast.error("নাম ১০০ অক্ষরের বেশি হতে পারবে না");
      return;
    }

    // Check whether name has changed
    if (updatedName === user.name) {
      toast("নাম পরিবর্তন করা হয়নি");
      return;
    }

    setSaving(true);

    try {
      // Update name using Better Auth
      const result = await authClient.updateUser({
        name: updatedName,
      });

      if (result.error) {
        toast.error(
          result.error.message ||
            "তথ্য আপডেট করা যায়নি"
        );
        return;
      }

      // Show success notification
      toast.success(
        "আপনার তথ্য সফলভাবে আপডেট হয়েছে!"
      );

      // Navigate back to profile
      router.replace("/profile");
      router.refresh();
    } catch (error) {
      console.error(
        "Profile update failed:",
        error
      );

      toast.error(
        "তথ্য আপডেট করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // LOADING SKELETON
  // ==========================================

  if (isPending) {
    return (
      <main className="min-h-[65vh] bg-[#F1F6F2] px-4 py-16">
        <div className="mx-auto max-w-[630px] animate-pulse">
          <div className="mb-6 h-8 w-48 rounded bg-gray-200" />

          <div className="rounded-2xl border border-[#DEE7E0] bg-white p-8">
            <div className="mb-6 h-6 w-40 rounded bg-gray-200" />

            <div className="mb-3 h-4 w-16 rounded bg-gray-200" />

            <div className="mb-6 h-12 rounded bg-gray-100" />

            <div className="h-12 rounded bg-gray-200" />
          </div>
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
        <div className="w-full max-w-md rounded-2xl border border-[#DEE7E0] bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#15251B]">
            একটি সমস্যা হয়েছে
          </h1>

          <p className="mt-3 text-sm text-red-600">
            সেশনের তথ্য লোড করা যায়নি।
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-[#008C3C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#007431]"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </main>
    );
  }

  // ==========================================
  // UNAUTHENTICATED USER
  // ==========================================

  if (!user) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#F1F6F2] px-4">
        <p className="text-sm text-[#788679]">
          সাইন ইন পেজে নিয়ে যাওয়া হচ্ছে...
        </p>
      </main>
    );
  }

  // ==========================================
  // EDIT PROFILE FORM
  // ==========================================

  return (
    <main className="min-h-[70vh] bg-[#F1F6F2] px-4 py-12">
      <div className="mx-auto max-w-[630px]">
        {/* BACK BUTTON */}

        <Link
          href="/profile"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#008C3C] transition hover:text-[#007431]"
        >
          <ArrowLeft size={18} />

          প্রোফাইলে ফিরে যান
        </Link>

        {/* PAGE HEADER */}

        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-[#15251B]">
            তথ্য আপডেট করুন
          </h1>

          <p className="mt-1 text-sm text-[#788679]">
            আপনার নাম পরিবর্তন করতে নিচের ফর্মটি পূরণ করুন।
          </p>
        </div>

        {/* FORM CARD */}

        <div className="rounded-2xl border border-[#DEE7E0] bg-white p-6 shadow-sm sm:p-9">
          <h2 className="mb-7 text-lg font-bold text-[#15251B]">
            ব্যক্তিগত তথ্য পরিবর্তন
          </h2>

          <form onSubmit={handleUpdate}>
            {/* NAME FIELD */}

            <div>
              <label
                htmlFor="edit-profile-name"
                className="mb-2 block text-sm font-semibold text-[#15251B]"
              >
                নাম
              </label>

              <input
                id="edit-profile-name"
                name="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setEditedName(event.target.value)
                }
                placeholder="আপনার নাম লিখুন"
                minLength={2}
                maxLength={100}
                required
                disabled={saving}
                autoComplete="name"
                className="w-full rounded-lg border border-[#DEE7E0] bg-white px-4 py-3 text-sm text-[#15251B] outline-none transition focus:border-[#008C3C] focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* BUTTONS */}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#008C3C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007431] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />

                {saving
                  ? "আপডেট হচ্ছে..."
                  : "Update Information"}
              </button>

              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-lg border border-[#DEE7E0] px-6 py-3 text-sm font-semibold text-[#15251B] transition hover:bg-gray-50"
              >
                বাতিল করুন
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
