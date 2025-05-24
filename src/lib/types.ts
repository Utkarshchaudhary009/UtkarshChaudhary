import { z } from "zod";

export interface IAudio {
  public_id: string,
  url: string,
  title: string,
  isTest: boolean,
  size: string,
  duration: number,
  created_at: string,
  format: string
}

export interface IAudioResponse {
  test_audios: IAudio[],
  audios: IAudio[]
}

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
  startDate?: string;
  endDate?: string;
  category: string;
  status: "in-progress" | "completed" | "planned";
  aiGenerated: boolean;
  markdown?: boolean;
  featured?: boolean;
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
  ttsUrl?: string;
  featured?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    openGraph?: IOpenGraph;
  };
  publishedAt?: string;
  isPublished?: boolean;
}
// Contact Schema
export interface IContact extends Document {
  _id?: string;
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
  title?: string;
  profileImage?: string;
  resumePdf?: string;
  work: IJob[];
  email: string;
  location: string;
  stories: IStory[];
  socialLinks: ISocialLink[];
  updatedAt: Date;
}

// Ad Schema
export interface IAd {
  _id?: string;
  title: string;
  image: string;
  cta_url: string;
  target: {
    categories?: string[];
    tags?: string[];
    location?: string;
  };
  impressions: number;
  clicks: number;
  created_at: Date;
}

// Marketing Mail Schema
export interface IMarketingMail {
  _id?: string;
  clerkId: string;
  name: string;
  email: string;
  hasConsented: boolean;
  createdAt: Date;
}

// SEO Schema
export interface ISEO {
  _id?: string;
  pagePath: string;
  title: string;
  description: string;
  keywords?: string[];
  robots?: string;
  openGraph?: IOpenGraph;
  lastModified: Date;
}

// ElevenLabs Types
export interface IElevenLabsKey {
  _id?: string;
  name: string;
  key: string;
  usedCharacters: number;
  characterLimit: number;
  enabled: boolean;
  lastCheckedAt?: Date;
  lastUsedAt?: Date;
  notes?: string;
  tier: 'free' | 'pro' | 'team';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITTSRequest {
  _id?: string;
  text: string;
  voiceId: string;
  cloudinaryUrl?: string;
  apiKeyName?: string;
  charactersUsed?: number;
  durationMs?: number;
  status: 'success' | 'failed';
  error?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVoiceSettings {
  stability: number;
  similarity_boost: number;
}

export interface IElevenLabsConfig {
  defaultVoiceId: string;
  fallbackVoiceId?: string;
  voiceSettings: IVoiceSettings;
  rotationStrategy: string;
  cloudinaryFolder: string;
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
  description: z.string().min(30, "Description must be at least 50 characters"),
  excerpt: z.string().max(160, "Excerpt must not exceed 160 characters"),
  featuredImage: z.string().optional(),
  featuredImagePrompt: z.string().min(10).max(160).optional().nullable(),
  gallery: z
    .array(z.string().url("Gallery images must be valid URLs"))
    .optional(),
  technologies: z.array(z.string()),
  githubUrl: z.string().url("GitHub URL must be valid").optional().nullable(),
  liveUrl: z.string().url("Live URL must be valid").optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  category: z.string().min(2, "Category must be at least 2 characters"),
  status: z.enum(["in-progress", "completed", "planned"]),
  aiGenerated: z.boolean().default(false),
  markdown: z.boolean().default(true),
  featured: z.boolean().default(false),
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
  featuredImagePrompt: z.string().min(10).max(160).optional().nullable(),
  ttsUrl: z.string().optional(),
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
  publishedAt: z.string().optional(),
  isPublished: z.boolean().default(false),
});

// Add BlogFormData type
export type BlogFormData = Omit<IBlog, "_id" | "createdAt" | "updatedAt"> & {
  featured: boolean;
  featuredImagePrompt?: string | undefined;
  isPublished: boolean;
};

// Add ProjectFormData type
export type ProjectFormData = Omit<IProject, "_id" | "createdAt" | "updatedAt"> & {
  featured: boolean;
  featuredImagePrompt?: string | undefined;
};

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
  title: z.string().optional(),
  profileImage: z.string().optional(),
  resumePdf: z.string().optional(),
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

// Add Ad Zod Schema
export const AdTargetSchema = z.object({
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
});

export const AdSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  image: z.string().url("Image must be a valid URL"),
  cta_url: z.string().url("CTA URL must be a valid URL"),
  target: AdTargetSchema,
  impressions: z.number().default(0),
  clicks: z.number().default(0),
  created_at: z.date().default(() => new Date()),
});

