import { MetadataRoute } from "next";
import { IBlog, IProject, SitemapEntry } from "@/lib/types";
import fs from "fs";
import path from "path";
// Config file path
const configPath = path.join(process.cwd(), "src/config/sitemap-config.json");

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

// Function to get custom sitemap entries
function getCustomSitemapEntries(): Array<{
  url: string;
  lastModified?: Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}> {
  try {
    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      // Return default entries if file doesn't exist
      return [
        {
          url: "/",
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 1.0,
        },
        {
          url: "/home",
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.9,
        },
        {
          url: "/about",
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.8,
        },
        {
          url: "/contact",
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.8,
        },
        {
          url: "/blog",
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.9,
        },
        {
          url: "/projects",
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.9,
        },
      ];
    }

    // Read config file
    const configData = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configData);

    // Map the entries to the expected format
    return (config.entries || []).map((entry: SitemapEntry) => ({
      url: entry.url,
      lastModified: entry.lastmod ? new Date(entry.lastmod) : new Date(),
      changeFrequency: entry.changefreq,
      priority: entry.priority,
    }));
  } catch (error) {
    console.error("Error reading sitemap configuration:", error);
    return [];
  }
}

// Domain configuration
const DOMAIN =
  process.env.NEXT_PUBLIC_BASE_URL || "https://utkarshchaudhary.space";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get custom entries from configuration
  const customEntries = getCustomSitemapEntries();

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

  // Convert custom entries to absolute URLs
  const processedCustomEntries = customEntries.map((entry) => {
    // If the URL is already absolute, use it as is
    if (entry.url.startsWith("http")) {
      return entry;
    }

    // Otherwise, prefix with the domain
    return {
      ...entry,
      url: `${DOMAIN}${entry.url.startsWith("/") ? "" : "/"}${entry.url}`,
    };
  });

  // Combine all routes
  return [...processedCustomEntries, ...blogRoutes, ...projectRoutes];
}
