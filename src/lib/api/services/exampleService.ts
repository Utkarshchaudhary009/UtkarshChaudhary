/**
 * Example API service module
 * This demonstrates how to structure API services with TanStack Query
 */

import { useApiQuery, useApiMutation } from '@/lib/tanstack/hooks';
import { useQueryClient } from '@tanstack/react-query';

// Type definitions
export interface ExampleData {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface CreateExampleInput {
  title: string;
  description: string;
}

// Query keys
export const exampleKeys = {
  all: ['examples'] as const,
  lists: () => [...exampleKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...exampleKeys.lists(), filters] as const,
  details: () => [...exampleKeys.all, 'detail'] as const,
  detail: (id: string) => [...exampleKeys.details(), id] as const,
};

/**
 * Fetch all examples
 */
export function useExamples(filters: Record<string, any> = {}) {
  return useApiQuery<ExampleData[]>(
    exampleKeys.list(filters),
    '/examples',
    {
      next: { revalidate: 60 }, // Cache for 60 seconds
    }
  );
}

/**
 * Fetch a single example by ID
 */
export function useExample(id: string) {
  return useApiQuery<ExampleData>(
    exampleKeys.detail(id),
    `/examples/${id}`,
    {
      enabled: !!id,
    }
  );
}

/**
 * Create a new example
 */
export function useCreateExample() {
  const queryClient = useQueryClient();
  
  return useApiMutation<ExampleData, Error, CreateExampleInput>(
    '/examples',
    'POST',
    {
      // Automatically refetch the examples list after mutation
      onSuccess: (data, variables, context) => {
        return queryClient.invalidateQueries({ queryKey: exampleKeys.lists() });
      },
    }
  );
}

/**
 * Update an example
 */
export function useUpdateExample(id: string) {
  const queryClient = useQueryClient();
  
  return useApiMutation<ExampleData, Error, Partial<CreateExampleInput>>(
    `/examples/${id}`,
    'PUT',
    {
      // Automatically update the cache with the returned data
      onSuccess: (data) => {
        queryClient.setQueryData(exampleKeys.detail(id), data);
        return queryClient.invalidateQueries({ queryKey: exampleKeys.lists() });
      },
    }
  );
}

/**
 * Delete an example
 */
export function useDeleteExample() {
  const queryClient = useQueryClient();
  
  return useApiMutation<void, Error, string>(
    (id) => `/examples/${id}`,
    'DELETE',
    {
      // The ID is passed as the variable to the mutation
      onSuccess: (_, id) => {
        queryClient.removeQueries({ queryKey: exampleKeys.detail(id) });
        return queryClient.invalidateQueries({ queryKey: exampleKeys.lists() });
      },
    }
  );
} 