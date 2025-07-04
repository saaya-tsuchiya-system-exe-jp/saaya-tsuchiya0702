import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/saaya-tsuchiya0702',
  assetPrefix: '/saaya-tsuchiya0702',
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  env: {
    APP_NAME: process.env.APP_NAME,
    APP_DESCRIPTION: process.env.APP_DESCRIPTION,
  },
};

export default nextConfig;
