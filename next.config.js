/* eslint-disable @typescript-eslint/no-require-imports */
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
  /** @type {import("next").NextConfig} */
  const nextConfig = {
    eslint: {
      // Disable ESLint during production builds
      ignoreDuringBuilds: true,
    },
    // Optimize image handling
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
          port: "",
          pathname: "/dgdfxsuoh/image/upload/**",
        },
        {
          protocol: "https",
          hostname: "example.com",
          port: "",
          pathname: "/images/**",
        },
      ],
      // Add modern format support
      formats: ["image/avif", "image/webp"],
      // Speed up image optimization
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      minimumCacheTTL: 60,
    },
    // Enable gzip compression
    compress: true,
    // Enable React server components
    reactStrictMode: true,
    // Add custom headers for security and caching
    headers: async () => [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Add browser cache control
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      // Cache static assets longer
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache cloudinary images longer
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=31536000",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ],
    // Optimize output
    output: "standalone",
    // Webpack optimization for better performance
    webpack: (config, { isServer }) => {
      // Optimize bundle splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          minSize: 10000,
          maxSize: 250000,
          cacheGroups: {
            framework: {
              name: "framework",
              test: /[\\/]node_modules[\\/](react|react-dom|next|@next)[\\/]/,
              priority: 40,
              chunks: "all",
              enforce: true,
            },
            commons: {
              name: "commons",
              minChunks: 2,
              priority: 20,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )[1];
                return `npm.${packageName.replace("@", "")}`;
              },
              priority: 10,
              chunks: "async",
              minChunks: 1,
            },
            lib: {
              test: /[\\/]node_modules[\\/](framer-motion|lucide-react|react-markdown)[\\/]/,
              name: "lib",
              priority: 30,
              chunks: "all",
            },
          },
        },
        runtimeChunk: { name: "runtime" },
      };

      // Remove moment.js locales to reduce bundle size
      if (!isServer) {
        config.resolve.alias = {
          ...config.resolve.alias,
          moment$: "moment/moment.js",
        };
      }

      return config;
    },
    // Add modern JavaScript optimizations
    experimental: {
      optimizeCss: true,
      optimizePackageImports: [
        "lucide-react",
        "framer-motion",
        "date-fns",
        "@radix-ui/react-icons",
      ],
    },
  };

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import("@serwist/next")).default({
      swSrc: "src/service-worker/app-worker.ts",
      swDest: "public/sw.js",
      reloadOnOnline: true,
    });
    return withSerwist(nextConfig);
  }

  return nextConfig;
};
