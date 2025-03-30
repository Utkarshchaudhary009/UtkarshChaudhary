import { Metadata, ResolvingMetadata } from "next";
import ClientProjectDetail from "./client";

// Function to fetch project data for metadata
async function getProjectData(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects?slug=${slug}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.projects?.[0] || null;
  } catch (error) {
    console.error("Error fetching project data for metadata:", error);
    return null;
  }
}

// Dynamic metadata generation
export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Get the project data
  const project = await getProjectData((await params).slug);

  // Get parent metadata (from layout)
  const previousImages = (await parent).openGraph?.images || [];
  const previousTitle = (await parent).title || "Projects";

  // Default metadata if project not found
  if (!project) {
    return {
      title: `Project Not Found | ${previousTitle}`,
      description: "The requested project could not be found.",
    };
  }

  // Build metadata based on project content
  return {
    title: `${project.title} | Projects`,
    description:
      project.excerpt || `Learn more about my project: ${project.title}`,
    keywords: project.technologies?.join(", ") || "",
    openGraph: {
      title: project.title,
      description:
        project.excerpt || `Learn more about my project: ${project.title}`,
      type: "website",
      url: project.liveUrl || undefined,
      images: project.featuredImage
        ? [
            {
              url: project.featuredImage,
              width: 1200,
              height: 630,
              alt: project.title,
            },
            ...previousImages,
          ]
        : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description:
        project.excerpt || `Learn more about my project: ${project.title}`,
      images: project.featuredImage ? [project.featuredImage] : undefined,
    },
  };
}

// Server Component that renders the Client Component
export default function ProjectPage() {
  return <ClientProjectDetail />;
}
