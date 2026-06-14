import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Mentor",
    short_name: "My Mentor",
    description: "A calm, privacy-first recovery companion built for one healthy step at a time.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F3ED",
    theme_color: "#F6F3ED",
    orientation: "portrait",
    icons: [
      {
        src: "/assets/images/favicon.png",
        sizes: "any",
        type: "image/png"
      },
      {
        src: "/assets/icons/apple-icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
