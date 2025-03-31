"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const adminNavItems = [
  { name: "Inbox", path: "/admin/inbox" },
  { name: "Blog", path: "/admin/blog" },
  { name: "Projects", path: "/admin/projects" },
  { name: "About Me", path: "/admin/me" },
  { name: "Ad's", path: "/admin/ads" },
  { name: "Marketing Mails", path: "/admin/marketing" },
  { name: "SEO", path: "/admin/seo" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className='min-h-screen flex flex-col'>
        {/* Hero Section */}
        <section className='bg-secondary/20 py-12'>
          <div className='container flex items-center justify-between'>
            <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
          </div>
        </section>

        {/* Admin Navigation Bar */}
        <nav className='bg-muted py-2 md:py-4'>
          <div className='container flex flex-wrap gap-1 md:gap-2'>
            {adminNavItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
              >
                <Button variant='ghost'>{item.name}</Button>
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className='flex-1 container py-8'>{children}</main>
      </div>
    </>
  );
}
