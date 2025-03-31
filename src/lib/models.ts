import mongoose from "mongoose";
import {
  IProject,
  IBlog,
  IContact,
  IPersonalDetails,
  IAd,
  IMarketingMail,
} from "./types";

const DEFAULT_IMG =
  "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1742598419/uploads/d9eqgzesei4wsgbb6mko.png";

// Add interface for model instance types

const PersonalDetailsSchema = new mongoose.Schema<IPersonalDetails>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  bio: { type: String, required: true },
  title: { type: String },
  profileImage: { type: String },
  work: [
    {
      title: { type: String, required: true },
      company: { type: String, required: true },
      period: { type: String, required: true },
    },
  ],
  email: { type: String, required: true },
  location: { type: String, required: true },
  stories: [
    {
      heading: { type: String, required: true },
      content: { type: String, required: true },
    },
  ],
  socialLinks: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      platform: { type: String, required: true },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

// Project Schema
const ProjectSchema = new mongoose.Schema<IProject>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  description: { type: String, required: true },
  excerpt: { type: String, maxlength: 160, required: true },
  featuredImage: { type: String, default: DEFAULT_IMG },
  gallery: [{ type: String, default: DEFAULT_IMG }],
  technologies: [{ type: String, required: true }],
  githubUrl: { type: String },
  liveUrl: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  category: { type: String, required: true },
  status: {
    type: String,
    enum: ["in-progress", "completed", "planned"],
    required: true,
  },
  featured: { type: Boolean, default: false },
  aiGenerated: { type: Boolean, default: false },
  markdown: { type: Boolean, default: true },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }],
    structuredData: { type: mongoose.Schema.Types.Mixed },
  },
  embeddings: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// request body example

// Add enhanced utility methods to ProjectSchema
ProjectSchema.methods.generateStructuredData = function () {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: this.title,
    description: this.description,
    image: this.featuredImage,
    dateCreated: this.startDate || this.createdAt,
    dateModified: this.updatedAt,
    programmingLanguage: this.technologies,
    codeRepository: this.githubUrl,
    url: this.liveUrl,
    category: this.category,
    status: this.status,
  };
};

const AdSchema = new mongoose.Schema<IAd>({
  title: {
    type: String,
    required: [true, "Title is required"],
    minlength: [3, "Title must be at least 3 characters"],
  },
  image: {
    type: String,
    required: [true, "Image URL is required"],
  },
  cta_url: {
    type: String,
    required: [true, "CTA URL is required"],
  },
  target: {
    categories: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: null,
    },
  },
  impressions: {
    type: Number,
    default: 0,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const ContactSchema = new mongoose.Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["unread", "read", "replied"],
    default: "unread",
  },
  createdAt: { type: Date, default: Date.now },
});

// Blog Schema
const BlogSchema = new mongoose.Schema<IBlog>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String, maxlength: 160 },
  featuredImage: { type: String, default: DEFAULT_IMG },
  aiGenerated: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    canonicalUrl: { type: String },
    openGraph: {
      title: { type: String },
      description: { type: String },
      images: [
        {
          url: { type: String },
        },
      ],
    },
  },
  publishedAt: { type: String },
  isPublished: { type: Boolean, default: false },
});

// SEO Metadata Schema
const SEOSchema = new mongoose.Schema({
  pagePath: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: [{ type: String }],
  robots: { type: String, default: "index, follow" },
  lastModified: { type: Date, default: Date.now },
});

// Sitemap Schema
const SitemapSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  changefreq: {
    type: String,
    enum: ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"],
    default: "weekly",
  },
  priority: { type: Number, min: 0, max: 1, default: 0.8 },
  lastmod: { type: Date, default: Date.now },
});

// Add indexes for performance
ProjectSchema.index({ slug: 1, createdAt: -1 });
BlogSchema.index({ publishedAt: -1, isPublished: 1 });

// Add slug generation middleware
ProjectSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

BlogSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

// Enable strict schema validation
ProjectSchema.set("validateBeforeSave", true);
BlogSchema.set("validateBeforeSave", true);

// Add validation middleware for SEO metadata
const validateMetaDescription = (text: string) => {
  return text && text.length >= 10 && text.length <= 160;
};

ProjectSchema.pre("validate", function (next) {
  if (
    this.seo?.metaDescription &&
    !validateMetaDescription(this.seo.metaDescription)
  ) {
    this.invalidate(
      "seo.metaDescription",
      "Meta description must be between 10-160 characters"
    );
  }
  next();
});

BlogSchema.pre("validate", function (next) {
  if (
    this.seo?.metaDescription &&
    !validateMetaDescription(this.seo.metaDescription)
  ) {
    this.invalidate(
      "seo.metaDescription",
      "Meta description must be between 120-160 characters"
    );
  }
  next();
});

// MarketingMail Schema
const MarketingMailSchema = new mongoose.Schema<IMarketingMail>({
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  hasConsented: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Export models
export const Project =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export const Blog =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
export const SEO = mongoose.models.SEO || mongoose.model("SEO", SEOSchema);
export const Sitemap =
  mongoose.models.Sitemap || mongoose.model("Sitemap", SitemapSchema);

export const PersonalDetails =
  mongoose.models.PersonalDetails ||
  mongoose.model<IPersonalDetails>("PersonalDetails", PersonalDetailsSchema);
export const Contact =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

// Create or use existing model
export const AdModel = mongoose.models.Ad || mongoose.model("Ad", AdSchema);

export const MarketingMail =
  mongoose.models.MarketingMail ||
  mongoose.model<IMarketingMail>("MarketingMail", MarketingMailSchema);