export const AdRequestSchema = AdSchema.omit({
  _id: true,
  impressions: true,
  clicks: true,
  created_at: true,
}).extend({
  target: AdTargetSchema,
});

// Fix the BlogRequestSchema issue
export const BlogRequestSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().max(160).optional(),
  featuredImage: z.string().optional(),
  featuredImagePrompt: z.string().min(10).max(160).optional(),
  featured: z.boolean(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().min(10).max(160).optional(),
      canonicalUrl: z.string().optional(),
      openGraph: OpenGraphSchema.optional(),
    })
    .optional(),
  publishedAt: z.string().optional(),
  isPublished: z.boolean(),
});

export const MarketingMailSchema = z.object({
  _id: z.string().optional(),
  clerkId: z.string(),
  name: z.string(),
  email: z.string().email("Invalid email address"),
  hasConsented: z.boolean(),
  createdAt: z.date().default(() => new Date()),
});

// Add SEO Zod Schema
export const SEOMetadataSchema = z.object({
  _id: z.string().optional(),
  pagePath: z.string().min(1, "Page path is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(160, "Description must not exceed 160 characters"),
  keywords: z.array(z.string()).optional(),
  robots: z.string().default("index, follow"),
  openGraph: OpenGraphSchema.optional(),
  lastModified: z.date().default(() => new Date()),
});

export const seoFormSchema = z.object({
  pagePath: z.string().min(1, "Page path is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(160, "Description must not exceed 160 characters"),
  keywords: z.string().optional(),
  robots: z.string().default("index, follow"),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

export const sitemapFormSchema = z.object({
  url: z.string().url("URL must be valid"),
  changefreq: z.enum([
    "always",
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "never",
  ]),
  priority: z.number().min(0).max(1),
});

// ElevenLabs Zod Schemas
export const VoiceSettingsSchema = z.object({
  stability: z.number().min(0).max(1).default(0.3),
  similarity_boost: z.number().min(0).max(1).default(0.75)
});

export const ElevenLabsKeySchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  key: z.string().min(1, "API key is required"),
  usedCharacters: z.number().default(0),
  characterLimit: z.number().default(10000),
  enabled: z.boolean().default(true),
  lastCheckedAt: z.date().optional().nullable(),
  lastUsedAt: z.date().optional().nullable(),
  notes: z.string().optional(),
  tier: z.enum(["free", "pro", "team"]).default("free"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const TTSRequestSchema = z.object({
  _id: z.string().optional(),
  text: z.string().min(1, "Text content is required"),
  voiceId: z.string().min(1, "Voice ID is required"),
  cloudinaryUrl: z.string().url("Must be a valid URL").optional(),
  apiKeyName: z.string().optional(),
  charactersUsed: z.number().optional(),
  durationMs: z.number().optional(),
  status: z.enum(["success", "failed"]).default("success"),
  error: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const ElevenLabsConfigSchema = z.object({
  defaultVoiceId: z.string().min(1, "Default voice ID is required"),
  fallbackVoiceId: z.string().optional(),
  voiceSettings: VoiceSettingsSchema,
  rotationStrategy: z.string().default("least-used"),
  cloudinaryFolder: z.string().default("TTS_Audio"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const ElevenLabsConfigDocSchema = z.object({
  _id: z.string().optional(),
  config: ElevenLabsConfigSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export interface SitemapEntry {
  id?: string;
  url: string;
  changefreq:
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";
  priority: number;
  lastmod?: string;
}
