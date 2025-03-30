'use client';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { IProject } from "@/lib/types";
import { useProjects } from "@/lib/api/services/projectService";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:"Projects",
  description: "Check out my projects  and share your feedback through contact page",
  openGraph: {
    images: [
      {
        url: "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};
export default function ClientProjects() {
  // Use TanStack Query to fetch projects
  const { data, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <main className="container py-24 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <AspectRatio ratio={16/9}>
                  <Skeleton className="h-full w-full" />
                </AspectRatio>
                <div className="p-6">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Skeleton className="h-10 w-32" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-24 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-4xl font-bold">My Projects</h1>
          <p className="text-xl text-red-500">
            Error loading projects. Please try again later.
          </p>
        </div>
      </main>
    );
  }

  const projects = data?.projects || [];

  return (
    <main className="container py-24 space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-4xl font-bold">My Projects</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A collection of projects I{"'"}ve worked on, from web applications to AI experiments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: IProject) => (
          <Card key={project.slug} className="overflow-hidden">
            <CardContent className="p-0">
              <AspectRatio ratio={16/9}>
                <Image
                  src={project.featuredImage || '/vercel.svg'}
                  alt={project.title}
                  fill
                  className="object-cover transition-all hover:scale-105"
                />
              </AspectRatio>
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{project.title}</h2>
                <p className="text-muted-foreground mb-4">{project.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies?.map((tech: string) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button asChild>
                <Link href={`/projects/${project.slug}`}>View Project</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}