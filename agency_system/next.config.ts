import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/setup-password/:token',
        destination: '/auth/setup-password/:token',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
