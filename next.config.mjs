/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        ignored: /\.next|node_modules/,
        poll: 1000,
      };
    }
    return config;
  },
}

export default nextConfig
