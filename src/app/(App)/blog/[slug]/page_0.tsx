"use client";

import { useEffect, useState } from "react";
import { BlogSchema,IBlog} from "@/lib/types"; // Ensure this path is correct
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils"; // Assuming you have this utility
import Markdown from "react-markdown";
import { useRouter, useParams } from "next/navigation";
import { Suspense } from 'react';
import ClientBlogDetail from './client-page';

type Blog = z.infer<typeof BlogSchema>;

export default function BlogDetailPage() {
  return (
    <Suspense fallback={
      <div className="container py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
        
        <Skeleton className="h-[400px] w-full rounded-lg" />
        
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    }>
      <ClientBlogDetail />
    </Suspense>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${params.slug}`);
    if (!res.ok) return { title: 'Blog Post Not Found' };
    
    const blog = await res.json();
    return {
      title: blog.seo?.metaTitle || blog.title,
      description: blog.seo?.metaDescription || blog.excerpt,
      openGraph: {
        title: blog.seo?.openGraph?.title || blog.title,
        description: blog.seo?.openGraph?.description || blog.excerpt,
        images: blog.featuredImage ? [{ url: blog.featuredImage }] : [],
      },
    };
  } catch (error) {
    return { title: 'Blog' };
  }
}
