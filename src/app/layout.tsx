
import type { Metadata } from "next";
import { Toaster } from "sonner";

import Navbar from "@/components/layout/Navbar";
import PriceTicker from "@/components/layout/PriceTicker";
import Footer from "@/components/layout/Footer";

import "./globals.css";

// ============================================
// WEBSITE METADATA
// ============================================

export const metadata: Metadata = {
  title: "বাজার দর | BazarDor",
  description:
    "বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের দাম এক নজরে",
};

// ============================================
// ROOT LAYOUT
// ============================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#f0f5f1] text-gray-900"
      >
        <div className="flex min-h-screen flex-col">
          {/* NAVBAR */}
          <Navbar />

          {/* LIVE PRICE TICKER */}
          <PriceTicker />

          {/* MAIN PAGE CONTENT */}
          <main className="flex-1">
            {children}
          </main>

          {/* FOOTER */}
          <Footer />
        </div>

        {/* =====================================
            GLOBAL TOAST NOTIFICATIONS
        ===================================== */}

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3500}
          expand={false}
        />
      </body>
    </html>
  );
}
