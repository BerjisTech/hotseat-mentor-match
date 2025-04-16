import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileWithRole } from "@/types/supabase-extensions";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users, Phone, Tags, Settings, Layout } from "lucide-react";
import { Outlet, Routes, Route, Link, useLocation } from "react-router-dom";
import UsersTab from "@/components/admin/UsersTab";
import CallsTab from "@/components/admin/CallsTab";
import TagsTab from "@/components/admin/TagsTab";
import AdminControls from "@/components/home/AdminControls";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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

  const isActive = (path: string) => {
    return location.pathname === `/admin${path}`;
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-[calc(100vh-6rem)]">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-2">
              <Settings className="h-6 w-6 mr-2 text-hotseat-500" />
              <h2 className="text-lg font-semibold">Admin Panel</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive("") || isActive("/")}
                  tooltip="Dashboard"
                >
                  <Link to="/admin">
                    <Layout className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive("/users")}
                  tooltip="Users"
                >
                  <Link to="/admin/users">
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive("/calls")}
                  tooltip="Calls"
                >
                  <Link to="/admin/calls">
                    <Phone className="h-4 w-4" />
                    <span>Calls</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive("/tags")}
                  tooltip="Tags"
                >
                  <Link to="/admin/tags">
                    <Tags className="h-4 w-4" />
                    <span>Expertise Tags</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <SidebarTrigger />
          </div>
          
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const AdminDashboard = () => {
  const { data: currentUser } = useQuery({
    queryKey: ['adminUser'],
  });
  
  const mockExperts = [
    { 
      id: '1', 
      name: 'John Doe', 
      isAvailable: true 
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      isAvailable: false 
    }
  ];

  const handleUpdateExperts = (experts: any[]) => {
    console.log('Experts updated:', experts);
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
        experts={mockExperts} 
        onUpdateExperts={handleUpdateExperts} 
      />
    </div>
  );
};

const Admin = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersTab />} />
        <Route path="calls" element={<CallsTab />} />
        <Route path="tags" element={<TagsTab />} />
      </Route>
    </Routes>
  );
};

export default Admin;
