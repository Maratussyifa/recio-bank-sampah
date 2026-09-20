/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "learn.smktelkom-mlg.sch.id",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: "https://learn.smktelkom-mlg.sch.id/bank_sampah/api/v1/:path*",
      },
    ];
  },
};

module.exports = nextConfig;