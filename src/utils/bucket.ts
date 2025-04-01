// In src/lib/storage.ts
import { createAdminClient } from "@/lib/supabase/client";

/**
 * Creates a Supabase storage bucket if it doesn't already exist
 * @param bucketName Name of the bucket to create
 * @param options Configuration options for the bucket
 * @returns Object with success status and data/error
 */
export async function createBucketIfNotExists(
  bucketName: string,
  options: {
    public?: boolean;
    fileSizeLimit?: number;
    allowedMimeTypes?: string[];
  } = {
    public: true,
    fileSizeLimit: 100 * 1024 * 1024,
    allowedMimeTypes: ["all"],
  }
) {
  try {
    const supabase = createAdminClient();

    // First check if bucket already exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error listing buckets:", listError);
      return { success: false, error: listError };
    }

    // Check if bucket already exists
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName);

    if (bucketExists) {
      console.log(`Bucket "${bucketName}" already exists.`);
      return {
        success: true,
        data: { message: `Bucket "${bucketName}" already exists.` },
        exists: true,
      };
    }

    // Create the bucket if it doesn't exist
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: options.public ?? false,
      fileSizeLimit: options.fileSizeLimit,
      allowedMimeTypes: options.allowedMimeTypes,
    });

    if (error) {
      console.error("Error creating bucket:", error);
      return { success: false, error };
    }

    return {
      success: true,
      data,
      exists: false,
      message: `Bucket "${bucketName}" created successfully.`,
    };
  } catch (error) {
    console.error("Unexpected error creating bucket:", error);
    return { success: false, error };
  }
}
