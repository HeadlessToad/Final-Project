// src/components/ui/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @function cn
 * @description A utility function to combine and conditionally apply Tailwind CSS classes
 * in a robust way, handling conflicting classes (e.g., 'p-4' and 'p-8').
 * It is crucial for NativeWind component styling.
 * @param {...ClassValue} inputs - Array of class values (strings, arrays, objects).
 * @returns {string} The merged and processed Tailwind class string.
 */
export function cn(...inputs: ClassValue[]) {
  // clsx conditionally combines class names
  // twMerge merges the resulting string, resolving conflicting classes gracefully
  return twMerge(clsx(inputs));
}