
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, UserCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileWithRole } from "@/types/supabase-extensions";
import { useNavigate } from "react-router-dom";

const UsersTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user from the React Query cache
  const { data: currentUser } = useQuery({
    queryKey: ['adminUser'],
  });

  // Properly typed currentUser
  const typedCurrentUser = currentUser as ProfileWithRole | undefined;

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*');
        
      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      return (data || []) as ProfileWithRole[];
    },
    enabled: !!currentUser,
  });

  // Update user role mutation
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating user role.",
        variant: "destructive",
      });
    },
  });

  // Toggle user availability mutation
  const toggleUserAvailability = useMutation({
    mutationFn: async ({ userId, isAvailable }: { userId: string; isAvailable: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_available: isAvailable })
        .eq('id', userId);
        
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast({
        title: "Availability updated",
        description: `User is now ${variables.isAvailable ? 'available' : 'unavailable'} for calls.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating user availability.",
        variant: "destructive",
      });
    },
  });

  // Handle user role change
  const handleRoleChange = (userId: string, role: string) => {
    if (typedCurrentUser?.role !== 'superadmin' && role === 'superadmin') {
      toast({
        title: "Permission denied",
        description: "Only superadmins can assign the superadmin role.",
        variant: "destructive",
      });
      return;
    }
    
    updateUserRole.mutate({ userId, role });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user accounts and roles
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {usersLoading ? (
          <div className="py-8 text-center">Loading users...</div>
        ) : users && users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || "Unnamed"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === 'superadmin'
                          ? "destructive"
                          : user.role === 'admin'
                          ? "default"
                          : user.role === 'expert'
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {user.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.is_available || false}
                      onCheckedChange={(checked) => toggleUserAvailability.mutate({ 
                        userId: user.id, 
                        isAvailable: checked 
                      })}
                      disabled={user.role !== 'expert'}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => navigate(`/profile/${user.id}`)}
                        >
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, 'user')}
                          disabled={user.role === 'user'}
                        >
                          Set as User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, 'expert')}
                          disabled={user.role === 'expert'}
                        >
                          Set as Expert
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, 'admin')}
                          disabled={user.role === 'admin' || typedCurrentUser?.role !== 'superadmin'}
                        >
                          Set as Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, 'superadmin')}
                          disabled={user.role === 'superadmin' || typedCurrentUser?.role !== 'superadmin'}
                        >
                          Set as Superadmin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>No users found</p>
            {searchTerm && <p className="mt-1">Try a different search term.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersTab;
