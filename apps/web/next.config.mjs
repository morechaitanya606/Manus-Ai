/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  serverExternalPackages: ['razorpay', 'crypto'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co'
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in'
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai'
      },
      {
        protocol: 'https',
        hostname: 'gen.pollinations.ai'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos'
      },
      {
        protocol: 'https',
        hostname: 'cloud.leonardo.ai'
      },
      {
        protocol: 'https',
        hostname: 'cdn.leonardo.ai'
      },
      {
        protocol: 'https',
        hostname: 'imgproxy.fourthwall.com'
      },
      {
        protocol: 'http',
        hostname: 'localhost'
      }
    ]
  }
};

export default nextConfig;
