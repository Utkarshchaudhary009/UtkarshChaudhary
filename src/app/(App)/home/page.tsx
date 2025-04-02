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
import { IBlog, IProject, IPersonalDetails } from "@/lib/types";
import { memo, useMemo, Suspense } from "react";

// Memoized components to reduce re-renders
const HeroSection = memo(
  ({
    personalDetails,
    isLoading,
  }: {
    personalDetails: IPersonalDetails;
    isLoading: boolean;
  }) => {
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
                  <Link
                    href='/projects'
                    aria-label='View Projects'
                  >
                    View Projects
                  </Link>
                </Button>
                <Button
                  variant='outline'
                  asChild
                >
                  <Link
                    href='/contact'
                    aria-label='Contact Me'
                  >
                    Contact Me
                  </Link>
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
                loading='eager'
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
  }
);

// Optimized image component with better loading strategies
const OptimizedImage = memo(
  ({
    src,
    alt,
    aspectRatio = 16 / 9,
    priority = false,
  }: {
    src: string;
    alt: string;
    aspectRatio?: number;
    priority?: boolean;
  }) => {
    // Generate a tiny placeholder for better LCP
    const placeholder =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAI8V9sxCgAAAABJRU5ErkJggg==";

    return (
      <AspectRatio
        ratio={aspectRatio}
        className='bg-muted overflow-hidden'
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          className='object-cover'
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          blurDataURL={placeholder}
          placeholder='blur'
        />
      </AspectRatio>
    );
  }
);

// Memoized project card to prevent unnecessary re-renders
const ProjectCard = memo(({ project }: { project: IProject }) => {
  return (
    <Card
      key={project._id}
      className='overflow-hidden flex flex-col'
    >
      <div className='relative'>
        <OptimizedImage
          src={project.featuredImage || "/placeholder-project.jpg"}
          alt={project.title}
        />
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
          <Link
            href={`/projects/${project.slug}`}
            aria-label={project.title}
          >
            View Details
          </Link>
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
        <OptimizedImage
          src={blog.featuredImage || "/placeholder-blog.jpg"}
          alt={blog.title}
        />
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
          <Link
            href={`/blog/${blog.slug}`}
            aria-label={blog.title}
          >
            Read More
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
});

// Ensure names are set for React DevTools
HeroSection.displayName = "HeroSection";
ProjectCard.displayName = "ProjectCard";
BlogCard.displayName = "BlogCard";
OptimizedImage.displayName = "OptimizedImage";

// ProjectsSection component to enable code-splitting
const ProjectsSection = memo(
  ({
    featuredProjects,
    isLoading,
  }: {
    featuredProjects: IProject[];
    isLoading: boolean;
  }) => {
    if (isLoading) {
      return (
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
      );
    }

    if (featuredProjects.length === 0) {
      return (
        <Card className='p-6 text-center'>
          <p className='text-muted-foreground'>
            No featured projects available
          </p>
        </Card>
      );
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {featuredProjects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
          />
        ))}
      </div>
    );
  }
);

// BlogsSection component to enable code-splitting
const BlogsSection = memo(
  ({
    featuredBlogs,
    isLoading,
  }: {
    featuredBlogs: IBlog[];
    isLoading: boolean;
  }) => {
    if (isLoading) {
      return (
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
      );
    }

    if (featuredBlogs.length === 0) {
      return (
        <Card className='p-6 text-center'>
          <p className='text-muted-foreground'>No featured blogs available</p>
        </Card>
      );
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {featuredBlogs.map((blog) => (
          <BlogCard
            key={blog._id || blog.slug}
            blog={blog}
          />
        ))}
      </div>
    );
  }
);

ProjectsSection.displayName = "ProjectsSection";
BlogsSection.displayName = "BlogsSection";

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
    () => (Array.isArray(featuredBlogsData) ? featuredBlogsData : []),
    [featuredBlogsData]
  );

  return (
    <main className='container mx-auto py-12 px-4 space-y-16'>
      {/* Hero Section - Critical Path Rendering */}
      <HeroSection
        personalDetails={personalDetails as IPersonalDetails}
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
            <Link
              href='/projects'
              aria-label='View All projects'
            >
              View All
            </Link>
          </Button>
        </div>

        <Suspense
          fallback={
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className='h-[320px] w-full rounded-lg'
                />
              ))}
            </div>
          }
        >
          <ProjectsSection
            featuredProjects={featuredProjects}
            isLoading={isLoadingProjects}
          />
        </Suspense>
      </section>

      {/* Featured Blogs Section */}
      <section className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-3xl font-bold'>Featured Blogs</h2>
          <Button
            variant='outline'
            asChild
          >
            <Link
              href='/blog'
              aria-label='View All blogs'
            >
              View All
            </Link>
          </Button>
        </div>

        <Suspense
          fallback={
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className='h-[320px] w-full rounded-lg'
                />
              ))}
            </div>
          }
        >
          <BlogsSection
            featuredBlogs={featuredBlogs}
            isLoading={isLoadingBlogs}
          />
        </Suspense>
      </section>
    </main>
  );
}

export default memo(HomePage);
