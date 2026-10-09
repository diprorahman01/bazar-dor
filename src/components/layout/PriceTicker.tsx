
"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { getProducts } from "@/lib/api";
import {
  formatPrice,
  formatChange,
  changeColor,
} from "@/lib/format";

export default function PriceTicker() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const data = await getProducts();

        if (mounted) {
          setProducts(data);
          setError(false);
        }
      } catch (err) {
        console.error("Ticker API error:", err);

        if (mounted) {
          setError(true);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="border-b border-gray-200 bg-white py-3 text-center text-xs text-gray-500">
        বাজারদরের তথ্য এই মুহূর্তে পাওয়া যাচ্ছে না।
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="h-11 animate-pulse border-b border-gray-200 bg-gray-50" />
    );
  }

  // Duplicate the same set for seamless animation.
  const tickerProducts = products.slice(0, 15);

  function renderItems(copy: number) {
    return tickerProducts.map((product) => (
      <div
        key={`${copy}-${product.id}`}
        className="flex shrink-0 items-center gap-2 border-r border-gray-200 px-5 py-3"
      >
        <span className="text-base">
          {product.icon}
        </span>

        <span className="whitespace-nowrap text-xs font-semibold text-gray-800">
          {product.name}
        </span>

        <span className="whitespace-nowrap text-xs text-gray-600">
          {formatPrice(product.price)}
          {product.unit
            ? `/${product.unit.replace("প্রতি ", "")}`
            : ""}
        </span>

        <span
          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${changeColor(
            product.change
          )}`}
        >
          {formatChange(product.change)}
        </span>
      </div>
    ));
  }

  return (
    <div className="w-full overflow-hidden border-b border-gray-200 bg-white">
      <div className="bazar-marquee flex w-max">
        <div className="flex shrink-0">
          {renderItems(1)}
        </div>

        <div
          className="flex shrink-0"
          aria-hidden="true"
        >
          {renderItems(2)}
        </div>
      </div>
    </div>
  );
}
