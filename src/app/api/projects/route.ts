import { NextResponse } from "next/server";
import { Portfolio } from "@/lib/models";
import connectDB from "@/lib/db";
import { PortfolioRequestSchema } from "@/lib/types";
import { z } from "zod";
// import { auth } from "@clerk/nextjs";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    // Query parameters
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const technology = searchParams.get("technology");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const removeAllFromString = (str: string | null): string => {
      return str ? str.replace("all", "") : "";
    };

    // Helper function to check if string has meaningful value
    const hasValue = (str: string | null): boolean => {
      return str !== null && str.trim() !== "" && str !== "all";
    };

    // Build query
    const query: {
      slug?: string;
      category?: string;
      status?: string;
      technologies?: string | string[];
      featured?: boolean;
    } = {};
    if (slug && hasValue(slug)) query.slug = slug;
    if (category && hasValue(category))
      query.category = removeAllFromString(category);
    if (status && hasValue(status)) query.status = removeAllFromString(status);
    if (technology && hasValue(technology))
      query.technologies = removeAllFromString(technology);
    if (featured === "true") query.featured = true;

    console.log(`after:${category}, ${status}, ${technology}`);
    // Handle pagination and sorting
    const skip = (page - 1) * limit;
    const sort: { [key: string]: 1 | -1 } = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const [Portfolios, total] = await Promise.all([
      Portfolio.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-embeddings"),
      Portfolio.countDocuments(query),
    ]);

    if (slug && Portfolios.length === 0) {
      return NextResponse.json(
        { message: "Portfolio not found" },
        { status: 404 }
      );
    }

    // Return response with pagination metadata
    return NextResponse.json({
      Portfolios,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    console.log("eror in server:");
    console.log(err);
    console.error(
      "Portfolio GET Error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    await connectDB();
    const body = await request.json();

    try {
      // Convert date strings to Date objects before validation

      // Validate data with Zod
      const validatedData = PortfolioRequestSchema.parse(body);

      // Check for duplicate slug
      const existingPortfolio = await Portfolio.findOne({
        slug: validatedData.slug,
      });
      if (existingPortfolio) {
        return NextResponse.json(
          {
            message: `A Portfolio with slug "${validatedData.slug}" already exists`,
          },
          { status: 409 }
        );
      }

      // Create Portfolio
      const Portfolio = await Portfolio.create({
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json(Portfolio, { status: 201 });
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.log("Validation Error", err.errors);
        return NextResponse.json(
          { message: "Validation Error", errors: err.errors },
          { status: 400 }
        );
      }

      // Handle MongoDB duplicate key error more gracefully
      if (
        err instanceof Error &&
        err.message.includes("E11000 duplicate key error")
      ) {
        const match = err.message.match(/dup key: { (\w+): "([^"]+)" }/);
        const field = match?.[1] || "unknown field";
        const value = match?.[2] || "unknown value";

        return NextResponse.json(
          {
            message: `A Portfolio with this ${field} already exists: "${value}"`,
          },
          { status: 409 }
        );
      }

      throw err;
    }
  } catch (err: unknown) {
    console.error(
      "Portfolio POST Error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      {
        message: "Internal Server Error",
        details: err instanceof Error ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
