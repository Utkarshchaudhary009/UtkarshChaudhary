'use client'

import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "./supabase/client";
import type { UserData } from "./supabase/client";

// Function to save current user details to Supabase
export async function syncUserToSupabase() {
  try {
    // Get current user from Clerk
    const user = await currentUser();

    if (!user) return null
    
    // Prepare user data for Supabase
    const userData = {
      clerk_id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.emailAddresses[0]?.emailAddress || null,
      profile_image_url: user.imageUrl,
      public_metadata: user.publicMetadata,
      updated_at: new Date().toISOString()
    }
    
    // Upsert user data to Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert(
        userData,
        { 
          onConflict: 'clerk_id',
          ignoreDuplicates: false
        }
      )
      .select('*')
      .single()
    
    if (error) {
      console.error('Error syncing user to Supabase:', error)
      return null
    }
    
    return data as UserData
  } catch (error) {
    console.error('Error in syncUserToSupabase:', error)
    return null
  }
}

// Get the current user data from Supabase
export async function getCurrentUserData() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()
    
    if (error || !data) {
      console.error('Error fetching user data:', error)
      return null
    }
    
    return data as UserData
  } catch (error) {
    console.error('Error in getCurrentUserData:', error)
    return null
  }
}

// Check if current user is an admin
export async function isCurrentUserAdmin() {
  try {
    const userData = await getCurrentUserData()
    return userData?.is_admin || false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Check if current user is banned
export async function isCurrentUserBanned() {
  try {
    const userData = await getCurrentUserData()
    return userData?.is_banned || false
  } catch (error) {
    console.error('Error checking ban status:', error)
    return false
  }
} 