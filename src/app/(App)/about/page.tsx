'use client';

import { useEffect, useState } from 'react';
import { personalDetailsSchema, jobSchema, storySchema, socialLinkSchema } from '@/lib/validations'; // Assuming your schema is in this file
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link'; // Or your preferred Link component

// Define the type for the data we'll fetch
type PersonalDetails = z.infer<typeof personalDetailsSchema>;

export default function UserPage() {
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/me'); // Replace with your actual API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // You might want to validate the data here against your schema if needed
        setPersonalDetails(data as PersonalDetails);
        setLoading(false);
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchData();
  },);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!personalDetails) {
    return <div>No data available.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{personalDetails.name}</CardTitle>
          <p className="text-muted-foreground">Age: {personalDetails.age}</p>
          <p className="text-muted-foreground">Location: {personalDetails.location}</p>
          <p className="mt-2">{personalDetails.bio}</p>
          <p className="text-muted-foreground">Email: {personalDetails.email}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Work Experience</h3>
            {personalDetails.work.length > 0 ? (
              <ul className="list-disc pl-5">
                {personalDetails.work.map((job) => (
                  <li key={`${job.company}-${job.title}`}>
                    <div className="font-semibold">{job.title}</div>
                    <div className="text-muted-foreground">{job.company} ({job.period})</div>
                    {job.description && <div className="text-sm mt-1">{job.description}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No work experience added.</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Stories</h3>
            {personalDetails.stories.length > 0 ? (
              <div className="space-y-4">
                {personalDetails.stories.map((story) => (
                  <Card key={story.heading}>
                    <CardHeader>
                      <CardTitle>{story.heading}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{story.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No stories added.</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Social Links</h3>
            {personalDetails.socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {personalDetails.socialLinks.map((link) => (
                  <Badge key={link.url}>
                    <Link href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.name} ({link.platform})
                    </Link>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No social links added.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}