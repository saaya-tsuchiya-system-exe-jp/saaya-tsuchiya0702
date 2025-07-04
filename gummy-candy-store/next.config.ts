import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  basePath: process.env.NODE_ENV === 'production' ? '/gummy-candy-store' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/gummy-candy-store/' : '',
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
