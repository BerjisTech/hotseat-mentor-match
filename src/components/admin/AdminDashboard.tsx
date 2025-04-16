
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, Phone, Tags } from "lucide-react";
import AdminControls from "@/components/home/AdminControls";
import { ExpertProps } from "@/components/ExpertCard";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { data: currentUser } = useQuery({
    queryKey: ['adminUser'],
  });
  
  // Fetch experts from Supabase
  const { data: experts = [] } = useQuery({
    queryKey: ['adminExperts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, bio, is_available, user_expertise_tags(expertise_tags(name))')
        .eq('role', 'expert');

      if (error) throw error;

      return data.map((profile): ExpertProps => ({
        id: profile.id,
        name: profile.full_name || 'Anonymous Expert',
        bio: profile.bio || 'No bio available',
        tags: profile.user_expertise_tags?.map(tag => tag.expertise_tags.name) || [],
        isAvailable: profile.is_available || false,
      }));
    },
  });

  const handleUpdateExperts = async (updatedExperts: ExpertProps[]) => {
    // Update experts in Supabase
    for (const expert of updatedExperts) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_available: expert.isAvailable })
        .eq('id', expert.id);

      if (error) {
        console.error('Error updating expert:', error);
      }
    }
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/users" className="group">
          <div className="border rounded-lg p-6 h-full hover:border-hotseat-500 transition-all">
            <Users className="h-10 w-10 mb-4 text-muted-foreground group-hover:text-hotseat-500 transition-colors" />
            <h3 className="text-xl font-medium mb-2">User Management</h3>
            <p className="text-muted-foreground">Manage users, roles, and permissions</p>
          </div>
        </Link>
        
        <Link to="/admin/calls" className="group">
          <div className="border rounded-lg p-6 h-full hover:border-hotseat-500 transition-all">
            <Phone className="h-10 w-10 mb-4 text-muted-foreground group-hover:text-hotseat-500 transition-colors" />
            <h3 className="text-xl font-medium mb-2">Call History</h3>
            <p className="text-muted-foreground">View and manage call records</p>
          </div>
        </Link>
        
        <Link to="/admin/tags" className="group">
          <div className="border rounded-lg p-6 h-full hover:border-hotseat-500 transition-all">
            <Tags className="h-10 w-10 mb-4 text-muted-foreground group-hover:text-hotseat-500 transition-colors" />
            <h3 className="text-xl font-medium mb-2">Expertise Tags</h3>
            <p className="text-muted-foreground">Manage expertise categories and tags</p>
          </div>
        </Link>
      </div>
      
      <AdminControls 
        experts={experts}
        onUpdateExperts={handleUpdateExperts}
      />
    </div>
  );
};

export default AdminDashboard;
