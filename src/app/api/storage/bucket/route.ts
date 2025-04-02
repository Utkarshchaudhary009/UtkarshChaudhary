import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Check auth (optional - you may want to restrict this)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { bucketName, isPublic, fileSizeLimit, allowedMimeTypes } =
      await req.json();

    if (!bucketName) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 }
      );
    }

    // Get Supabase admin client
    const supabase = await createAdminClient();

    // Check if bucket exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error listing buckets:", listError);
      return NextResponse.json(
        { error: "Failed to check existing buckets", details: listError },
        { status: 500 }
      );
    }

    // Check if bucket already exists
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName);

    // If bucket exists, return success
    if (bucketExists) {
      return NextResponse.json({
        success: true,
        message: `Bucket "${bucketName}" already exists`,
        exists: true,
      });
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic ?? false,
      fileSizeLimit: fileSizeLimit,
      allowedMimeTypes: allowedMimeTypes,
    });

    if (error) {
      console.error("Error creating bucket:", error);
      return NextResponse.json(
        { error: "Failed to create bucket", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Bucket "${bucketName}" created successfully`,
      data,
    });
  } catch (error) {
    console.error("Error in bucket creation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
