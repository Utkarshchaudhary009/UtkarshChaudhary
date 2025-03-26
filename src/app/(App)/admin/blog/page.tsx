"use client";

import { useState } from "react";
import {
  useBlogs,
  useDeleteBlog,
  useCreateBlog,
  useUpdateBlog,
} from "@/lib/api/services/blogService";
import { IBlog } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import BlogForm from "@/components/BlogForm"; // Adjust if your component has a different name
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBlogPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<IBlog | null>(null);
  const [aiData, setAiData] = useState<IBlog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch blogs with TanStack Query
  const { data, isLoading, error } = useBlogs({});
  const blogs = data;

  // Use our custom mutation hooks
  const deleteMutation = useDeleteBlog();
  const updateMutation = useUpdateBlog();

  const handleEdit = (blog: IBlog) => {
    setSelectedBlog(blog);
    setIsEditDialogOpen(true);
  };
  const aiCreation = (blog: IBlog) => {
    setAiData(blog);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Blog post deleted successfully");
        },
        onError: (error) => {
          toast.error("Failed to delete blog post");
          console.error("Delete error:", error);
        },
      });
    }
  };

  const handlePublishToggle = (blog: IBlog) => {
    updateMutation.mutate(
      {
        id: blog._id || "",
        data: {
          isPublished: !blog.isPublished,
          publishedAt: !blog.isPublished ? new Date() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `Blog ${
              blog.isPublished ? "unpublished" : "published"
            } successfully`
          );
        },
        onError: (error) => {
          toast.error(
            `Failed to ${blog.isPublished ? "unpublish" : "publish"} blog`
          );
        },
      }
    );
  };

  const toggleFeatured = (blog: IBlog) => {
    updateMutation.mutate(
      {
        id: blog._id || "",
        data: { featured: !blog.featured },
      },
      {
        onSuccess: () => {
          toast.success(
            `Blog ${blog.featured ? "removed from" : "marked as"} featured`
          );
        },
        onError: (error) => {
          toast.error("Failed to update featured status");
        },
      }
    );
  };

  if (error) {
    return (
      <Card className='m-4'>
        <CardContent className='p-6'>
          <div className='text-center text-red-500'>
            Error loading blogs. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='p-4 space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Blog Posts</h1>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className='mr-2 h-4 w-4' />
              New Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[625px]'>
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
              <DialogDescription>
                Fill in the blog details below.
              </DialogDescription>
            </DialogHeader>
            <BlogForm
              initialData={aiData}
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className='sm:max-w-[625px]'>
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update the blog details below.
            </DialogDescription>
          </DialogHeader>
          <BlogForm
            initialData={selectedBlog || undefined}
            onOpenChange={setIsEditDialogOpen}
            open={isEditDialogOpen}
          />
        </DialogContent>
      </Dialog>

      {/* Blogs Table */}
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className='h-6 w-[250px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-6 w-[100px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-6 w-[150px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-8 w-8' />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : blogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='text-center'
                  >
                    No blog posts found
                  </TableCell>
                </TableRow>
              ) : (
                blogs.map((blog: IBlog) => (
                  <TableRow key={blog._id || blog.slug}>
                    <TableCell className='font-medium'>
                      {blog.title}
                      {blog.featured && (
                        <Badge className='ml-2 bg-amber-500 hover:bg-amber-600'>
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={blog.isPublished ? "default" : "outline"}>
                        {blog.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString()
                        : "Not published"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            className='h-8 w-8 p-0'
                          >
                            <DotsHorizontalIcon className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(blog)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePublishToggle(blog)}
                          >
                            {blog.isPublished ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleFeatured(blog)}
                          >
                            {blog.featured
                              ? "Remove from Featured"
                              : "Mark as Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() => handleDelete(blog._id || "")}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
