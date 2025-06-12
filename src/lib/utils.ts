import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | null | undefined,
  currency: string = "GBP",
  locale: string = "en-GB"
): string {
  const numericPrice = price || 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(numericPrice);
}
