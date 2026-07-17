import { supabase } from './supabase';

export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  region?: string;
  avatarUrl?: string;
  notifications?: any;
}

export async function updateUserProfile(userId: string, data: UserProfileData) {
  if (!userId) throw new Error("User ID is required");

  // Format data for database table
  const dbData: any = { updated_at: new Date().toISOString() };
  if (data.firstName !== undefined) dbData.first_name = data.firstName;
  if (data.lastName !== undefined) dbData.last_name = data.lastName;
  if (data.avatarUrl !== undefined) dbData.avatar_url = data.avatarUrl;

  // 1. Update in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update(dbData)
    .eq('id', userId);

  if (profileError) throw profileError;

  // Format data for auth metadata
  const authData: any = {};
  if (data.firstName !== undefined) authData.first_name = data.firstName;
  if (data.lastName !== undefined) authData.last_name = data.lastName;
  if (data.phone !== undefined) authData.phone = data.phone;
  if (data.region !== undefined) authData.region = data.region;
  if (data.avatarUrl !== undefined) authData.avatar_url = data.avatarUrl;
  if (data.notifications !== undefined) authData.notifications = data.notifications;

  // 2. Update user metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: authData
  });

  if (authError) throw authError;

  return true;
}

export async function updateUserAddresses(userId: string, addresses: any[]) {
  if (!userId) throw new Error("User ID is required");

  // Validate addresses
  if (!Array.isArray(addresses)) throw new Error("Addresses must be an array");

  // We only store addresses in the user metadata since there is no column in profiles
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      addresses: addresses
    }
  });

  if (authError) throw authError;

  return true;
}
