"use client";

import { useEffect, useState } from "react";
import { personalDetailsSchema } from "@/lib/types"; // Assuming your schema is in this file
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link"; // Or your preferred Link component
import { Skeleton } from "@/components/ui/skeleton";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import {
  Link as LucideLinkIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Linkedin as LinkedinIcon,
  Github as GithubIcon,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const getSocialIcon = (platform: string) => {
  const lowercasePlatform = platform.toLowerCase();

  if (
    lowercasePlatform === "facebook" ||
    lowercasePlatform === "meta" ||
    lowercasePlatform === "fb"
  ) {
    return <FacebookIcon className='h-4 w-4' />;
  } else if (
    lowercasePlatform === "twitter" ||
    lowercasePlatform === "x" ||
    lowercasePlatform === "tw"
  ) {
    return <TwitterIcon className='h-4 w-4' />;
  } else if (
    lowercasePlatform === "instagram" ||
    lowercasePlatform === "insta"
  ) {
    return <InstagramIcon className='h-4 w-4' />;
  } else if (lowercasePlatform === "linkedin" || lowercasePlatform === "in") {
    return <LinkedinIcon className='h-4 w-4' />;
  } else if (lowercasePlatform === "github" || lowercasePlatform === "gh") {
    return <GithubIcon className='h-4 w-4' />;
  } else {
    return <LucideLinkIcon className='h-4 w-4' />;
  }
};
// Define the type for the data we'll fetch
type PersonalDetails = z.infer<typeof personalDetailsSchema>;

export default function AboutClient() {
  const [personalDetails, setPersonalDetails] =
    useState<PersonalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/me", {
          cache: "force-cache",
          next: {
            revalidate: 3600,
          },
        }); // Replace with your actual API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // You might want to validate the data here against your schema if needed
        setPersonalDetails(data as PersonalDetails);
        setLoading(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='container mx-auto py-10'>
        <Card>
          <CardHeader>
            <Skeleton className='h-8 w-3/4 mb-2' />
            <Skeleton className='h-4 w-1/4 mb-1' />
            <Skeleton className='h-4 w-1/3 mb-1' />
            <Skeleton className='h-16 w-full mt-2 mb-1' />
            <Skeleton className='h-4 w-1/2' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Skeleton className='h-10 w-40' />
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-2'>Work Experience</h3>
              <div className='space-y-3'>
                <div>
                  <Skeleton className='h-5 w-1/3 mb-1' />
                  <Skeleton className='h-4 w-1/2 mb-1' />
                  <Skeleton className='h-10 w-full' />
                </div>
                <div>
                  <Skeleton className='h-5 w-1/3 mb-1' />
                  <Skeleton className='h-4 w-1/2 mb-1' />
                  <Skeleton className='h-10 w-full' />
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-2'>Stories</h3>
              <div className='space-y-3'>
                <Card>
                  <CardHeader>
                    <Skeleton className='h-5 w-1/2' />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className='h-20 w-full' />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className='h-5 w-1/2' />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className='h-20 w-full' />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-2'>Social Links</h3>
              <div className='flex flex-wrap gap-2'>
                <Skeleton className='h-8 w-24 rounded-full' />
                <Skeleton className='h-8 w-32 rounded-full' />
                <Skeleton className='h-8 w-28 rounded-full' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!personalDetails) {
    return <div>No data available.</div>;
  }

  return (
    <div className='container mx-auto py-10'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>
            {personalDetails.name}
          </CardTitle>
          <p className='text-muted-foreground'>Age: {personalDetails.age}</p>
          <p className='text-muted-foreground'>
            Location: {personalDetails.location}
          </p>
          <p className='mt-2'>{personalDetails.bio}</p>
          <p className='text-muted-foreground'>
            Email: {personalDetails.email}
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          {personalDetails.resumePdf && (
            <div className='border rounded-lg p-4 bg-muted/20'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-5 w-5 text-primary' />
                  <span className='font-medium'>Resume</span>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    asChild
                  >
                    <a
                      href={personalDetails.resumePdf}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-1'
                    >
                      <ExternalLink className='h-4 w-4' />
                      View
                    </a>
                  </Button>
                  <Button
                    variant='default'
                    size='sm'
                    asChild
                  >
                    <a
                      href={personalDetails.resumePdf}
                      download='resume.pdf'
                      className='flex items-center gap-1'
                    >
                      <Download className='h-4 w-4' />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className='text-lg font-semibold mb-2'>Social Links</h3>
            {personalDetails.socialLinks.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {personalDetails.socialLinks.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors'
                  >
                    {getSocialIcon(link.platform)} {link.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground'>No social links added.</p>
            )}
          </div>
          <div>
            <h3 className='text-lg font-semibold mb-2'>Work Experience</h3>
            {personalDetails.work.length > 0 ? (
              <ul className='list-disc pl-5'>
                {personalDetails.work.map((job) => (
                  <li key={`${job.company}-${job.title}`}>
                    <div className='font-semibold'>{job.title}</div>
                    <div className='text-muted-foreground'>
                      {job.company} ({job.period})
                    </div>
                    {job.description && (
                      <div className='text-sm mt-1'>{job.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-2'>Stories</h3>
            {personalDetails.stories.length > 0 ? (
              <div className='space-y-4'>
                {personalDetails.stories.map((story) => (
                  <Card key={story.heading}>
                    <CardHeader>
                      <CardTitle>{story.heading}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MarkdownRenderer content={story.content} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground'>No stories added.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
