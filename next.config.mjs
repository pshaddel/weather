/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
    logging: {
        fetches: {
          fullUrl: true,
        },
      }
};

export default nextConfig;
