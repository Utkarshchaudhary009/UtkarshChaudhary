"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectRequestSchema, IProject } from "@/lib/types";
import {
  useCreateProject,
  useUpdateProject,
} from "@/lib/api/services/projectService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "@/utils/date-fns";
import Image from "next/image";

import {
  CalendarIcon,
  Cross2Icon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProjectFormProps = {
  initialData?: IProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
};

const STORAGE_KEY_PREFIX = "project_form_";

const ProjectForm = ({
  initialData,
  open,
  onOpenChange,
  onClose,
}: ProjectFormProps) => {
  const [techInput, setTechInput] = useState("");
  const [manualEdits, setManualEdits] = useState<Record<string, boolean>>({});

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const isEditMode = !!initialData?._id;
  const storageKey = isEditMode
    ? `${STORAGE_KEY_PREFIX}${initialData._id}`
    : STORAGE_KEY_PREFIX;

  // Form setup with zod resolver - Use type assertion to resolve compatibility issue
  const form = useForm<IProject>({
    resolver: zodResolver(ProjectRequestSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      description: "",
      excerpt: "",
      featuredImage: "",
      gallery: [],
      technologies: [],
      githubUrl: "",
      liveUrl: "",
      category: "",
      status: "planned",
      markdown: true, // Ensure this is set to prevent undefined value
      featured: false,
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: [],
      },
    },
  });

  // Load saved form data from localStorage if available
  useEffect(() => {
    const savedFormData = localStorage.getItem(storageKey);
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        form.reset(parsedData);
      } catch (error) {
        console.error("Failed to parse saved form data", error);
        localStorage.removeItem(storageKey);
      }
    } else if (initialData) {
      form.reset({
        ...initialData,
        // Ensure boolean fields are set to prevent undefined
        markdown: initialData.markdown ?? true,
        featured: initialData.featured ?? false,
        startDate: initialData.startDate
          ? new Date(initialData.startDate)
          : undefined,
        endDate: initialData.endDate
          ? new Date(initialData.endDate)
          : undefined,
      });
    }
  }, [form, initialData, storageKey]);

  // Auto-save form values to localStorage
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (open && Object.keys(data).length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    });

    return () => subscription.unsubscribe();
  }, [form, open, storageKey]);

  // Auto-generate slug and seo data
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title" && value.title && !manualEdits.slug) {
        const slug = value.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-");
        form.setValue("slug", slug, { shouldValidate: true });
      }

      // Auto-generate SEO fields if they haven't been manually edited
      if (
        (name === "title" || name === "description") &&
        !manualEdits["seo.metaTitle"] &&
        value.title
      ) {
        form.setValue("seo.metaTitle", value.title, { shouldValidate: true });
      }

      if (
        name === "description" &&
        !manualEdits["seo.metaDescription"] &&
        value.description
      ) {
        // Truncate description to max 160 chars for meta description
        const metaDesc =
          value.description.length > 160
            ? value.description.substring(0, 157) + "..."
            : value.description;
        form.setValue("seo.metaDescription", metaDesc, {
          shouldValidate: true,
        });
      }

      if (name === "description" && !manualEdits.excerpt && value.description) {
        // Create excerpt from description (max 160 chars)
        const excerpt =
          value.description.length > 160
            ? value.description.substring(0, 157) + "..."
            : value.description;
        form.setValue("excerpt", excerpt, { shouldValidate: true });
      }

      // Use technologies as SEO keywords if not manually edited
      if (
        name?.startsWith("technologies") &&
        !manualEdits["seo.keywords"] &&
        value.technologies?.length
      ) {
        // Filter out undefined values and then convert to string array
        const keywords = value.technologies.filter(Boolean) as string[];
        form.setValue("seo.keywords", keywords, {
          shouldValidate: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, manualEdits]);

  // Track when fields are manually edited
  const handleManualEdit = (field: string) => {
    setManualEdits((prev) => ({ ...prev, [field]: true }));
  };

  // Reset manual edit status when a field is cleared
  const handleBlur = (field: string) => {
    const value = field.includes(".")
      ? form.getValues(field as any)
      : form.getValues()[field as keyof IProject];

    if (
      !value ||
      (Array.isArray(value) && value.length === 0) ||
      value === ""
    ) {
      setManualEdits((prev) => ({ ...prev, [field]: false }));
    }
  };

  // Handle adding new technology
  const handleAddTech = () => {
    if (!techInput.trim()) return;

    const currentTechs = form.getValues("technologies") || [];
    if (!currentTechs.includes(techInput.trim())) {
      form.setValue("technologies", [...currentTechs, techInput.trim()], {
        shouldValidate: true,
      });
    }
    setTechInput("");
  };

  // Handle removing a technology
  const handleRemoveTech = (tech: string) => {
    const currentTechs = form.getValues("technologies") || [];
    form.setValue(
      "technologies",
      currentTechs.filter((t) => t !== tech),
      { shouldValidate: true }
    );
  };

  // Form submission handler
  const onSubmit = async (data: IProject) => {
    try {
      if (isEditMode && initialData?._id) {
        await updateMutation.mutateAsync({
          id: initialData._id,
          data,
        });
        toast.success("Project updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Project created successfully");
        // Clear form data from localStorage after successful create
        localStorage.removeItem(storageKey);
      }
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save project");
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Tabs
      defaultValue='basic'
      className='w-full'
    >
      <TabsList className='grid grid-cols-4 mb-4'>
        <TabsTrigger value='basic'>Basic Info</TabsTrigger>
        <TabsTrigger value='details'>Details</TabsTrigger>
        <TabsTrigger value='media'>Media</TabsTrigger>
        <TabsTrigger value='seo'>SEO</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value='basic'>
            <Card>
              <CardContent className='space-y-4 pt-4'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Project Title'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleManualEdit("title");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='project-slug'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleManualEdit("slug");
                          }}
                          onBlur={() => handleBlur("slug")}
                        />
                      </FormControl>
                      <FormDescription>
                        URL-friendly identifier for your project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='A brief description of your project'
                          className='min-h-[120px]'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleManualEdit("description");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='excerpt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='A short excerpt for previews (max 160 characters)'
                          maxLength={160}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleManualEdit("excerpt");
                          }}
                          onBlur={() => handleBlur("excerpt")}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/160 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='category'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Web Development, Mobile App, etc.'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='planned'>Planned</SelectItem>
                            <SelectItem value='in-progress'>
                              In Progress
                            </SelectItem>
                            <SelectItem value='completed'>Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='details'>
            <Card>
              <CardContent className='space-y-4 pt-4'>
                <FormField
                  control={form.control}
                  name='content'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Detailed description of your project'
                          className='min-h-[250px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-4'>
                  <FormLabel>Technologies*</FormLabel>
                  <div className='flex gap-2'>
                    <Input
                      placeholder='Add technology'
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTech();
                        }
                      }}
                    />
                    <Button
                      type='button'
                      onClick={handleAddTech}
                      variant='outline'
                    >
                      <PlusCircledIcon className='mr-1 h-4 w-4' />
                      Add
                    </Button>
                  </div>

                  <div className='flex flex-wrap gap-2 mt-2'>
                    {form.watch("technologies")?.map((tech) => (
                      <Badge
                        key={tech}
                        variant='secondary'
                        className='py-1 px-2'
                      >
                        {tech}
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-4 w-4 ml-1 hover:bg-muted'
                          onClick={() => handleRemoveTech(tech)}
                        >
                          <Cross2Icon className='h-3 w-3' />
                        </Button>
                      </Badge>
                    ))}
                    {form.formState.errors.technologies && (
                      <FormMessage>
                        {form.formState.errors.technologies.message}
                      </FormMessage>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='githubUrl'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://github.com/username/repo'
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='liveUrl'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Live URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://yourproject.com'
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='startDate'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                className={cn(
                                  "text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className='w-auto p-0'
                            align='start'
                          >
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='endDate'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                className={cn(
                                  "text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className='w-auto p-0'
                            align='start'
                          >
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='markdown'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Markdown</FormLabel>
                        <FormDescription>
                          Enable markdown rendering for the content
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='featured'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>
                          Showcase this project prominently on your portfolio
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='media'>
            <Card>
              <CardContent className='space-y-4 pt-4'>
                <FormField
                  control={form.control}
                  name='featuredImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://example.com/image.jpg'
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        URL for the main project image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preview image if available */}
                {form.watch("featuredImage") && (
                  <div className='mt-2 border rounded-md overflow-hidden'>
                    <Image
                      src={
                        form.watch("featuredImage") ||
                        "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1742598419/uploads/d9eqgzesei4wsgbb6mko.png"
                      }
                      alt='Preview'
                      className='max-h-[200px] object-cover w-full'
                      width={200}
                      height={200}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1742598419/uploads/d9eqgzesei4wsgbb6mko.png";
                      }}
                    />
                  </div>
                )}

                {/* Note: Gallery implementation would go here */}
                <FormItem>
                  <FormLabel>Gallery</FormLabel>
                  <FormDescription>
                    This feature allows adding multiple images to a project
                    gallery. (Implementation for adding multiple images would go
                    here)
                  </FormDescription>
                </FormItem>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='seo'>
            <Card>
              <CardContent className='space-y-4 pt-4'>
                <Accordion
                  type='single'
                  collapsible
                  defaultValue='seo'
                >
                  <AccordionItem value='seo'>
                    <AccordionTrigger>SEO Settings</AccordionTrigger>
                    <AccordionContent className='space-y-4 pt-4'>
                      <FormField
                        control={form.control}
                        name='seo.metaTitle'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='SEO optimized title'
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleManualEdit("seo.metaTitle");
                                }}
                                onBlur={() => handleBlur("seo.metaTitle")}
                              />
                            </FormControl>
                            <FormDescription>
                              Auto-generated from project title if left empty
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='seo.metaDescription'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='SEO optimized description (max 160 characters)'
                                maxLength={160}
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleManualEdit("seo.metaDescription");
                                }}
                                onBlur={() => handleBlur("seo.metaDescription")}
                              />
                            </FormControl>
                            <FormDescription>
                              {field.value?.length || 0}/160 characters.
                              Auto-generated from project description if left
                              empty.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className='space-y-2'>
                        <FormLabel>SEO Keywords</FormLabel>
                        <FormDescription>
                          Keywords are auto-generated from technologies if left
                          empty
                        </FormDescription>
                        <div className='flex flex-wrap gap-2 mt-2'>
                          {form.watch("seo.keywords")?.map((keyword, index) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='py-1 px-2'
                            >
                              {keyword}
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='h-4 w-4 ml-1 hover:bg-muted'
                                onClick={() => {
                                  const keywords =
                                    form.getValues("seo.keywords") || [];
                                  form.setValue(
                                    "seo.keywords",
                                    keywords.filter((_, i) => i !== index),
                                    { shouldValidate: true }
                                  );
                                  handleManualEdit("seo.keywords");
                                }}
                              >
                                <Cross2Icon className='h-3 w-3' />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <div className='flex justify-end gap-2 mt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Update Project"
                : "Create Project"}
            </Button>
          </div>
        </form>
      </Form>
    </Tabs>
  );
};

export default ProjectForm;
