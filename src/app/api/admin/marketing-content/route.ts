import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Blog, Project } from "@/lib/models";
import { checkRoleClerk } from "@/utils/roles";

// Cache duration in seconds (1 day)
const CACHE_DURATION = 86400;

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkRoleClerk("admin");
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("type") || "all"; // 'blog', 'project', or 'all'
    const limit = parseInt(searchParams.get("limit") || "5");

    await connectDB();

    let blogs = [];
    let projects = [];

    // Fetch data based on content type
    if (contentType === "all" || contentType === "blog") {
      blogs = await Blog.find({ isPublished: true })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .lean()
        .select("_id title slug excerpt publishedAt");
    }

    if (contentType === "all" || contentType === "project") {
      projects = await Project.find({
        status: { $in: ["in-progress", "completed"] },
      })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean()
        .select("_id title slug description updatedAt");
    }

    // Format response
    const response = {
      blogs: blogs.map((blog) => ({
        _id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        date: blog.publishedAt,
      })),
      projects: projects.map((project) => ({
        _id: project._id,
        title: project.title,
        slug: project.slug,
        description: project.description,
        date: project.updatedAt,
      })),
    };

    // Set cache headers
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      `s-maxage=${CACHE_DURATION}, stale-while-revalidate`
    );

    return NextResponse.json(response, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching marketing content:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketing content" },
      { status: 500 }
    );
  }
}
