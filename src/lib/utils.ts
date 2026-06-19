import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "IDR"): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}j ${mins}m` : `${hours} jam`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  duration: number,
  bufferMinutes: number = 0
): string[] {
  const slots: string[] = [];
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);

  let currentMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const slotDuration = duration + bufferMinutes;

  while (currentMinutes + slotDuration <= closeMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    currentMinutes += slotDuration;
  }

  return slots;
}
