/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  // Skip API routes during static generation
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
