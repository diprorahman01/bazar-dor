
export function banglaNumber(value: number): string {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPrice(price: number | null): string {
  if (price === null) return "দাম পাওয়া যায়নি";
  return `${banglaNumber(price)} টাকা`;
}

export function formatChange(change: number | null): string {
  if (change === null) return "তথ্য নেই";

  const number = banglaNumber(Math.abs(change));

  if (change > 0) return `▲ ${number}%`;
  if (change < 0) return `▼ ${number}%`;

  return "— ০.০%";
}

export function changeColor(change: number | null): string {
  if (change === null || change === 0) {
    return "bg-gray-100 text-gray-500";
  }

  if (change > 0) {
    return "bg-red-50 text-red-600";
  }

  return "bg-green-50 text-green-700";
}
