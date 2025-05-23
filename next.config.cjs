/* eslint-disable @typescript-eslint/no-require-imports */
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");
// https://images.unsplash.com/photo-1500964757637-c85e8a162699?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NTQ0NTh8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBsYW5kc2NhcGUlMjB3aXRoJTIwbW91bnRhaW58ZW58MHx8fHwxNzQ4MDAyODcxfDA&ixlib=rb-4.1.0&q=80&w=1080
/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
  /** @type {import("next").NextConfig} */
  const nextConfig = {
    eslint: {
      // Disable ESLint during production builds
      ignoreDuringBuilds: true,
    },
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
        {
          protocol: "https",
          hostname: "**.supabase.co",
          port: "",
          pathname: "/storage/v1/object/public/**",
        },
        {
          protocol: "https",
          hostname: "**.supabase.in",
          port: "",
          pathname: "/storage/v1/object/public/**",
        },
        {
          protocol: "https",
          hostname: "**.unsplash.com",
          port: "",
          pathname: "/photo**",
        },
      ],
    },
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
