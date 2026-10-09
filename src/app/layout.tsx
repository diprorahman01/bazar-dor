
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import PriceTicker from "@/components/layout/PriceTicker";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "বাজার দর | BazarDor",
  description:
    "বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের দাম এক নজরে",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#f0f5f1] text-gray-900">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <PriceTicker />

          <div className="flex-1">
            {children}
          </div>

          <Footer />
        </div>
      </body>
    </html>
  );
}
