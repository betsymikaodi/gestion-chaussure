import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  }
});

// Types pour les tables
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

// Fonction pour créer un profil utilisateur
export const createUserProfile = async (profileData: {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_admin: boolean;
}): Promise<Profile> => {
  const now = new Date().toISOString();
  
  const { data: result, error } = await supabase
    .from('profiles')
    .insert({
      id: profileData.id,
      email: profileData.email,
      full_name: profileData.full_name,
      phone: profileData.phone,
      is_admin: profileData.is_admin,
      created_at: now,
      updated_at: now,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }

  if (!result) {
    throw new Error('Profile creation failed: no data returned');
  }

  return result as Profile;
};
