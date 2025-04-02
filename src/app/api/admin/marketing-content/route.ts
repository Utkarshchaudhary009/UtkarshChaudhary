import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Blog, Portfolio } from "@/lib/models";
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
    const contentType = searchParams.get("type") || "all"; // 'blog', 'Portfolio', or 'all'
    const limit = parseInt(searchParams.get("limit") || "5");

    await connectDB();

    let blogs = [];
    let Portfolios = [];

    // Fetch data based on content type
    if (contentType === "all" || contentType === "blog") {
      blogs = await Blog.find({ isPublished: true })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .lean()
        .select("_id title slug excerpt publishedAt");
    }

    if (contentType === "all" || contentType === "Portfolio") {
      Portfolios = await Portfolio.find({
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
      Portfolios: Portfolios.map((Portfolio) => ({
        _id: Portfolio._id,
        title: Portfolio.title,
        slug: Portfolio.slug,
        description: Portfolio.description,
        date: Portfolio.updatedAt,
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
