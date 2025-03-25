import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
// import { z } from "zod";
import { BlogSchema } from "@/lib/types";
import slugify from "slugify";
import * as cheerio from 'cheerio';

// Define the structure of a news article
interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

// Define the structure of a news article from News API
interface NewsAPIArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

// Define the structure of the blog post
interface GeneratedBlog {
  title: string;
  content: string;
  sourceArticles: NewsArticle[];
}

// Function to fetch news articles from News API
async function fetchAINews(): Promise<NewsArticle> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEWS_API_KEY environment variable");
  }

  const url = `https://newsapi.org/v2/everything?q=artificial intelligence OR AI&sortBy=popularity&pageSize=1&apiKey=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`News API request failed with status: ${response.status}`);
  }

  const data = await response.json();
  // Check if data.articles is an array before mapping
  if (!Array.isArray(data.articles) || data.articles.length === 0) {
    throw new Error("Invalid response format from News API: articles is not an array or is empty");
  }
  const article = data.articles[0] as NewsAPIArticle;
  return {
    title: article.title,
    description: article.description,
    url: article.url,
    publishedAt: article.publishedAt,
    source: {
      name: article.source.name,
    },
  };
}

async function scrapeContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${url}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    // Extract text content from paragraphs and headings
    const textContent = $('p, h1, h2, h3, h4, h5, h6').map((_, el) => $(el).text()).get().join('\n');
    return textContent;
  } catch (error) {
    console.error(`Error scraping content from ${url}:`, error);
    return "";
  }
}

async function searchSerpApi(query: string): Promise<string[]> {
  const serpApiKey = process.env.SERP_API_KEY;
  if (!serpApiKey) {
    throw new Error("Missing SERP_API_KEY environment variable");
  }

  const encodedQuery = encodeURIComponent(query);
  const url = `https://serpapi.com/search.json?q=${encodedQuery}&api_key=${serpApiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SerpApi request failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.organic_results || !Array.isArray(data.organic_results)) {
      throw new Error("Invalid response format from SerpApi: organic_results is not an array");
    }
    const links = data.organic_results.slice(0, 3).map((item: any) => item.link);
    return links;
  } catch (error) {
    console.error("Error searching SerpApi:", error);
    return [];
  }
}

// Function to generate a blog post using Gemini API
async function generateAIBlog(articles: NewsArticle): Promise<GeneratedBlog> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash" });

  const serpLinks = await searchSerpApi(articles.title);
  const scrapedContents = await Promise.all(serpLinks.map(scrapeContent));
  const combinedContent = scrapedContents.join("\n\n");

  const prompt = `
    You are an expert AI blogger. Based on the following news article and additional content from top search results, create a well-structured, informative, and engaging blog post.
    
    News Article:
    - ${articles.title}: ${articles.description} (Source: ${articles.source.name}, URL: ${articles.url})
    
    Additional Content:
    ${combinedContent}
    
    Instructions:
    1. Create a catchy title for the blog post.
    2. Write an introduction that summarizes the current state of AI based on the articles.
    3. Create 3-5 sections, each focusing on a specific trend or development in AI.
    4. For each section, provide a detailed explanation and cite the relevant articles.
    5. Write a conclusion that summarizes the key takeaways and future outlook.
    6. Make sure the blog is well-structured with clear headings and paragraphs.
    7. Use a professional and engaging tone.
    8. The blog should be at least 500 words long.
    9. Use markdown format.
    10. Add a list of source articles at the end.
    11. Create a short excerpt of the blog post.
    
    Blog Post:
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Extract title and excerpt from the generated text
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : "Latest AI Technology";
  const excerptMatch = text.match(/(?<=^|\n\n)(.*?)(?=\n\n|$)/s);
  // const excerpt = excerptMatch ? excerptMatch[1].trim().slice(0, 160) : "";

  return {
    title: title,
    content: text,
    sourceArticles: [articles],
  };
}

// Main API route handler
export async function GET() {
  try {
    const newsArticle = await fetchAINews();
    const generatedBlog = await generateAIBlog(newsArticle);

    // Create a slug from the title
    const slug = slugify(generatedBlog.title, { lower: true });

    // Structure the blog post according to BlogRequestSchema
    const structuredBlog = {
      title: generatedBlog.title,
      slug: slug,
      content: generatedBlog.content,
      excerpt: generatedBlog.content.slice(0, 160),
      featuredImage: "", // You can add logic to extract a featured image from the content or articles
      seo: {
        metaTitle: generatedBlog.title,
        metaDescription: generatedBlog.content.slice(0, 160),
      },
      isPublished: false, // You can change this based on your requirements
      publishedAt: new Date(), // You can change this based on your requirements
    };

    // Validate the structured blog against BlogRequestSchema
    const validatedBlog = BlogSchema.parse(structuredBlog);

    return NextResponse.json(validatedBlog);
  } catch (error: unknown) {
    console.error("AI Blog API Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { message: "Failed to generate AI blog", error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
