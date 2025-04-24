/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Removed deprecated fontLoaders experimental option
  // Increase timeout for font loading
  staticPageGenerationTimeout: 120,
};

module.exports = nextConfig;