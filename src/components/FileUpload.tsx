"use client";
import { cn } from "@/lib/utils";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  useDropzoneContext,
} from "@/components/dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";

// Define component props
interface FileUploadProps {
  bucketName?: string;
  path?: string;
  allowedMimeTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number;
  setFileUrls?: (urls: string[]) => void;
  className?: string;
}

export default function FileUpload({
  bucketName = "files",
  path = "",
  allowedMimeTypes = [],
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  setFileUrls,
  className,
}: FileUploadProps) {
  const props = useSupabaseUpload({
    bucketName,
    path,
    allowedMimeTypes,
    maxFiles,
    maxFileSize,
  });
  const { files } = useDropzoneContext();
  const urls = files.map((file) => file.preview) || [];
  setFileUrls(urls);
  return (
    <div className={cn("w-full", className)}>
      <Dropzone {...props}>
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
    </div>
  );
}
