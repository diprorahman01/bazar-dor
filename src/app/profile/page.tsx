
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut } from "lucide-react";

// ============================================
// DEMO USER DATA
// Replace with real authentication data later
// ============================================

const demoUser = {
  name: "Rezwan Ahmed",
  email: "rezwanahmed@gmail.com",
  image: "/images/profile-avatar.png",
};

// ============================================
// PROFILE PAGE
// ============================================

export default function ProfilePage() {
  const router = useRouter();

  const [userName, setUserName] = useState(demoUser.name);
  const [inputName, setInputName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!inputName.trim()) {
      setError("আপনার নাম লিখুন।");
      return;
    }

    setUserName(inputName.trim());
    setMessage(
      "নামটি এই পেজে আপডেট হয়েছে। স্থায়ীভাবে সংরক্ষণ করতে প্রোফাইল API সংযুক্ত করতে হবে।"
    );
    setInputName("");
  }

  // ==========================================
  // SIGN OUT
  // ==========================================

  function handleSignOut() {
    // Connect your authentication sign-out method here.
    router.push("/signin");
  }

  return (
    <main className="w-full flex-1 bg-[#F1F6F2] px-4 pb-20 pt-0">
      <div className="mx-auto w-full max-w-[736px]">

        {/* =====================================
            TOP PLACEHOLDER AREA
        ===================================== */}

        <div className="mx-auto mb-6 h-[100px] w-[100px] bg-[#D9D9D9]" />

        {/* =====================================
            PAGE HEADING
        ===================================== */}

        <div className="mb-7">
          <h1 className="text-[26px] font-bold leading-tight text-[#17251B]">
            আমার প্রোফাইল
          </h1>

          <p className="mt-1 text-[13px] text-[#758078]">
            আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।
          </p>
        </div>

        {/* =====================================
            USER INFORMATION CARD
        ===================================== */}

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#DFE8E1] bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex min-w-0 items-center gap-4">

            {/* User Avatar */}
            <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F0F2F0]">
              {!imageError ? (
                <Image
                  src={demoUser.image}
                  alt="Profile picture"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-[30px] font-bold text-[#008B3D]">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name and Email */}
            <div className="min-w-0">
              <h2 className="truncate text-[20px] font-bold text-[#17251B]">
                {userName}
              </h2>

              <p className="mt-1 truncate text-[15px] text-[#6B766E]">
                {demoUser.email}
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex h-[41px] items-center justify-center gap-2 self-start rounded-lg border border-red-500 bg-white px-4 text-[13px] font-semibold text-red-500 transition hover:bg-red-50 sm:self-auto"
          >
            <LogOut size={16} />
            সাইন আউট
          </button>
        </div>

        {/* =====================================
            PROFILE EDIT CARD
        ===================================== */}

        <div className="rounded-2xl border border-[#DFE8E1] bg-white px-5 py-6 sm:px-11 sm:py-7">

          <h2 className="mb-9 text-[18px] font-bold text-[#17251B]">
            তথ্য
          </h2>

          <form onSubmit={handleUpdate}>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block text-[13px] font-medium text-[#26352B]"
            >
              নাম
            </label>

            <input
              id="profile-name"
              type="text"
              value={inputName}
              onChange={(event) =>
                setInputName(event.target.value)
              }
              className="h-[41px] w-full rounded-lg border border-[#DFE8E1] bg-white px-3 text-[14px] text-[#17251B] outline-none transition focus:border-[#008B3D] focus:ring-2 focus:ring-green-100"
            />

            {/* Error */}
            {error && (
              <p
                role="alert"
                className="mt-3 text-[12px] text-red-600"
              >
                {error}
              </p>
            )}

            {/* Success */}
            {message && (
              <p
                role="status"
                className="mt-3 text-[12px] text-green-700"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              className="mt-4 flex h-[41px] w-full items-center justify-center rounded-lg bg-[#008B3D] text-[13px] font-bold text-white shadow-[0_3px_0_#C4D5C8] transition hover:bg-[#007532]"
            >
              আপডেট
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
