
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function SigninPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error("ইমেইল এবং পাসওয়ার্ড লিখুন");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(
          error.message ||
            "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়"
        );
        return;
      }

      toast.success("সফলভাবে সাইন ইন হয়েছে!");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("লগইন করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
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

        <form onSubmit={handleSignin} className="space-y-5">
          {/* EMAIL */}

          <div>
            <label
              htmlFor="email"
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
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="example@gmail.com"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#008B3D]"
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div>
            <label
              htmlFor="password"
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
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="আপনার পাসওয়ার্ড"
                autoComplete="current-password"
                required
                disabled={loading}
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

          {/* SIGN IN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#008B3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#006D30] disabled:cursor-not-allowed disabled:opacity-60"
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

        {/* SIGN UP LINK */}

        <p className="mt-6 text-center text-sm text-gray-600">
          অ্যাকাউন্ট নেই?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#008B3D] hover:underline"
          >
            রেজিস্ট্রেশন করুন
          </Link>
        </p>
      </div>
    </main>
  );
}
