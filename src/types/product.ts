
export type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  icon: string;
  price: number | null;
  change: number | null;
};

export type PriceDirection = "up" | "down" | "flat";
