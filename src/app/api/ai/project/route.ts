import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// Define the input schema for the content to be improved
const ContentImprovementSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  content: z.string().min(20, { message: "Content must be at least 20 characters." }).optional(),
  keywords: z.array(z.string()).optional(),
});

// Define the structure of the improved content
interface ImprovedContent {
  title: string;
  description: string;
  content?: string;
  keywords?: string[];
}

// Function to improve content using Gemini API
async function improveContent(
  input: z.infer<typeof ContentImprovementSchema>
): Promise<ImprovedContent> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    You are a professional content writer and SEO expert. Your task is to rewrite and improve the following content to make it more engaging, well-structured, and optimized for search engines.

    Title: ${input.title}
    Description: ${input.description}
    ${input.content ? `Content: ${input.content}` : ""}
    ${input.keywords && input.keywords.length > 0 ? `Keywords: ${input.keywords.join(", ")}` : ""}

    Instructions:
    1. Rewrite the title to make it more catchy and compelling.
    2. Rewrite the description to make it more engaging and informative.
    3. If content is provided, rewrite it to make it more professional, well-structured, and engaging.
    4. If keywords are provided, incorporate them naturally into the improved content.
    5. Ensure the improved content is grammatically correct and flows well.
    6. Use a professional and engaging tone.
    7. Use markdown format.

    Improved Content:
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Extract title and description from the generated text
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : input.title;
  const descriptionMatch = text.match(/(?<=^|\n\n)(.*?)(?=\n\n|$)/s);
  const description = descriptionMatch ? descriptionMatch[1].trim() : input.description;

  return {
    title: title,
    description: description,
    content: text,
    keywords: input.keywords,
  };
}

// Main API route handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = ContentImprovementSchema.parse(body);
    const improvedContent = await improveContent(validatedData);
    return NextResponse.json(improvedContent);
  } catch (error: unknown) {
    console.error("AI Content Improvement API Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { message: "Failed to improve content", error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
