"use client";

import { useParams } from "next/navigation";
import { useBlog } from "@/lib/api/services/blogService";
import { useRandomAd } from "@/lib/api/services/adService";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdBanner } from "@/components/ads/AdBanner";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// const AD_DISPLAY_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
const AD_DISPLAY_INTERVAL = 2 * 1000; // 2 seconds in milliseconds

export default function ClientBlogDetail() {
  const { slug } = useParams();
  const { data: blog, isLoading, error } = useBlog(slug as string);
  const [shouldFetchAd, setShouldFetchAd] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const { data: ad, isSuccess: adFetched } = useRandomAd(
    shouldFetchAd ? true : false
  );

  useEffect(() => {
    const checkAdDisplay = () => {
      if (!blog) return;

      const lastAdTime = localStorage.getItem("lastAdTime");
      const currentTime = Date.now();

      if (
        !lastAdTime ||
        currentTime - parseInt(lastAdTime) > AD_DISPLAY_INTERVAL
      ) {
        setShouldFetchAd(true);
      }
    };

    if (blog && !isLoading) {
      const timer = setTimeout(() => {
        checkAdDisplay();
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [blog, isLoading]);

  // Once ad is fetched, show it and update localStorage
  useEffect(() => {
    if (adFetched && ad) {
      setShowAd(true);
      localStorage.setItem("lastAdTime", Date.now().toString());
    }
  }, [adFetched, ad]);

  const handleAdClose = () => {
    setShowAd(false);
  };

  if (isLoading) {
    return (
      <div className='container py-8 space-y-8'>
        <div className='space-y-4'>
          <Skeleton className='h-12 w-3/4' />
          <Skeleton className='h-6 w-full max-w-2xl' />
        </div>

        <AspectRatio
          ratio={16 / 9}
          className='overflow-hidden rounded-lg'
        >
          <Skeleton className='h-full w-full' />
        </AspectRatio>

        <div className='space-y-6'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className='h-4 w-full'
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container py-8'>
        <h1 className='text-2xl font-bold mb-4'>Error</h1>
        <p className='text-red-500'>
          Failed to load blog post. Please try again later.
        </p>
        <Button
          asChild
          className='mt-4'
        >
          <Link href='/blog'>Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className='container py-8 space-y-8 max-w-4xl mx-auto'>
        <div className='space-y-4'>
          <h1 className='text-4xl font-bold'>{blog.title}</h1>
          {blog.publishedAt && (
            <p className='text-muted-foreground'>
              Published on{" "}
              {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>

        {blog.featuredImage && (
          <AspectRatio
            ratio={16 / 9}
            className='overflow-hidden rounded-lg'
          >
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              fill
              className='object-cover'
            />
          </AspectRatio>
        )}

        <div className='prose max-w-none dark:prose-invert'>
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        <Button
          variant='outline'
          asChild
        >
          <Link href='/blog'>Back to Blog</Link>
        </Button>
      </div>

      {/* Ad Banner */}
      {showAd && ad && (
        <AdBanner
          ad={ad}
          onClose={handleAdClose}
        />
      )}
    </>
  );
}
