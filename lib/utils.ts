import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function isValidUserId(userId: string): boolean {
  return userId.length > 0 && userId.length <= 50 && /^[a-zA-Z0-9_\-\s]+$/.test(userId)
}

export function sanitizeUserId(userId: string): string {
  return userId.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '')
}
