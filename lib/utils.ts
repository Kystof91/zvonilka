import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUserId(): string {
  // Generate a 4-digit ID for easy input between 2 users
  // Random number between 1000 and 9999
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export function isValidUserId(userId: string): boolean {
  // Allow 4-digit numeric ID (1000-9999)
  return userId.length === 4 && /^[0-9]+$/.test(userId) && parseInt(userId) >= 1000
}

export function sanitizeUserId(userId: string): string {
  // Keep only digits
  return userId.trim().replace(/[^0-9]/g, '')
}
