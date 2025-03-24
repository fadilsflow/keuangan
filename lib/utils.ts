import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { ItemSchema } from "./types";
import { z } from "zod";

// Type untuk item
type Item = z.infer<typeof ItemSchema>;

// Fungsi untuk menghitung total harga dari items
export function calculateTotalAmount(items: Item[]): number {
  return items.reduce(
    (total, item) => total + item.itemPrice * item.quantity,
    0
  );
}

// Fungsi untuk menghitung harga total untuk setiap item
export function calculateItemTotalPrices(items: Item[]): Item[] {
  return items.map((item) => ({
    ...item,
    totalPrice: item.itemPrice * item.quantity,
  }));
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format tanggal
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
