'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { personalDetailsSchema, jobSchema, storySchema, socialLinkSchema } from '@/lib/types'; // Assuming your schema is in this file
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Helper component for rendering job forms
const JobForm = ({ form, index, onRemove }: { form: any; index: number; onRemove: () => void }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Work Experience #{index + 1}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`work.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Software Engineer" {...field} />
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
                <Input placeholder="Acme Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`work.${index}.period`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Period</FormLabel>
              <FormControl>
                <Input placeholder="2022 - Present" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Responsibilities and achievements" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
      {index > 0 && (
        <div className="px-4 pb-4">
          <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      )}
    </Card>
  );
};

// Helper component for rendering story forms
const StoryForm = ({ form, index, onRemove }: { form: any; index: number; onRemove: () => void }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Story #{index + 1}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name={`stories.${index}.heading`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heading</FormLabel>
              <FormControl>
                <Input placeholder="My Amazing Story" {...field} />
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
                <Input placeholder="The full story..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
      {index > 0 && (
        <div className="px-4 pb-4">
          <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      )}
    </Card>
  );
};

// Helper component for rendering social link forms
const SocialLinkForm = ({ form, index, onRemove }: { form: any; index: number; onRemove: () => void }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Social Link #{index + 1}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`socialLinks.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="LinkedIn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`socialLinks.${index}.url`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/in/..." {...field} />
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
                <Input placeholder="LinkedIn" {...field} />
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
              <FormLabel>Icon (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., linkedin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
      {index > 0 && (
        <div className="px-4 pb-4">
          <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      )}
    </Card>
  );
};

export default function AdminPage() {
  const form = useForm<z.infer<typeof personalDetailsSchema>>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      name: '',
      age: 0,
      work:[],
      stories:[],
      bio: '',
      email: '',
      location: '',
      socialLinks:[],
    },
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control: form.control,
    name: 'work',
  });

  const { fields: storyFields, append: appendStory, remove: removeStory } = useFieldArray({
    control: form.control,
    name: 'stories',
  });

  const { fields: socialLinkFields, append: appendSocialLink, remove: removeSocialLink } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  async function onSubmit(values: z.infer<typeof personalDetailsSchema>) {
    // Here you would typically send the form data to your API
    console.log('Form Values:', values);
    // Example API call (replace with your actual endpoint)
    // try {
    //   const response = await fetch('/api/me', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(values),
    //   });
    //   if (response.ok) {
    //     // Handle success
    //     console.log('Data saved successfully!');
    //   } else {
    //     // Handle error
    //     console.error('Failed to save data.');
    //   }
    // } catch (error) {
    //   console.error('An error occurred:', error);
    // }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin Page - Edit Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Your Age" {...field} />
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
                      <Input placeholder="A short description about yourself" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Your City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h3 className="text-lg font-semibold mb-2">Work Experience</h3>
                {workFields.map((field, index) => (
                  <JobForm
                    key={field.id}
                    form={form}
                    index={index}
                    onRemove={() => removeWork(index)}
                  />
                ))}
                <Button type="button" variant="outline" onClick={() => appendWork({ title: '', company: '', period: '', description: '' })}>
                  Add Work Experience
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Stories</h3>
                {storyFields.map((field, index) => (
                  <StoryForm
                    key={field.id}
                    form={form}
                    index={index}
                    onRemove={() => removeStory(index)}
                  />
                ))}
                <Button type="button" variant="outline" onClick={() => appendStory({ heading: '', content: '' })}>
                  Add Story
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Social Links</h3>
                {socialLinkFields.map((field, index) => (
                  <SocialLinkForm
                    key={field.id}
                    form={form}
                    index={index}
                    onRemove={() => removeSocialLink(index)}
                  />
                ))}
                <Button type="button" variant="outline" onClick={() => appendSocialLink({ name: '', url: '', platform: '', icon: '' })}>
                  Add Social Link
                </Button>
              </div>

              <Button type="submit">Save Details</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}