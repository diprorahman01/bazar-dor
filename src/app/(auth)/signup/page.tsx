
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 5.38 6.51 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.48-4.8 7.18l7.73 6C44.38 38.03 46.98 31.9 46.98 24.55z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297a12 12 0 0 0-3.793 23.386c.6.111.82-.261.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.762-1.604-2.665-.304-5.467-1.333-5.467-5.93 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.323 3.301 1.23a11.53 11.53 0 0 1 6.007 0c2.291-1.553 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.216.694.825.576A12.001 12.001 0 0 0 12 .297z" />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "google" | "github" | null
  >(null);

  const isBusy = loading || socialLoading !== null;

  function showError(message: string) {
    setError(message);
    toast.error(message);
  }

  // EMAIL / PASSWORD REGISTRATION
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusy) return;

    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      showError("আপনার নাম লিখুন।");
      return;
    }

    if (!cleanEmail) {
      showError("আপনার ইমেইল লিখুন।");
      return;
    }

    if (password.length < 8) {
      showError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    if (password !== confirmPassword) {
      showError("দুটি পাসওয়ার্ড মিলছে না।");
      return;
    }

    setLoading(true);

    try {
      const { error: signupError } = await authClient.signUp.email({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      if (signupError) {
        showError(
          signupError.message ||
            "অ্যাকাউন্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।"
        );
        return;
      }

      toast.success("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!");

      // The assignment requires redirecting to sign in.
      // Better Auth may create a session during signup,
      // so clear it before sending the user to sign in.
      const { error: signoutError } = await authClient.signOut();

      if (signoutError) {
        toast.error(
          "অ্যাকাউন্ট তৈরি হয়েছে, তবে সেশন বন্ধ করা যায়নি।"
        );
      }

      router.replace("/signin");
      router.refresh();
    } catch (err) {
      console.error("Signup error:", err);
      showError(
        "সার্ভারের সাথে সংযোগ করা যাচ্ছে না। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  }

  // GOOGLE / GITHUB SOCIAL AUTHENTICATION
  async function handleSocialLogin(
    provider: "google" | "github"
  ) {
    if (isBusy) return;

    setError("");
    setSocialLoading(provider);

    try {
      const { error: socialError } =
        await authClient.signIn.social({
          provider,
          callbackURL: "/",
          errorCallbackURL: "/signup",
        });

      if (socialError) {
        showError(
          socialError.message ||
            `${provider} দিয়ে সাইন ইন করা যায়নি।`
        );
        setSocialLoading(null);
      }

      // On success, Better Auth redirects to the provider.
    } catch (err) {
      console.error(`${provider} login error:`, err);
      showError(
        `${provider} দিয়ে সাইন ইন করতে সমস্যা হয়েছে।`
      );
      setSocialLoading(null);
    }
  }

  const inputClass =
    "h-[42px] w-full rounded-lg border border-[#DFE8E1] bg-white px-3 text-[13px] text-[#17251B] outline-none transition focus:border-[#008B3D] focus:ring-2 focus:ring-green-100 disabled:opacity-60";

  const labelClass =
    "mb-1.5 block text-[13px] font-semibold text-[#26352B]";

  return (
    <main className="flex min-h-[calc(100vh-190px)] w-full flex-col items-center bg-[#F1F6F2] px-4 pb-16 pt-9">
      {/* PAGE HEADING */}
      <div className="mb-7 text-center">
        <h1 className="text-[26px] font-bold leading-tight text-[#17251B]">
          অ্যাকাউন্ট তৈরি করুন
        </h1>

        <p className="mt-2 text-[13px] text-[#758078]">
          বিনা খরচে সাইন আপ করে সব বিস্তারিত দাম দেখুন।
        </p>
      </div>

      {/* SIGNUP CARD */}
      <div className="w-full max-w-[416px] rounded-2xl border border-[#DFE8E1] bg-white px-6 py-7 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="space-y-[18px]"
        >
          {/* NAME */}
          <div>
            <label
              htmlFor="signup-name"
              className={labelClass}
            >
              নাম
            </label>

            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: রহিম উদ্দিন"
              autoComplete="name"
              required
              disabled={isBusy}
              className={inputClass}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="signup-email"
              className={labelClass}
            >
              ইমেইল
            </label>

            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isBusy}
              className={inputClass}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="signup-password"
              className={labelClass}
            >
              পাসওয়ার্ড
            </label>

            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="কমপক্ষে ৮ অক্ষর"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={isBusy}
                className={`${inputClass} pr-11`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "পাসওয়ার্ড লুকান"
                    : "পাসওয়ার্ড দেখুন"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA69D] hover:text-[#008B3D]"
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label
              htmlFor="signup-confirm-password"
              className={labelClass}
            >
              পাসওয়ার্ড নিশ্চিত করুন
            </label>

            <div className="relative">
              <input
                id="signup-confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="আবার লিখুন"
                autoComplete="new-password"
                required
                disabled={isBusy}
                className={`${inputClass} pr-11`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "পাসওয়ার্ড লুকান"
                    : "পাসওয়ার্ড দেখুন"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA69D] hover:text-[#008B3D]"
              >
                {showConfirmPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700"
            >
              {error}
            </div>
          )}

          {/* SIGNUP BUTTON */}
          <button
            type="submit"
            disabled={isBusy}
            className="flex h-[43px] w-full items-center justify-center gap-2 rounded-lg bg-[#008B3D] text-[13px] font-bold text-white shadow-[0_3px_0_#C4D5C8] transition hover:bg-[#007532] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                অ্যাকাউন্ট তৈরি হচ্ছে...
              </>
            ) : (
              "অ্যাকাউন্ট তৈরি করুন"
            )}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E0E7E1]" />

          <span className="text-[12px] text-[#7A847D]">
            অথবা
          </span>

          <div className="h-px flex-1 bg-[#E0E7E1]" />
        </div>

        {/* SOCIAL LOGIN */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* GOOGLE */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              handleSocialLogin("google")
            }
            className="flex h-[41px] items-center justify-center gap-1.5 rounded-lg border border-[#DFE8E1] bg-white px-2 text-[12px] font-semibold text-[#26352B] transition hover:bg-[#F5F8F5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {socialLoading === "google" ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <GoogleIcon />
            )}

            <span>
              Google দিয়ে চালিয়ে যান
            </span>
          </button>

          {/* GITHUB */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              handleSocialLogin("github")
            }
            className="flex h-[41px] items-center justify-center gap-1.5 rounded-lg border border-[#DFE8E1] bg-white px-2 text-[12px] font-semibold text-[#26352B] transition hover:bg-[#F5F8F5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {socialLoading === "github" ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <GitHubIcon />
            )}

            <span>
              GitHub দিয়ে চালিয়ে যান
            </span>
          </button>
        </div>

        {/* SIGN IN LINK */}
        <p className="mt-5 text-center text-[12px] text-[#5E6C62]">
          অ্যাকাউন্ট আছে?{" "}
          <Link
            href="/signin"
            className="font-semibold text-[#008B3D] hover:underline"
          >
            সাইন ইন করুন
          </Link>
        </p>
      </div>

      {/* BACK TO HOME */}
      <div className="mt-7 text-center">
        <Link
          href="/"
          className="text-[12px] text-[#7A847D] transition hover:text-[#008B3D]"
        >
          ← হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}
