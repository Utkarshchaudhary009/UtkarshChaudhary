import { Suspense } from 'react';
import ClientProjectDetail from './client-page';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectPage() {
  return (
    <Suspense fallback={
      <div className="container py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
        
        <Skeleton className="h-[400px] w-full rounded-lg" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-32 mb-4" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            </div>
            
            <div>
              <Skeleton className="h-8 w-32 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ClientProjectDetail />
    </Suspense>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  // You can fetch metadata from API if needed
  // This could also be done in the client component, but for SEO it's better server-side
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${params.slug}`);
    if (!res.ok) return { title: 'Project Not Found' };
    
    const project = await res.json();
    return {
      title: project.seo?.metaTitle || project.title,
      description: project.seo?.metaDescription || project.excerpt,
      openGraph: {
        title: project.seo?.metaTitle || project.title,
        description: project.seo?.metaDescription || project.excerpt,
        images: project.featuredImage ? [{ url: project.featuredImage }] : [],
      },
    };
  } catch (error) {
    return { title: 'Project' };
  }
} 