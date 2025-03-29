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

export default function HomePage() {
  // Using TanStack Query for all data fetching
  const { data: personalDetails, isLoading: isLoadingDetails } =
    usePersonalDetails();

  const { data: featuredProjectsData, isLoading: isLoadingProjects } =
    useFeaturedProjects();

  const { data: featuredBlogsData, isLoading: isLoadingBlogs } =
    useFeaturedBlogs();

  const featuredProjects = featuredProjectsData?.projects || [];
  const featuredBlogs = featuredBlogsData || [];

  return (
    <main className='container mx-auto py-12 px-4 space-y-16'>
      {/* Hero Section */}
      <section className='flex flex-col lg:flex-row items-center justify-between gap-8'>
        <div className='flex-1 space-y-6'>
          {isLoadingDetails ? (
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
                Hi, I'm {personalDetails?.name || "Your Name"}
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
          {isLoadingDetails ? (
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
                className='object-cover'
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
              <Card
                key={project._id}
                className='overflow-hidden flex flex-col'
              >
                <div className='relative'>
                  <AspectRatio ratio={16 / 9}>
                    <Image
                      src={project.image || "/placeholder-project.jpg"}
                      alt={project.title}
                      fill
                      className='object-cover'
                    />
                  </AspectRatio>
                  <Badge className='absolute top-2 right-2 bg-primary'>
                    Featured
                  </Badge>
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
            {featuredBlogs.map((blog) => (
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
                      className='object-cover'
                    />
                  </AspectRatio>
                  <Badge className='absolute top-2 right-2 bg-primary'>
                    Featured
                  </Badge>
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
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
