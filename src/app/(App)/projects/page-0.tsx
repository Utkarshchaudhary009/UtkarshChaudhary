import { Suspense } from 'react';
import ClientProjects from './client-page';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <main className="container py-24 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[400px] w-full rounded-lg" />
          ))}
        </div>
      </main>
    }>
      <ClientProjects />
    </Suspense>
  );
}