"use client";

import { useParams } from "next/navigation";
import { useProject } from "@/lib/api/services/projectService";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GithubIcon, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { SocialShareList } from "@/components/ui/social-share";

export default function ClientProjectDetail() {
  const { slug } = useParams();
  // Use TanStack Query to fetch the project
  const { data, isLoading, error } = useProject(slug as string);
  const project = data?.projects?.[0] || null;

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
          <Skeleton className='h-3/5 w-3/5' />
        </AspectRatio>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='md:col-span-2 space-y-6'>
            <Skeleton className='h-8 w-48' />
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className='h-4 w-full'
                />
              ))}
            </div>
          </div>

          <div className='space-y-6'>
            <div>
              <Skeleton className='h-8 w-32 mb-4' />
              <div className='flex flex-wrap gap-2'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className='h-8 w-20'
                  />
                ))}
              </div>
            </div>

            <div>
              <Skeleton className='h-8 w-32 mb-4' />
              <Skeleton className='h-10 w-full mb-2' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container py-8'>
        <h1 className='text-2xl font-bold mb-4'>Error</h1>
        <p className='text-red-500'>
          Failed to load project. Please try again later.
        </p>
        <Button
          asChild
          className='mt-4'
        >
          <Link
            href='/projects'
            aria-label='Back to Projects'
          >
            Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='container py-8 space-y-8'>
      <div className='space-y-4'>
        <h1 className='text-4xl font-bold'>{project?.title}</h1>

        <SocialShareList
          url={`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${project?.slug}`}
          title={project?.title || ""}
          className='right-1 my-2 md:my-0'
          description={project?.excerpt || ""}
          media={project?.featuredImage || ""}
        />
        <p className='text-xl text-muted-foreground'>{project?.excerpt}</p>
      </div>

      {project?.featuredImage && (
        <AspectRatio
          ratio={16 / 9}
          className='overflow-hidden rounded-lg'
        >
          <Image
            src={project.featuredImage}
            alt={project.title || "Project"}
            fill
            className='object-cover h-3/5 w-3/5'
          />
        </AspectRatio>
      )}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='md:col-span-2 space-y-6'>
          <h2 className='text-2xl font-semibold'>Project Details</h2>
          <div className='prose max-w-none dark:prose-invert'>
            {project?.content && <MarkdownRenderer content={project.content} />}
          </div>
        </div>

        <div className='space-y-6'>
          <div>
            <h3 className='text-xl font-semibold mb-4'>Technologies</h3>
            <div className='flex flex-wrap gap-2'>
              {project?.technologies?.map((tech: string) => (
                <Badge
                  key={tech}
                  variant='secondary'
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className='text-xl font-semibold mb-4'>Links</h3>
            {project?.githubUrl && (
              <Button
                variant='outline'
                className='w-full mb-2'
                asChild
              >
                <Link
                  href={project.githubUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <GithubIcon className='mr-2 h-4 w-4' />
                  GitHub Repository
                </Link>
              </Button>
            )}
            {project?.liveUrl && (
              <Button
                className='w-full'
                asChild
              >
                <Link
                  href={project.liveUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Globe className='mr-2 h-4 w-4' />
                  Live Demo
                </Link>
              </Button>
            )}
          </div>

          <div>
            <h3 className='text-xl font-semibold mb-2'>Status</h3>
            <Badge
              variant={
                project?.status === "completed"
                  ? "default"
                  : project?.status === "in-progress"
                  ? "secondary"
                  : "outline"
              }
            >
              {project?.status}
            </Badge>
          </div>
        </div>
      </div>

      <Button
        variant='outline'
        asChild
      >
        <Link
          href='/projects'
          aria-label='Back to Projects'
        >
          Back to Projects
        </Link>
      </Button>
    </div>
  );
}
