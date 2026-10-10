
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type SocialProvider = "google" | "github";

function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
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
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297a12 12 0 0 0-3.793 23.386c.6.111.82-.261.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.762-1.604-2.665-.304-5.467-1.333-5.467-5.93 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.323 3.301 1.23a11.53 11.53 0 0 1 6.007 0c2.291-1.553 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.216.694.825.576A12.001 12.001 0 0 0 12 .297z" />
    </svg>
  );
}

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] =
    useState<SocialProvider | null>(null);
  const [error, setError] = useState("");

  const busy = loading || socialLoading !== null;

  function showError(message: string) {
    setError(message);
    toast.error(message);
  }

  async function handleSignin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (busy) return;

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      showError("ইমেইল এবং পাসওয়ার্ড লিখুন।");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: cleanEmail,
        password,
        rememberMe: true,
      });

      if (result.error) {
        showError(
          result.error.message ||
            "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।"
        );
        return;
      }

      toast.success("সফলভাবে সাইন ইন হয়েছে!");
      window.location.assign("/");
    } catch (err) {
      console.error("Sign-in error:", err);

      showError(
        err instanceof Error
          ? err.message
          : "লগইন করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(
    provider: SocialProvider
  ) {
    if (busy) return;

    setError("");
    setSocialLoading(provider);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/",
        errorCallbackURL: "/signin",
      });

      if (result.error) {
        showError(
          result.error.message ||
            `${provider} দিয়ে সাইন ইন করা যায়নি।`
        );
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);

      showError(
        err instanceof Error
          ? err.message
          : `${provider} দিয়ে সাইন ইন করা যায়নি।`
      );
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#F0F5F1] px-4 py-12">
      <div className="w-full max-w-[440px] rounded-2xl border border-[#E2E9E3] bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-7 text-center">
          <div className="mb-3 text-4xl">🛒</div>

          <h1 className="text-2xl font-bold text-[#173E28]">
            আপনার অ্যাকাউন্টে সাইন ইন করুন
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            বাজার দর ব্যবহার করতে লগইন করুন
          </p>
        </div>

        <form
          onSubmit={handleSignin}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="signin-email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              ইমেইল
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="example@gmail.com"
                autoComplete="email"
                required
                disabled={busy}
                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#008B3D]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signin-password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              পাসওয়ার্ড
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="আপনার পাসওয়ার্ড"
                autoComplete="current-password"
                required
                disabled={busy}
                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition focus:border-[#008B3D]"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#008B3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#006D30] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                সাইন ইন হচ্ছে...
              </>
            ) : (
              "সাইন ইন"
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">
            অথবা
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void handleSocialLogin("google")
            }
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            {socialLoading === "google" ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <GoogleIcon />
            )}
            Google
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void handleSocialLogin("github")
            }
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            {socialLoading === "github" ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <GitHubIcon />
            )}
            GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          অ্যাকাউন্ট নেই?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#008B3D] hover:underline"
          >
            রেজিস্ট্রেশন করুন
          </Link>
        </p>

        <p className="mt-5 text-center text-xs">
          <Link
            href="/"
            className="text-gray-500 hover:text-[#008B3D]"
          >
            ← হোম পেজে ফিরে যান
          </Link>
        </p>
      </div>
    </main>
  );
}
