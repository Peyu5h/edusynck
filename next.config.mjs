/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "https",
        hostname: "academiaa.onrender.com",
      },
      {
        protocol: "https",
        hostname: "classroom.google.com",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
      {
        protocol: "https",
        hostname: "*.netlify.app",
      },
      // Add wildcard patterns for common deployment platforms
      {
        protocol: "https",
        hostname: "**.herokuapp.com",
      },
      {
        protocol: "https",
        hostname: "**.railway.app",
      },
      {
        protocol: "https",
        hostname: "**.fly.dev",
      },
    ],
    // Keep domains for backward compatibility and add more
    domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "localhost",
      "academiaa.onrender.com",
      "classroom.google.com",
      // Add the current production domain if available
      ...(process.env.VERCEL_URL ? [process.env.VERCEL_URL] : []),
      ...(process.env.NEXT_PUBLIC_VERCEL_URL
        ? [process.env.NEXT_PUBLIC_VERCEL_URL]
        : []),
    ].filter(Boolean),
    // Allow unoptimized images for fallback scenarios
    unoptimized: process.env.NODE_ENV === "development",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
