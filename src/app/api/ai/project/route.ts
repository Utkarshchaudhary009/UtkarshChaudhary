import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ProjectRequestSchema } from "@/lib/types";

async function generateProjectContent(idea: string, genAI: GoogleGenAI) {
  const prompt = `Generate a detailed project idea (in JSON format) about "${idea}". Include:
  title: string,
  content: string (1000-1500 characters, with some markdown formatting),
  description: string (200-250 characters),
  excerpt: string (less than 160 characters),
  technologies: string[] (at least 3 to 5 relevant technologies),
  category: string,
  status: "planned",
  markdown: true
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

  const googleApiKey = process.env.GOOGLE_AI_KEY;
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
