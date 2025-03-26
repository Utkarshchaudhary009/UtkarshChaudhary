/**
 * Contact API service module
 * Handles all contact form and admin inbox related API functionality
 */

import { useApiQuery, useApiMutation } from "@/lib/tanstack/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { IContact } from "@/lib/types";
import { useAuth } from "@clerk/nextjs";

// Type definitions
export interface CreateContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface UpdateContactStatusInput {
  status: "unread" | "read" | "replied";
}

export interface ReplyContactInput {
  message: string;
}

// Filter type for contacts
export interface ContactFilters {
  status?: "unread" | "read" | "replied";
  searchTerm?: string;
  page?: number;
  limit?: number;
}

// Query keys
export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (filters: ContactFilters = {}) =>
    [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
};

/**
 * Fetch all contact messages with optional filtering
 */
export function useContacts(filters: ContactFilters = {}) {
  // Construct URL with query parameters for status filtering
  let url = "/api/contact";
  if (filters.status) {
    url += `?status=${filters.status}`;
  }

  return useApiQuery<IContact[]>(contactKeys.list(filters), url, {
    queryKey: contactKeys.list(filters),
    next: { revalidate: 180 }, // Cache for 180 seconds
  });
}

/**
 * Fetch a single contact message by ID
 */
export function useContact(id: string) {
  return useApiQuery<IContact>(contactKeys.detail(id), `/api/contact/${id}`, {
    queryKey: contactKeys.detail(id),
    enabled: !!id,
  });
}

/**
 * Create a new contact message
 */
export function useCreateContact() {
  const { userId } = useAuth();

  return useApiMutation<IContact, Error, CreateContactInput>(
    "/api/contact",
    "POST",
    {
      // Prepare the request data with userId from Clerk
      onMutate: (data) => {
        return {
          ...data,
          clerkId: userId || undefined,
          status: "unread",
          createdAt: new Date(),
        };
      },
    }
  );
}

/**
 * Update contact message status
 */
export function useUpdateContactStatus(id: string) {
  const queryClient = useQueryClient();

  return useApiMutation<IContact, Error, UpdateContactStatusInput>(
    `/api/contact/${id}/status`,
    "PATCH",
    {
      onSuccess: (data) => {
        queryClient.setQueryData(contactKeys.detail(id), data);
        return queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      },
    }
  );
}

/**
 * Send a reply to a contact message
 */
export function useReplyContact(id: string) {
  const queryClient = useQueryClient();

  return useApiMutation<IContact, Error, ReplyContactInput>(
    `/api/contact/${id}/reply`,
    "POST",
    {
      onSuccess: (data) => {
        queryClient.setQueryData(contactKeys.detail(id), {
          ...data,
          status: "replied",
        });
        return queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      },
    }
  );
}
