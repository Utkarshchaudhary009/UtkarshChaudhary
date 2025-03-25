"use client";

import { useState } from "react";
import {
  useProjects,
  useDeleteProject,
  useUpdateProject,
} from "@/lib/api/services/projectService";
import { IProject } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DotsHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import ProjectForm from "@/components/ProjectForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminProjectsPage() {
  // State declarations - all grouped together
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    technology: "all",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Query hooks
  const { data, isLoading, error } = useProjects(filters);
  const deleteMutation = useDeleteProject();
  const updateMutation = useUpdateProject();

  // Extract unique categories and technologies before any conditionals
  const categories = [
    ...new Set(
      (data?.projects || []).map((p: IProject) => p.category).filter(Boolean)
    ),
  ] as string[];

  const technologies = [
    ...new Set(
      (data?.projects || [])
        .flatMap((p: IProject) => p.technologies || [])
        .filter(Boolean)
    ),
  ] as string[];

  // Event handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedProject(null);
  };

  const handleEdit = (project: IProject) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Project deleted successfully");
        },
        onError: (error) => {
          toast.error("Failed to delete project");
          console.error("Delete error:", error);
        },
      });
    }
  };

  const toggleFeatured = (project: IProject) => {
    if (project._id) {
      updateMutation.mutate(
        {
          id: project._id,
          data: { featured: !project.featured },
        },
        {
          onSuccess: () => {
            toast.success(
              `Project ${
                project.featured ? "removed from" : "marked as"
              } featured`
            );
          },
          onError: (error) => {
            toast.error("Failed to update featured status");
            console.error("Update error:", error);
          },
        }
      );
    }
  };

  if (error) {
    return (
      <Card className='m-4'>
        <CardContent className='p-6'>
          <div className='text-center text-red-500'>
            Error loading projects. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='p-4 space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Projects</h1>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        >
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className='mr-2 h-4 w-4' />
            New Project
          </Button>
          <DialogContent className='sm:max-w-[625px]'>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the project details below.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onClose={handleCreateDialogClose}
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
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details below.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            initialData={selectedProject || undefined}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onClose={handleEditDialogClose}
          />
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Filters</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='space-y-2'>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='in-progress'>In Progress</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='planned'>Planned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Technology</Label>
            <Select
              value={filters.technology}
              onValueChange={(value) => handleFilterChange("technology", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select technology' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                {technologies.map((tech) => (
                  <SelectItem
                    key={tech}
                    value={tech}
                  >
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
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
                        <Skeleton className='h-6 w-[300px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-6 w-[100px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-8 w-8' />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : data?.projects?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='text-center'
                  >
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                data?.projects?.map((project: IProject) => (
                  <TableRow key={project._id}>
                    <TableCell className='font-medium'>
                      {project.title}
                      {project.featured && (
                        <Badge className='ml-2 bg-amber-500 hover:bg-amber-600'>
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='truncate max-w-[300px]'>
                      {project.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          project.status === "completed"
                            ? "default"
                            : project.status === "in-progress"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {project.status}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => handleEdit(project)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleFeatured(project)}
                          >
                            {project.featured
                              ? "Remove from Featured"
                              : "Mark as Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() => handleDelete(project._id || "")}
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
