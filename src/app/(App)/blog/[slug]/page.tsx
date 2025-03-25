'use client';

import { useParams } from 'next/navigation';
import { useBlog } from '@/lib/api/services/blogService';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';

export default function ClientBlogDetail() {
  const { slug } = useParams();
  const { data: blogs, isLoading, error } = useBlog(slug as string);
  const blog = blogs ? blogs[0] : null;
  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
        
        <AspectRatio ratio={16/9} className="overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </AspectRatio>
        
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">
          Failed to load blog post. Please try again later.
        </p>
        <Button asChild className="mt-4">
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">{blog.title}</h1>
          {blog.publishedAt && (
          <p className="text-muted-foreground">
            Published on {new Date(blog.publishedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            </p>
          )}
      </div>
      
          {blog.featuredImage && (
        <AspectRatio ratio={16/9} className="overflow-hidden rounded-lg">
          <Image 
              src={blog.featuredImage}
              alt={blog.title}
            fill 
            className="object-cover"
            />
        </AspectRatio>
          )}
      
      <div className="prose max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>
      
      <Button variant="outline" asChild>
        <Link href="/blog">Back to Blog</Link>
      </Button>
    </div>
  );
}