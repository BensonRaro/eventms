import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export const buildTicketToken = () => {
  return crypto.randomBytes(10).toString("hex").toUpperCase();
};

export const hashTicketToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
