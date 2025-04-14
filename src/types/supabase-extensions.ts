
// Custom type extensions for Supabase database types
// This allows us to use properties that exist in the database but aren't in the auto-generated types

// ProfileWithRole extends the database Profile type to include the role property
export interface ProfileWithRole {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_available: boolean | null;
  role: string | null; // Added role property
}

// Type for updating a profile with role
export interface ProfileUpdateWithRole {
  id?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  is_available?: boolean | null;
  created_at?: string;
  updated_at?: string;
  role?: string | null; // Added role property
}
