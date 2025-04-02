"use client";

import { useState, useEffect } from "react";
import {
  usePersonalDetails,
  useUpdatePersonalDetails,
} from "@/lib/api/services/meService";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalDetailsSchema } from "@/lib/types";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Loader2, Plus, Trash, X, FileText } from "lucide-react";
import FileUpload from "@/components/FileUpload";

// Define the form schema using zod
const formSchema = personalDetailsSchema.extend({
  profileImage: z.string().optional(),
  resumePdf: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export default function AdminMePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isUploading, setIsUploading] = useState(false);

  // Use TanStack Query hooks
  const { data: personalDetails, isLoading, error } = usePersonalDetails();
  const updatePersonalDetailsMutation = useUpdatePersonalDetails();

  // Setup the form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: personalDetails || {
      name: "",
      age: 0,
      work: [],
      stories: [],
      title: "",
      bio: "",
      email: "",
      location: "",
      socialLinks: [],
      profileImage: "",
      resumePdf: "",
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (personalDetails) {
      form.reset(personalDetails);
    }
  }, [personalDetails, form]);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("images", file);
    setIsUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.files[0]?.url;
        form.setValue("profileImage", imageUrl);
        toast.success("Profile image uploaded successfully");
      } else {
        toast.error("Error uploading image");
      }
    } catch {
      toast.error("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle resume upload (using FileUpload component)
  const handleResumeUpload = (urls: string[]) => {
    if (urls.length > 0) {
      form.setValue("resumePdf", urls[0]);
      toast.success("Resume uploaded successfully");
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    console.log(data);
    updatePersonalDetailsMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Personal details updated successfully");
      },
      onError: (error) => {
        toast.error("Failed to update personal details");
        console.error(error);
      },
    });
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-8 w-56' />
        <Skeleton className='h-[600px] w-full' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-4 text-center'>
        <h2 className='text-xl font-bold text-red-500'>
          Error loading personal details
        </h2>
        <p>{error.message || "Please try again later"}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const watchProfileImage = form.watch("profileImage");
  const watchResumePdf = form.watch("resumePdf");

  return (
    <div className='space-y-6 max-w-4xl mx-auto pb-12'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Manage Personal Information
        </h1>
        <Button
          type='submit'
          form='personal-form'
          disabled={updatePersonalDetailsMutation.isPending}
          className='hidden md:flex'
        >
          {updatePersonalDetailsMutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <Form {...form}>
        <form
          id='personal-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <Tabs
            defaultValue='personal'
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid grid-cols-4 mb-8'>
              <TabsTrigger value='personal'>Personal</TabsTrigger>
              <TabsTrigger value='work'>Work History</TabsTrigger>
              <TabsTrigger value='stories'>Stories</TabsTrigger>
              <TabsTrigger value='social'>Social Links</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent
              value='personal'
              className='space-y-6'
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your basic profile information here.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Profile Image */}
                  <div className='space-y-4'>
                    <FormLabel>Profile Image</FormLabel>
                    <div className='flex items-start gap-4'>
                      <div className='flex-1'>
                        <Input
                          type='file'
                          accept='image/*'
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          disabled={isUploading}
                          className='mb-2'
                        />
                        {isUploading && (
                          <div className='flex items-center text-sm text-muted-foreground'>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Uploading...
                          </div>
                        )}
                      </div>
                      {watchProfileImage && (
                        <div className='relative w-32 h-32'>
                          <Image
                            src={watchProfileImage}
                            alt='Profile image preview'
                            className='object-cover rounded-lg'
                            fill
                            sizes='128px'
                          />
                          <button
                            type='button'
                            onClick={() => form.setValue("profileImage", "")}
                            className='absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:bg-destructive/90 transition-colors'
                          >
                            <X className='h-4 w-4' />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Details */}
                  <div className='grid gap-6 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Enter your full name'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='age'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              placeholder='Your age'
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='your.email@example.com'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='location'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='City, Country'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Biography */}
                  <FormField
                    control={form.control}
                    name='bio'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biography</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Tell us about yourself...'
                            className='min-h-32'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Write a short bio about yourself, your experiences,
                          and your interests.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* current job title */}
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Job Title</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Tell us about current job title...'
                            className='min-h-12'
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Resume Upload */}
                  <div className='space-y-4'>
                    <FormLabel>Resume PDF</FormLabel>
                    <div className='flex flex-col gap-4'>
                      <FileUpload
                        bucketName='resume_pdf'
                        path='pdf'
                        allowedMimeTypes={["application/pdf"]}
                        maxFiles={1}
                        maxFileSize={10 * 1024 * 1024} // 5MB limit
                        setFileUrls={handleResumeUpload}
                        className='mb-2'
                      />

                      {watchResumePdf && (
                        <div className='flex items-center justify-between p-3 border rounded-md bg-muted/20'>
                          <div className='flex items-center gap-2'>
                            <FileText className='h-5 w-5 text-primary' />
                            <span className='text-sm font-medium'>
                              Resume uploaded
                            </span>
                          </div>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => form.setValue("resumePdf", "")}
                            className='h-8 w-8 p-0'
                          >
                            <X className='h-4 w-4' />
                            <span className='sr-only'>Remove resume</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Work History Tab */}
            <TabsContent
              value='work'
              className='space-y-6'
            >
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>
                    Add your work experience and professional history.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {form.watch("work").map((_, index) => (
                    <div
                      key={index}
                      className='rounded-lg border p-4 space-y-4'
                    >
                      <div className='flex justify-between items-center'>
                        <h3 className='text-lg font-medium'>
                          Work Entry #{index + 1}
                        </h3>
                        <Button
                          type='button'
                          variant='destructive'
                          size='sm'
                          onClick={() => {
                            const currentWork = form.getValues("work");
                            form.setValue(
                              "work",
                              currentWork.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <Trash className='h-4 w-4 mr-2' />
                          Remove
                        </Button>
                      </div>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name={`work.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Senior Developer'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`work.${index}.company`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Company Name'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`work.${index}.period`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Period</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Jan 2020 - Present'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`work.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Describe your responsibilities and achievements...'
                                className='min-h-20'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full'
                    onClick={() => {
                      const currentWork = form.getValues("work") || [];
                      form.setValue("work", [
                        ...currentWork,
                        { title: "", company: "", period: "", description: "" },
                      ]);
                    }}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Work Experience
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stories Tab */}
            <TabsContent
              value='stories'
              className='space-y-6'
            >
              <Card>
                <CardHeader>
                  <CardTitle>Personal Stories</CardTitle>
                  <CardDescription>
                    Share your personal stories and experiences.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {form.watch("stories").map((_, index) => (
                    <div
                      key={index}
                      className='rounded-lg border p-4 space-y-4'
                    >
                      <div className='flex justify-between items-center'>
                        <h3 className='text-lg font-medium'>
                          Story #{index + 1}
                        </h3>
                        <Button
                          type='button'
                          variant='destructive'
                          size='sm'
                          onClick={() => {
                            const currentStories = form.getValues("stories");
                            form.setValue(
                              "stories",
                              currentStories.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <Trash className='h-4 w-4 mr-2' />
                          Remove
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`stories.${index}.heading`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Heading</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Story Title'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`stories.${index}.content`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Tell your story...'
                                className='min-h-32'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full'
                    onClick={() => {
                      const currentStories = form.getValues("stories") || [];
                      form.setValue("stories", [
                        ...currentStories,
                        { heading: "", content: "" },
                      ]);
                    }}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Story
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Links Tab */}
            <TabsContent
              value='social'
              className='space-y-6'
            >
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Links</CardTitle>
                  <CardDescription>
                    Connect your social media accounts and online presence.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {form.watch("socialLinks").map((_, index) => (
                    <div
                      key={index}
                      className='rounded-lg border p-4 space-y-4'
                    >
                      <div className='flex justify-between items-center'>
                        <h3 className='text-lg font-medium'>
                          Social Link #{index + 1}
                        </h3>
                        <Button
                          type='button'
                          variant='destructive'
                          size='sm'
                          onClick={() => {
                            const currentLinks = form.getValues("socialLinks");
                            form.setValue(
                              "socialLinks",
                              currentLinks.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <Trash className='h-4 w-4 mr-2' />
                          Remove
                        </Button>
                      </div>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name={`socialLinks.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='My GitHub'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`socialLinks.${index}.platform`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Platform</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='GitHub'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`socialLinks.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='https://github.com/username'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`socialLinks.${index}.icon`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon (optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='github'
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter an icon name if available (e.g. github,
                              twitter)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full'
                    onClick={() => {
                      const currentLinks = form.getValues("socialLinks") || [];
                      form.setValue("socialLinks", [
                        ...currentLinks,
                        { name: "", url: "", platform: "", icon: "" },
                      ]);
                    }}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Social Link
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            type='submit'
            className='w-full md:hidden'
            disabled={updatePersonalDetailsMutation.isPending}
          >
            {updatePersonalDetailsMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
