import { z } from "zod";

// Interfaces
export interface ISEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  structuredData?: Record<string, unknown>;
}

export interface IOpenGraph {
  title?: string;
  description?: string;
  images?: { url: string }[];
}

export interface IProject {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  excerpt: string;
  featuredImage?: string;
  gallery?: string[];
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate?: Date;
  endDate?: Date;
  category: string;
  status: "in-progress" | "completed" | "planned";
  aiGenerated: boolean;
  markdown?: boolean;
  featured?: boolean;
  seo?: ISEO;
  embeddings?: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBlog {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  aiGenerated?: boolean;
  featured?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    openGraph?: IOpenGraph;
  };
  publishedAt?: Date;
  isPublished?: boolean;
}
// Contact Schema
export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: Date;
  clerkId: string;
}

export interface IJob {
  title: string;
  company: string;
  period: string;
  description?: string;
}

export interface IStory {
  heading: string;
  content: string;
}

export interface ISocialLink {
  name: string;
  url: string;
  platform: string;
  icon?: string;
}

export interface IPersonalDetails {
  name: string;
  age: number;
  bio: string;
  work: IJob[];
  email: string;
  location: string;
  stories: IStory[];
  socialLinks: ISocialLink[];
  updatedAt: Date;
}

// Zod Schemas
export const OpenGraphSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string() })).optional(),
});

export const SEOSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().min(5).max(160).optional(),
  keywords: z.array(z.string()).optional(),
  structuredData: z.record(z.string(), z.unknown()).optional(),
});

export const ProjectSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  content: z.string().min(100, "Content must be at least 100 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  excerpt: z.string().max(160, "Excerpt must not exceed 160 characters"),
  featuredImage: z
    .string()
    .url("Featured image must be a valid URL")
    .optional(),
  gallery: z
    .array(z.string().url("Gallery images must be valid URLs"))
    .optional(),
  technologies: z.array(z.string()),
  githubUrl: z.string().url("GitHub URL must be valid").optional().nullable(),
  liveUrl: z.string().url("Live URL must be valid").optional().nullable(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  category: z.string().min(2, "Category must be at least 2 characters"),
  status: z.enum(["in-progress", "completed", "planned"]),
  aiGenerated: z.boolean().default(false),
  markdown: z.boolean().default(true),
  featured: z.boolean().default(false),
  seo: z
    .object({
      metaTitle: z
        .string()
        .min(3, "Meta title must be at least 3 characters")
        .optional(),
      metaDescription: z
        .string()
        .min(50, "Meta description must be at least 50 characters")
        .max(160, "Meta description must not exceed 160 characters")
        .optional(),
      keywords: z.array(z.string()).optional(),
      structuredData: z.record(z.unknown()).optional(),
    })
    .optional(),
  embeddings: z.array(z.number()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const ProjectRequestSchema = ProjectSchema.omit({
  aiGenerated: true,
  embeddings: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const BlogSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().max(160).optional(),
  featuredImage: z.string().optional(),
  aiGenerated: z.boolean().default(false),
  featured: z.boolean().default(false),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().min(10).max(160).optional(),
      canonicalUrl: z.string().optional(),
      openGraph: OpenGraphSchema.optional(),
    })
    .optional(),
  publishedAt: z.date().optional(),
  isPublished: z.boolean().default(false),
});

// Add BlogFormData type
export type BlogFormData = Omit<IBlog, "_id" | "createdAt" | "updatedAt">;

// Define the Zod schema for the form
export const jobSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  company: z.string().min(1, { message: "Company is required" }),
  period: z.string().min(1, { message: "Period is required" }),
  description: z.string().optional(),
});

export const storySchema = z.object({
  heading: z.string().min(1, { message: "Heading is required" }),
  content: z.string().min(1, { message: "Content is required" }),
});

export const socialLinkSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  url: z.string().url({ message: "Invalid URL" }),
  platform: z.string().min(1, { message: "Platform is required" }),
  icon: z.string().optional(),
});

export const personalDetailsSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  age: z.number().min(1, { message: "Age is required" }),
  work: z.array(jobSchema),
  stories: z.array(storySchema),
  bio: z.string().min(1, { message: "Bio is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  location: z.string().min(1, { message: "location is required" }),
  socialLinks: z.array(socialLinkSchema),
});

export const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  status: z.enum(["unread", "read", "replied"]).default("unread"),
  createdAt: z.date().default(() => new Date()),
  clerkId: z.string().optional(),
});

// Add a request schema for Blog
export const BlogRequestSchema = BlogSchema.omit({
  aiGenerated: true,
  createdAt: true,
  updatedAt: true,
});
