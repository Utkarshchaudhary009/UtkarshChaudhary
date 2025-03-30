import { Metadata } from "next";
import AboutClient from "./client";

export const metadata: Metadata = {
  title: "About Me | Utkarsh Chaudhary",
  description:
    "Learn more about Utkarsh Chaudhary, my background, work experience, and personal stories.",
  openGraph: {
    title: "About Me | Utkarsh Chaudhary",
    description:
      "Learn more about Utkarsh Chaudhary, my background, work experience, and personal stories.",
    type: "profile",
    images: [
      {
        url: "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
        width: 1200,
        height: 630,
        alt: "Utkarsh Chaudhary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Me | Utkarsh Chaudhary",
    description:
      "Learn more about Utkarsh Chaudhary, my background, work experience, and personal stories.",
    images: [
      "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
    ],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
