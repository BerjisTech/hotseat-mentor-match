
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BecomeExpertButton from "@/components/profile/BecomeExpertButton";
import { ProfileWithRole } from "@/types/supabase-extensions";

// Note: This is a minimal example of the Profile page. Add more UI elements as needed.
const Profile = () => {
  const { id } = useParams();
  
  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      return data as ProfileWithRole;
    },
  });
  
  // Fetch profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id || (currentUser?.id ?? ''))
        .single();
        
      if (error) throw error;
      return data as ProfileWithRole;
    },
    enabled: !!id || !!currentUser,
  });

  const isOwnProfile = !id || currentUser?.id === profile?.id;
  
  if (isLoading) {
    return <div className="container py-8">Loading profile...</div>;
  }
  
  if (!profile) {
    return <div className="container py-8">Profile not found</div>;
  }
  
  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{profile.full_name || "Unnamed User"}</h1>
        {isOwnProfile && (
          <BecomeExpertButton user={profile} />
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p>{profile.role || "User"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Bio</p>
              <p className="whitespace-pre-wrap">{profile.bio || "No bio provided"}</p>
            </div>
            
            {profile.role === 'expert' && (
              <div>
                <p className="text-sm text-muted-foreground">Availability</p>
                <p>{profile.is_available ? "Available for calls" : "Not available for calls"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
