/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'c.saavncdn.com' },
      { protocol: 'https', hostname: 'aac.saavncdn.com' }
    ]
  },
  reactStrictMode: false,
  experimental: {
    agentUpgrade: 'security'
  }
};

export default nextConfig;
