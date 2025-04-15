
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileWithRole } from "@/types/supabase-extensions";
import UsersTab from "@/components/admin/UsersTab";
import CallsTab from "@/components/admin/CallsTab";
import TagsTab from "@/components/admin/TagsTab";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is admin
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['adminUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return null;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) throw error;
      
      const profileWithRole = data as unknown as ProfileWithRole;
      
      if (profileWithRole.role !== 'admin' && profileWithRole.role !== 'superadmin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin area.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return null;
      }
      
      return profileWithRole;
    }
  });

  if (userLoading) {
    return <div className="flex justify-center items-center min-h-[50vh]">Checking permissions...</div>;
  }

  if (!currentUser) {
    return null; // Navigation handled in the query
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
      
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="tags">Expertise Tags</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UsersTab currentUser={currentUser} />
        </TabsContent>
        
        <TabsContent value="calls">
          <CallsTab currentUser={currentUser} />
        </TabsContent>
        
        <TabsContent value="tags">
          <TagsTab currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
