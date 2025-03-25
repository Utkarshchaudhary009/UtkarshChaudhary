'use client';

import { useState } from 'react';
import { usePersonalDetails, useUpdatePersonalDetails } from '@/lib/api/services/meService';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalDetailsSchema } from '@/lib/types';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Define the form schema using zod
const formSchema = personalDetailsSchema;
type FormValues = z.infer<typeof formSchema>;

export default function AdminMePage() {
  const [activeTab, setActiveTab] = useState('personal');
  
  // Use TanStack Query hooks
  const { data: personalDetails, isLoading, error } = usePersonalDetails();
  const updatePersonalDetailsMutation = useUpdatePersonalDetails();
  
  // Setup the form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: personalDetails || {
      name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      location: '',
      profileImage: '',
      socialLinks: [],
      skills: [],
      resume: '',
    },
  });
  
  // Update form values when data is loaded
  React.useEffect(() => {
    if (personalDetails) {
      form.reset(personalDetails);
    }
  }, [personalDetails, form]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    updatePersonalDetailsMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Personal details updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update personal details');
        console.error(error);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-bold text-red-500">Error loading personal details</h2>
        <p>{error.message || 'Please try again later'}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // The rest of your component with tabs, form fields, etc.
  // This is just a skeleton - you'll need to adapt this to your actual form layout
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Personal Information</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
              <TabsTrigger value="social">Social Links</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>
            
            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details that appear on your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Frontend Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write a short bio about yourself..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Provide a URL to your profile picture
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Contact Details Tab */}
            <TabsContent value="contact">
              {/* Contact form fields */}
            </TabsContent>
            
            {/* Social Links Tab */}
            <TabsContent value="social">
              {/* Social links fields */}
            </TabsContent>
            
            {/* Skills Tab */}
            <TabsContent value="skills">
              {/* Skills fields */}
            </TabsContent>
          </Tabs>
          
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={updatePersonalDetailsMutation.isPending}
          >
            {updatePersonalDetailsMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
} 