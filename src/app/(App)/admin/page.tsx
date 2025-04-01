"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserCog,
  FileText,
  MailPlus,
  Globe,
  Layers,
  Inbox,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  const adminSections = [
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      icon: <UserCog className='h-8 w-8' />,
      href: "/admin/users",
    },
    {
      title: "Projects",
      description: "Manage your projects and showcase",
      icon: <Layers className='h-8 w-8' />,
      href: "/admin/projects",
    },
    {
      title: "Blog",
      description: "Manage your blog posts and articles",
      icon: <FileText className='h-8 w-8' />,
      href: "/admin/blog",
    },
    {
      title: "Inbox",
      description: "View and respond to contact messages",
      icon: <Inbox className='h-8 w-8' />,
      href: "/admin/inbox",
    },
    {
      title: "Marketing",
      description: "Manage marketing emails and campaigns",
      icon: <MailPlus className='h-8 w-8' />,
      href: "/admin/marketing",
    },
    {
      title: "SEO",
      description: "Manage site SEO settings and metadata",
      icon: <Globe className='h-8 w-8' />,
      href: "/admin/seo",
    },
  ];

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold tracking-tight'>Admin Dashboard</h1>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {adminSections.map((section) => (
          <Card
            key={section.title}
            className='overflow-hidden'
          >
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle>{section.title}</CardTitle>
                {section.icon}
              </div>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant='default'
                className='w-full'
                onClick={() => router.push(section.href)}
              >
                Manage
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
