/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } }
    ],
  },
  // Increase timeout for font loading
  staticPageGenerationTimeout: 120,
};

module.exports = nextConfig;