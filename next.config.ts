import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Patrón para desarrollo LOCAL (se mantiene)
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        // NUEVO PATRÓN para producción en RENDER
        protocol: "https",
        hostname: "ihcbackend.onrender.com",
        port: "", // El puerto estándar (443 para https) no se especifica
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;