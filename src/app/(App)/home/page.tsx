"use client";
import { usePersonalDetails } from "@/lib/api/services/meService";
import { useFeaturedProjects } from "@/lib/api/services/projectService";
import { useFeaturedBlogs } from "@/lib/api/services/blogService";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { IBlog } from "@/lib/types";
import { memo, useMemo } from "react";

// Memoized components to reduce re-renders
const HeroSection = memo(({ personalDetails, isLoading }: any) => {
  return (
    <section className='flex flex-col lg:flex-row items-center justify-between gap-8'>
      <div className='flex-1 space-y-6'>
        {isLoading ? (
          <>
            <Skeleton className='h-12 w-3/4' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-5/6' />
            <Skeleton className='h-4 w-4/6' />
            <Skeleton className='h-10 w-40' />
          </>
        ) : (
          <>
            <h1 className='text-4xl md:text-5xl font-bold'>
              Hi, I&apos;m {personalDetails?.name || "Your Name"}
            </h1>
            <p className='text-xl text-muted-foreground'>
              {personalDetails?.title || "Your Profession"}
            </p>
            <p className='text-lg'>
              {personalDetails?.bio || "Your short bio..."}
            </p>
            <div className='flex flex-wrap gap-3'>
              <Button asChild>
                <Link href='/projects'>View Projects</Link>
              </Button>
              <Button
                variant='outline'
                asChild
              >
                <Link href='/contact'>Contact Me</Link>
              </Button>
            </div>
          </>
        )}
      </div>
      <div className='flex-1 max-w-md'>
        {isLoading ? (
          <Skeleton className='w-full aspect-square rounded-xl' />
        ) : personalDetails?.profileImage ? (
          <AspectRatio
            ratio={1}
            className='bg-muted rounded-xl overflow-hidden'
          >
            <Image
              src={personalDetails.profileImage}
              alt={personalDetails?.name || "Profile"}
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              className='object-cover'
              priority
              fetchPriority='high'
              placeholder='blur'
              blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAI8V9sxCgAAAABJRU5ErkJggg=='
            />
          </AspectRatio>
        ) : (
          <AspectRatio
            ratio={1}
            className='bg-muted rounded-xl flex items-center justify-center'
          >
            <span className='text-muted-foreground'>No image available</span>
          </AspectRatio>
        )}
      </div>
    </section>
  );
});

// Memoized project card to prevent unnecessary re-renders
const ProjectCard = memo(({ project }: { project: any }) => {
  return (
    <Card
      key={project._id}
      className='overflow-hidden flex flex-col'
    >
      <div className='relative'>
        <AspectRatio ratio={16 / 9}>
          <Image
            src={project.featuredImage || "/placeholder-project.jpg"}
            alt={project.title}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            className='object-cover'
            loading='lazy'
            placeholder='blur'
            blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAI8V9sxCgAAAABJRU5ErkJggg=='
          />
        </AspectRatio>
        <Badge className='absolute top-2 right-2 bg-primary'>Featured</Badge>
      </div>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='line-clamp-2'>{project.description}</p>
      </CardContent>
      <CardFooter className='mt-auto'>
        <Button asChild>
          <Link href={`/projects/${project.slug}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
});

// Memoized blog card component
const BlogCard = memo(({ blog }: { blog: IBlog }) => {
  return (
    <Card
      key={blog._id || blog.slug}
      className='overflow-hidden flex flex-col'
    >
      <div className='relative'>
        <AspectRatio ratio={16 / 9}>
          <Image
            src={blog.featuredImage || "/placeholder-blog.jpg"}
            alt={blog.title}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            className='object-cover'
            loading='lazy'
            placeholder='blur'
            blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAI8V9sxCgAAAABJRU5ErkJggg=='
          />
        </AspectRatio>
        <Badge className='absolute top-2 right-2 bg-primary'>Featured</Badge>
      </div>
      <CardHeader>
        <CardTitle>{blog.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='line-clamp-2'>{blog.excerpt}</p>
        {blog.publishedAt && (
          <p className='text-sm text-muted-foreground mt-2'>
            {new Date(blog.publishedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
      <CardFooter className='mt-auto'>
        <Button asChild>
          <Link href={`/blog/${blog.slug}`}>Read More</Link>
        </Button>
      </CardFooter>
    </Card>
  );
});

// Ensure names are set for React DevTools
HeroSection.displayName = "HeroSection";
ProjectCard.displayName = "ProjectCard";
BlogCard.displayName = "BlogCard";

function HomePage() {
  // Using TanStack Query for all data fetching - hooks already have caching configured internally
  const { data: personalDetails, isLoading: isLoadingDetails } =
    usePersonalDetails();

  const { data: featuredProjectsData, isLoading: isLoadingProjects } =
    useFeaturedProjects();

  const { data: featuredBlogsData, isLoading: isLoadingBlogs } =
    useFeaturedBlogs();

  // Memoize data derivation to avoid recalculations on re-renders
  const featuredProjects = useMemo(
    () => featuredProjectsData?.projects || [],
    [featuredProjectsData]
  );

  // Handle both array and object formats for blogs
  const featuredBlogs = useMemo(
    () =>
      Array.isArray(featuredBlogsData)
        ? featuredBlogsData
        : featuredBlogsData || [],
    [featuredBlogsData]
  );

  return (
    <main className='container mx-auto py-12 px-4 space-y-16'>
      {/* Hero Section - Now Memoized */}
      <HeroSection
        personalDetails={personalDetails}
        isLoading={isLoadingDetails}
      />

      {/* Featured Projects Section */}
      <section className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-3xl font-bold'>Featured Projects</h2>
          <Button
            variant='outline'
            asChild
          >
            <Link href='/projects'>View All</Link>
          </Button>
        </div>

        {isLoadingProjects ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className='h-[320px]'
              >
                <Skeleton className='h-full w-full rounded-lg' />
              </Card>
            ))}
          </div>
        ) : featuredProjects.length === 0 ? (
          <Card className='p-6 text-center'>
            <p className='text-muted-foreground'>
              No featured projects available
            </p>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured Blogs Section */}
      <section className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-3xl font-bold'>Featured Blog Posts</h2>
          <Button
            variant='outline'
            asChild
          >
            <Link href='/blog'>View All</Link>
          </Button>
        </div>

        {isLoadingBlogs ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className='h-[360px]'
              >
                <Skeleton className='h-full w-full rounded-lg' />
              </Card>
            ))}
          </div>
        ) : featuredBlogs.length === 0 ? (
          <Card className='p-6 text-center'>
            <p className='text-muted-foreground'>
              No featured blog posts available
            </p>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {featuredBlogs.map((blog: IBlog) => (
              <BlogCard
                key={blog._id || blog.slug}
                blog={blog}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

// Export with memo to prevent unnecessary rerenders
export default memo(HomePage);
