
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0f5f1] px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-green-700">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-semibold text-gray-800">
          পেজটি খুঁজে পাওয়া যায়নি!
        </h2>

        <p className="mt-3 text-gray-500">
          আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি।
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800"
        >
          হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}
