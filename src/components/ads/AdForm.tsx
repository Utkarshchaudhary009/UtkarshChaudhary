import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IAd } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Form schema for creating and editing ads
const adFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  image: z
    .string()
    .url("Image must be a valid URL")
    .min(1, "Image is required"),
  cta_url: z.string().url("CTA URL must be a valid URL"),
  target: z.object({
    categories: z
      .string()
      .optional()
      .transform((val) =>
        val
          ? val
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined
      ),
    tags: z
      .string()
      .optional()
      .transform((val) =>
        val
          ? val
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined
      ),
    location: z.string().optional(),
  }),
});

type AdFormValues = z.infer<typeof adFormSchema>;

interface AdFormProps {
  ad?: IAd;
  onSubmit: (values: AdFormValues) => void;
  isSubmitting: boolean;
}

export function AdForm({ ad, onSubmit, isSubmitting }: AdFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form with default values or editing values
  const form = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      title: "",
      image: "",
      cta_url: "",
      target: {
        categories: "",
        tags: "",
        location: "",
      },
    },
  });

  // When editing, populate form with ad data
  useEffect(() => {
    if (ad) {
      console.log("Populating form with ad data:", ad);
      form.reset({
        title: ad.title,
        image: ad.image,
        cta_url: ad.cta_url,
        target: {
          categories: ad.target.categories?.join(", ") || "",
          tags: ad.target.tags?.join(", ") || "",
          location: ad.target.location || "",
        },
      });
    }
  }, [ad, form]);

  // Try to load form data from localStorage on mount
  useEffect(() => {
    const savedForm = localStorage.getItem("adFormData");

    if (savedForm && !ad) {
      try {
        const parsedForm = JSON.parse(savedForm);
        form.reset(parsedForm);
      } catch (error) {
        console.error("Error parsing saved form data:", error);
        localStorage.removeItem("adFormData");
      }
    }
  }, [form, ad]);

  // Save form data to localStorage on change
  const handleFormChange = () => {
    const formValues = form.getValues();
    localStorage.setItem("adFormData", JSON.stringify(formValues));
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("images", file);
    setIsUploading(true);
    let uploadedImageUrl = "";

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      uploadedImageUrl = data.files[0]?.url;

      if (!uploadedImageUrl) {
        throw new Error("No image URL received");
      }

      form.setValue("image", uploadedImageUrl, { shouldDirty: true });
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Image upload error:", error);
      form.setValue("image", "", { shouldDirty: true });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (values: AdFormValues) => {
    console.log("Form submission values:", values);
    try {
      // Transform string values to arrays before submission
      const processedValues = {
        ...values,
        target: {
          ...values.target,
          categories: values.target.categories || undefined,
          tags: values.target.tags || undefined,
        }
      };
      onSubmit(processedValues);
      // Clear localStorage after successful submission
      localStorage.removeItem("adFormData");
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Form submission failed");
    }
  };

  const imageValue = form.watch("image");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          console.error("Form validation errors:", errors);
          toast.error("Please fix the form errors before submitting");
        })}
        className='space-y-6'
        onChange={handleFormChange}
      >
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Title</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter ad title'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='image'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Image</FormLabel>
              <div className='flex gap-4 items-start'>
                <div className='flex-1'>
                  <Input
                    id='imageFile'
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    disabled={isUploading}
                    className='mb-2'
                  />
                  <FormControl>
                    <Input
                      placeholder='https://example.com/image.jpg'
                      {...field}
                      className='mt-2'
                    />
                  </FormControl>
                  {isUploading && (
                    <div className='flex items-center text-sm text-muted-foreground'>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Uploading...
                    </div>
                  )}
                  <FormMessage />
                </div>
                <div
                  className={cn(
                    "relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center",
                    imageValue
                      ? "border-transparent"
                      : "border-muted-foreground/25"
                  )}
                >
                  {imageValue ? (
                    <>
                      <Image
                        src={imageValue}
                        alt='Ad image preview'
                        fill
                        className='object-cover rounded-lg'
                        sizes='128px'
                      />
                      <button
                        type='button'
                        onClick={() =>
                          form.setValue("image", "", { shouldDirty: true })
                        }
                        className='absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:bg-destructive/90 transition-colors'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </>
                  ) : (
                    <span className='text-sm text-muted-foreground'>
                      No image
                    </span>
                  )}
                </div>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='cta_url'
          render={({ field }) => (
            <FormItem>
              <FormLabel>CTA URL</FormLabel>
              <FormControl>
                <Input
                  placeholder='https://example.com/landing-page'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='border p-4 rounded-md space-y-4'>
          <h3 className='font-medium'>Targeting Options</h3>

          <FormField
            control={form.control}
            name='target.categories'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories (comma separated)</FormLabel>
                <FormControl>
                  <Input
                    placeholder='technology, design, marketing'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='target.tags'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input
                    placeholder='nextjs, react, web'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='target.location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder='US, Europe, Global'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type='submit'
          className='w-full'
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? "Saving..." : ad ? "Update Ad" : "Create Ad"}
        </Button>
      </form>
    </Form>
  );
}
