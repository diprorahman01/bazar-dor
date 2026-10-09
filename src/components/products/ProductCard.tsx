
import Link from "next/link";
import type { Product } from "@/types/product";
import {
  banglaNumber,
  changeColor,
  formatChange,
  formatPrice,
} from "@/lib/format";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <Link
      href={`/product/${encodeURIComponent(product.id)}`}
      className="block rounded-xl border border-[#e3eae5] bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-green-300 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0f5f1] text-2xl">
          {product.icon}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold text-[#1c2d22]">
            {product.name}
          </h3>

          <p className="mt-0.5 text-xs text-gray-500">
            {product.unit}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs text-gray-500">
          আজকের বাজারদর
        </p>

        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-base font-bold text-[#15271b]">
            {formatPrice(product.price)}
          </p>

          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${changeColor(
              product.change
            )}`}
          >
            {formatChange(product.change)}
          </span>
        </div>
      </div>
    </Link>
  );
}
