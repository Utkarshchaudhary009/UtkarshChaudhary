import { Metadata } from "next";
import BlogClient from "./client";

export const metadata: Metadata = {
  title: "Blog | Utkarsh Chaudhary",
  description: "Latest insights, tutorials, and updates from our team on technology and development.",
  openGraph: {
    title: "Blog | Utkarsh Chaudhary",
    description: "Latest insights, tutorials, and updates from our team on technology and development.",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
        width: 1200,
        height: 630,
        alt: "Blog by Utkarsh Chaudhary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Utkarsh Chaudhary",
    description: "Latest insights, tutorials, and updates from our team on technology and development.",
    images: ["https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg"],
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
