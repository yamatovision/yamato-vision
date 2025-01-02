/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['vz-7b4f2b4c-53c.b-cdn.net'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'vz-7b4f2b4c-53c.b-cdn.net',
          pathname: '/**',
        },
      ],
    },
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Referrer-Policy',
              value: 'no-referrer',
            },
          ],
        },
      ]
    }
  }
  
  module.exports = nextConfig