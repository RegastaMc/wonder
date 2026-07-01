import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'randomuser.me'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
  },
   experimental: {
    outputFileTracingIgnores: [
      "./src/lib/prisma/client", // If you have a custom Prisma output
      "**/Application Data/**",   // General ignore for the problematic path
    ],
  } as any,
}

export default nextConfig
