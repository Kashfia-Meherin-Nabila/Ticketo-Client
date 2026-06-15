/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@better-auth/kysely-adapter', 'kysely'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
