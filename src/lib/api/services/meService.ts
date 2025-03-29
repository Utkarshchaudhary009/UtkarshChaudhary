import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personalDetailsSchema } from "@/lib/types";
import { z } from "zod";

// Type for personal details
export type PersonalDetails = z.infer<typeof personalDetailsSchema>;

// Query keys
export const meKeys = {
  all: ["me"] as const,
  details: () => [...meKeys.all, "details"] as const,
};

// API functions
const fetchPersonalDetails = async (): Promise<PersonalDetails> => {
  const response = await fetch("/api/me", {
    cache: "force-cache",
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch personal details");
  return response.json();
};

const updatePersonalDetails = async (
  data: Partial<PersonalDetails>
): Promise<PersonalDetails> => {
  const response = await fetch("/api/me", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update personal details");
  return response.json();
};

// Hooks
export function usePersonalDetails() {
  return useQuery({
    queryKey: meKeys.details(),
    queryFn: fetchPersonalDetails,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useUpdatePersonalDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePersonalDetails,
    onSuccess: (newData) => {
      queryClient.setQueryData(meKeys.details(), newData);
    },
  });
}
