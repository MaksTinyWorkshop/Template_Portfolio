import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: "@mdx-js/react",
    development: process.env.NODE_ENV === "development",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],

  // Output standalone pour Docker
  output: "standalone",

  // Optimisation des images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "**",
      },
    ],
  },

  // Options Sass
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },

  // Optimisations expérimentales
  experimental: {
    // Optimisation des imports de packages
    // DÉSACTIVÉ TEMPORAIREMENT: optimizePackageImports cause des problèmes SSR avec once-ui-system
    optimizePackageImports: ["react-icons"],
  },

  // Optimisations du compilateur
  compiler: {
    // Retirer les console.log en production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  async rewrites() {
    return {
      beforeFiles: [
        // Keep backward compatibility for existing DB/media URLs under /images/*
        // and serve them through the runtime assets route.
        {
          source: "/images/:path*",
          destination: "/api/assets/:path*",
        },
      ],
    };
  },
};

export default withMDX(nextConfig);
