import { Metadata } from "next";
import ProjectsClient from "./client";
import { generateMetadata as getSEOMetadata } from "@/lib/seoUtils";

// Define fallback metadata
const fallbackMetadata: Metadata = {
  title: "Projects | Utkarsh Chaudhary",
  description:
    "A collection of projects I've worked on, from web applications to AI experiments.",
  openGraph: {
    title: "Projects | Utkarsh Chaudhary",
    description:
      "A collection of projects I've worked on, from web applications to AI experiments.",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
        width: 1200,
        height: 630,
        alt: "Projects by Utkarsh Chaudhary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Utkarsh Chaudhary",
    description:
      "A collection of projects I've worked on, from web applications to AI experiments.",
    images: [
      "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
    ],
  },
};

// Generate metadata using our utility function
export async function generateMetadata(): Promise<Metadata> {
  return getSEOMetadata("/projects", fallbackMetadata);
}

export default function ProjectsPage() {
  return <ProjectsClient />;
}
