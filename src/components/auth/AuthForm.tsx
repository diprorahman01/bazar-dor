
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "signin" | "signup";
};

type Provider = "google" | "github";

export default function AuthForm({
  mode,
}: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] =
    useState<Provider | null>(null);

  const [error, setError] = useState("");

  function showError(message: string) {
    setError(message);
    toast.error(message);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading || socialLoading) return;

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (isSignup && !name.trim()) {
      showError("আপনার নাম লিখুন।");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      showError("সঠিক ইমেইল লিখুন।");
      return;
    }

    if (password.length < 8) {
      showError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    if (
      isSignup &&
      password !== confirmPassword
    ) {
      showError("দুটি পাসওয়ার্ড মিলছে না।");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: cleanEmail,
          password,
        });

        if (result.error) {
          throw new Error(
            result.error.message ||
              "অ্যাকাউন্ট তৈরি করা যায়নি।"
          );
        }

        toast.success(
          "অ্যাকাউন্ট তৈরি হয়েছে। এখন সাইন ইন করুন।"
        );

        router.push("/signin");
        router.refresh();
      } else {
        const result = await authClient.signIn.email({
          email: cleanEmail,
          password,
          rememberMe: true,
        });

        if (result.error) {
          throw new Error(
            result.error.message ||
              "সাইন ইন করা যায়নি।"
          );
        }

        toast.success("সাইন ইন সফল হয়েছে।");

        window.location.assign("/");
      }
    } catch (err) {
      console.error("Authentication error:", err);

      showError(
        err instanceof Error
          ? err.message
          : "অথেনটিকেশন ব্যর্থ হয়েছে।"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(
    provider: Provider
  ) {
    if (loading || socialLoading) return;

    setError("");
    setSocialLoading(provider);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/",
        errorCallbackURL: isSignup
          ? "/signup"
          : "/signin",
      });

      if (result.error) {
        throw new Error(
          result.error.message ||
            `${provider} authentication failed`
        );
      }

      // Better Auth handles the OAuth redirect.
    } catch (err) {
      console.error(`${provider} OAuth error:`, err);

      showError(
        err instanceof Error
          ? err.message
          : `${provider} দিয়ে সাইন ইন করা যায়নি।`
      );
    } finally {
      setSocialLoading(null);
    }
  }

  const busy = loading || socialLoading !== null;

  const inputClass =
    "mt-1.5 h-10 w-full rounded-lg border " +
    "border-[#DFE8E1] bg-white px-3 text-sm " +
    "text-[#17251B] outline-none " +
    "focus:border-[#008B3D] " +
    "focus:ring-2 focus:ring-green-100";

  return (
    <main className="flex min-h-[calc(100vh-190px)] flex-col items-center bg-[#F1F6F2] px-4 pb-16 pt-9">
      <div className="mb-7 text-center">
        <h1 className="text-[26px] font-bold text-[#17251B]">
          {isSignup
            ? "অ্যাকাউন্ট তৈরি করুন"
            : "আপনার অ্যাকাউন্টে সাইন ইন করুন"}
        </h1>

        <p className="mt-2 text-[13px] text-[#758078]">
          {isSignup
            ? "বিনা খরচে সাইন আপ করে সব বিস্তারিত দাম দেখুন।"
            : "বাজারের সর্বশেষ দাম দেখতে সাইন ইন করুন।"}
        </p>
      </div>

      <div className="w-full max-w-[416px] rounded-2xl border border-[#DFE8E1] bg-white px-6 py-7 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {isSignup && (
            <div>
              <label
                htmlFor="auth-name"
                className="text-[13px] font-semibold"
              >
                নাম
              </label>

              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: রহিম উদ্দিন"
                className={inputClass}
                required
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="text-[13px] font-semibold"
            >
              ইমেইল
            </label>

            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="text-[13px] font-semibold"
            >
              পাসওয়ার্ড
            </label>

            <div className="relative">
              <input
                id="auth-password"
                type={
                  showPassword ? "text" : "password"
                }
                autoComplete={
                  isSignup
                    ? "new-password"
                    : "current-password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="কমপক্ষে ৮ অক্ষর"
                className={`${inputClass} pr-16`}
                minLength={8}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-4 text-xs text-[#64736A]"
              >
                {showPassword ? "লুকান" : "দেখুন"}
              </button>
            </div>
          </div>

          {isSignup && (
            <div>
              <label
                htmlFor="auth-confirm"
                className="text-[13px] font-semibold"
              >
                পাসওয়ার্ড নিশ্চিত করুন
              </label>

              <div className="relative">
                <input
                  id="auth-confirm"
                  type={
                    showConfirm ? "text" : "password"
                  }
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="আবার লিখুন"
                  className={`${inputClass} pr-16`}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                  className="absolute right-3 top-4 text-xs text-[#64736A]"
                >
                  {showConfirm ? "লুকান" : "দেখুন"}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-lg bg-[#008B3D] font-bold text-white transition hover:bg-[#007532] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "অপেক্ষা করুন..."
              : isSignup
                ? "অ্যাকাউন্ট তৈরি করুন"
                : "সাইন ইন করুন"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E0E7E1]" />
          <span className="text-xs text-[#7A847D]">
            অথবা
          </span>
          <div className="h-px flex-1 bg-[#E0E7E1]" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void handleSocialLogin("google")
            }
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#DFE8E1] px-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            <span className="text-lg font-bold text-[#4285F4]">
              G
            </span>
            {socialLoading === "google"
              ? "অপেক্ষা করুন..."
              : "Google দিয়ে চালিয়ে যান"}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void handleSocialLogin("github")
            }
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#DFE8E1] px-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.13c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.17A10.9 10.9 0 0 1 12 6.1c.98 0 1.97.13 2.89.39 2.2-1.48 3.16-1.17 3.16-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.41-2.68 5.39-5.24 5.68.42.36.79 1.06.79 2.14v3.11c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            {socialLoading === "github"
              ? "অপেক্ষা করুন..."
              : "GitHub দিয়ে চালিয়ে যান"}
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-[#64736A]">
          {isSignup
            ? "অ্যাকাউন্ট আছে?"
            : "অ্যাকাউন্ট নেই?"}{" "}
          <Link
            href={isSignup ? "/signin" : "/signup"}
            className="font-bold text-[#008B3D] hover:underline"
          >
            {isSignup
              ? "সাইন ইন করুন"
              : "অ্যাকাউন্ট তৈরি করুন"}
          </Link>
        </p>
      </div>
    </main>
  );
}
