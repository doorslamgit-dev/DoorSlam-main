// src/services/accountService.ts

import { supabase } from '../lib/supabase';

interface UpdateProfileFields {
  full_name: string;
  phone: string | null;
}

interface UpdateChildProfileFields {
  preferred_name: string | null;
}

interface UpdateAddressFields {
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
  timezone: string;
}

export async function updateParentProfile(
  userId: string,
  fields: UpdateProfileFields
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...fields,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return { success: !error, error: error?.message || null };
}

export async function updateChildProfile(
  childId: string,
  fields: UpdateChildProfileFields
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from('children')
    .update({
      ...fields,
      updated_at: new Date().toISOString(),
    })
    .eq('id', childId);

  return { success: !error, error: error?.message || null };
}

export async function updateParentAddress(
  userId: string,
  fields: UpdateAddressFields
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...fields,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return { success: !error, error: error?.message || null };
}

export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { success: !error, error: error?.message || null };
}
