import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "com.utkarsh-chaudhary.pwa",
    name: "Utkarsh Chaudhary",
    short_name: "Utkarsh",
    description: "Utkarsh Chaudhary's personal website",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    dir: "ltr",
    lang: "en",
    categories: ["education", "productivity"],
    prefer_related_applications: false,
  };
}
