/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  swcMinify: true,
}

module.exports = nextConfig
