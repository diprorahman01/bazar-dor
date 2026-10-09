
import type { Product } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";

type PriceChangeSectionProps = {
  title: string;
  products: Product[];
  type: "up" | "down";
};

export default function PriceChangeSection({
  title,
  products,
  type,
}: PriceChangeSectionProps) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1b2b20]">
        <span
          className={
            type === "up"
              ? "text-red-600"
              : "text-green-700"
          }
        >
          {type === "up" ? "▲" : "▼"}
        </span>

        {title}
      </h2>

      {products.length === 0 ? (
        <p className="rounded-xl bg-white p-5 text-sm text-gray-500">
          এই মুহূর্তে দামের পরিবর্তনের তথ্য পাওয়া যায়নি।
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}
