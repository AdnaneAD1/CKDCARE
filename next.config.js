/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['fonts.googleapis.com', 'fonts.gstatic.com', 'images.unsplash.com']
  },
  experimental: {
    swcMinify: true,
    fontLoaders: [
      { loader: '@next/font/google', options: { timeout: 10000 } }
    ]
  }
};

module.exports = nextConfig;