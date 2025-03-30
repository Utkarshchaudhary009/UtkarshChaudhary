import { MetadataRoute } from "next";
import { IBlog, IProject } from "@/lib/types";

// Define interfaces for blog and project types

// Function to dynamically fetch blog posts
async function fetchBlogPosts(): Promise<IBlog[]> {
  try {
    // This would typically be a database or API call
    // For now, we'll return some placeholder blog posts since we can't access the actual data directly
    // In a production environment, you should replace this with actual API calls to your backend
    const response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/blogs?isPublished=true",
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
    return [];
  }
}

// Function to dynamically fetch projects
async function fetchProjects(): Promise<IProject[]> {
  try {
    // This would typically be a database or API call
    const response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/projects",
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error("Error fetching projects for sitemap:", error);
    return [];
  }
}

// Domain configuration
const DOMAIN =
  process.env.NEXT_PUBLIC_BASE_URL || "https://utkarshchaudhary.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Initialize with static routes
  const staticRoutes = [
    {
      url: `${DOMAIN}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1.0,
    },
    {
      url: `${DOMAIN}/home`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${DOMAIN}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${DOMAIN}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${DOMAIN}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${DOMAIN}/projects`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    // Auth routes are typically not included in sitemaps as they're for user authentication
    // and not meant to be indexed by search engines
  ];

  // Fetch dynamic blog posts
  const blogPosts = await fetchBlogPosts();
  const blogRoutes = (blogPosts || []).map((post: IBlog) => ({
    url: `${DOMAIN}/blog/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Fetch dynamic projects
  const projects = await fetchProjects();
  const projectRoutes = (projects || []).map((project: IProject) => ({
    url: `${DOMAIN}/projects/${project.slug}`,
    lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Combine all routes
  return [...staticRoutes, ...blogRoutes, ...projectRoutes];
}
