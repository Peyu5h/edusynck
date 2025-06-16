import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function ny(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetchCallback = ({
  setIsPending,
}: {
  setIsPending: (value: boolean) => void;
}) => {
  return {
    onRequest: () => {
      setIsPending(true);
    },
    onResponse: () => {
      setIsPending(false);
    },
  };
};

/**
 * Safely access environment variables with fallbacks
 */
export function getEnv(key: string, defaultValue: string = ""): string {
  return process.env[key] || defaultValue;
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if we're running on Vercel
 */
export function isVercel(): boolean {
  return !!process.env.VERCEL;
}

/**
 * Get Base URL based on environment
 */
export function getBaseUrl(): string {
  if (isVercel()) {
    // Use VERCEL_URL for preview deployments
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    // Use URL from environment variable
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }
  }

  // Local development fallback
  return "http://localhost:3000";
}

/**
 * Get API URL based on environment
 */
export function getApiUrl(): string {
  return `${getBaseUrl()}/api`;
}
