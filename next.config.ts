import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Patrón para desarrollo LOCAL (puerto por defecto de Strapi)
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        // Patrón para desarrollo LOCAL (puerto alternativo de Strapi)
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        // Patrón para producción en RENDER
        protocol: "https",
        hostname: "ihcbackend.onrender.com",
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;