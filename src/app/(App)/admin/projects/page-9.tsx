'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DotsHorizontalIcon, PlusIcon, RocketIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { IProject } from '@/lib/types';
import ProjectForm from '@/components/ProjectForm';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useProjects, 
  useDeleteProject, 
  useEnhanceProjectWithAI 
} from '@/lib/api/services/projectService';

export default function AdminProjectsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    technology: 'all',
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch projects with TanStack Query using our custom hook
  const { data, isLoading, error } = useProjects(filters);

  // Use our custom mutation hooks
  const deleteMutation = useDeleteProject();
  const aiEnhanceMutation = useEnhanceProjectWithAI();

  // Extract unique categories and technologies for filters
  const categories = [...new Set((data?.projects || []).map((p: IProject) => p.category).filter(Boolean))] as string[];
  const technologies = [...new Set((data?.projects || []).flatMap((p: IProject) => p.technologies || []).filter(Boolean))] as string[];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (project: IProject) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleEnhanceWithAI = (project: IProject) => {
    aiEnhanceMutation.mutate(project, {
      onSuccess: (enhancedData) => {
        setSelectedProject({
          ...selectedProject!,
          title: enhancedData.title,
          description: enhancedData.description,
          content: enhancedData.content,
        });
        toast.success('Project enhanced with AI successfully');
      },
      onError: (error) => {
        toast.error('Failed to enhance project with AI');
        console.error('AI Enhancement error:', error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Project deleted successfully');
        },
        onError: (error) => {
          toast.error('Failed to delete project');
          console.error('Delete error:', error);
        }
      });
    }
  };

  if (error) {
    return (
      <Card className="m-4">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error loading projects. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the project details below. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm 
              open={isCreateDialogOpen} 
              onOpenChange={setIsCreateDialogOpen} 
              onClose={() => setIsCreateDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            initialData={selectedProject || undefined}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedProject(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Technology</Label>
            <Select
              value={filters.technology}
              onValueChange={(value) => handleFilterChange('technology', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select technology" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {technologies.map((tech) => (
                  <SelectItem key={tech} value={tech}>
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Technologies</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-6 w-[250px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Skeleton className="h-6 w-[80px]" />
                          <Skeleton className="h-6 w-[80px]" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : data?.projects?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                data?.projects?.map((project: IProject) => (
                  <TableRow key={project._id || project.slug}>
                    <TableCell className="font-medium">{project.title}{project.featured && (
          <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">Featured</Badge>
        )}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          project.status === 'completed'
                            ? 'default'
                            : project.status === 'in-progress'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies?.map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(project)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEnhanceWithAI(project)}
                            disabled={aiEnhanceMutation.isPending}
                          >
                            <RocketIcon className="mr-2 h-4 w-4" />
                            Enhance with AI
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(project._id || '')}
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