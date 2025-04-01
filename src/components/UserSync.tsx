"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { syncUserToSupabase } from "@/utils/auth";

export default function UserSync() {
  const { userId, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    // Only sync when user is signed in and loaded
    if (isLoaded && isSignedIn && userId) {
      const syncUser = async () => {
        await syncUserToSupabase();
      };

      syncUser();
    }
  }, [userId, isLoaded, isSignedIn]);

  // This is a utility component that doesn't render anything
  return null;
}
