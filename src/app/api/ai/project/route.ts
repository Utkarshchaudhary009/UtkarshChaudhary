import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ProjectRequestSchema } from "@/lib/types";

async function generateProjectContent(idea: string, genAI: GoogleGenAI) {
  const prompt = `Expert Project Developer Generator\n\n Data: ${idea}.
    "\n\n"
  )}\n\nPlease generate a comprehensive and detailed project description that includes the following elements:\n- A concise and professional title that captures the essence of the project\n- Detailed project description that clearly explains the concept\n- A technical breakdown including appropriate technologies\n- A concise excerpt that summarizes the main points of the project\n\nThe output should be formatted as JSON, containing fields that match the project schema format. Please adhere to the following schema(note - FOLLOW THE SCHEMA ALWAYS): 
  
  title: string.MIN(10).max(25),
  slug: string.MIN(20).max(35),
  content: string.min(100).max(1000),
  description: string.min(50).max(150),
  excerpt: string.max(130),
  technologies: string[] (at least 3 to 5 relevant technologies),
  category: string,
  status: "planned",
  markdown: true,
  seo: {
    metaTitle: string.min(10).max(60),
    metaDescription: string.min(50).max(130),
    keywords: string[] (4-7 relevant keywords)
  }
  `;

  try {
    const result = await genAI.models.generateContent({
      contents: prompt,
      model: "gemini-2.0-flash",
    });

    const response =
      result.text?.replace(/^```json\n/, "").replace(/\n```$/, "") || "[]";
    // console.log(`project content response:`, response);
    return response;
  } catch (error) {
    console.error("Error generating project content:", error);
    throw new Error("Failed to parse project JSON");
  }
}

export async function GET(request: NextRequest) {
  const idea = request.nextUrl.searchParams.get("idea");

  if (!idea) {
    return NextResponse.json(
      { error: "Missing idea parameter" },
      { status: 400 }
    );
  }

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;
  if (!googleApiKey) {
    return NextResponse.json(
      { error: "Google AI API key not found" },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenAI({ apiKey: googleApiKey });

  try {
    const partialProject = await generateProjectContent(idea, genAI);
    // console.log(`partial project:`, partialProject);
    if (!partialProject) {
      return NextResponse.json(
        { error: "Failed to generate project" },
        { status: 500 }
      );
    }
    const projectData = JSON.parse(partialProject);
    const slug = projectData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const fullProject = {
      title: projectData.title,
      slug: projectData.slug || slug,
      content: projectData.content,
      description: projectData.description,
      excerpt: projectData.excerpt || projectData.description.substring(0, 157),
      featuredImage: "",
      gallery: [],
      technologies: projectData.technologies || [],
      category: projectData.category || "Web Development",
      status: "planned",
      markdown: true,
      featured: false,
      aiGenerated: true,
      seo: {
        metaTitle: projectData.seo?.metaTitle || projectData.title,
        metaDescription:
          projectData.seo?.metaDescription ||
          projectData.description?.substring(0, 157) ||
          "",
        keywords: projectData.seo?.keywords || projectData.technologies || [],
      },
    };

    ProjectRequestSchema.parse(fullProject);
    console.log("full project:", fullProject);
    return NextResponse.json(fullProject);
  } catch (error: unknown) {
    console.error("Error generating project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
