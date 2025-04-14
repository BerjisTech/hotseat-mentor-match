
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash, 
  UserCheck,
  UserX,
  Tag,
  Phone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [addTagDialogOpen, setAddTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

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
      
      if (data.role !== 'admin' && data.role !== 'superadmin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin area.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return null;
      }
      
      return data;
    }
  });

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers', searchTerm],
    queryFn: async () => {
      if (!currentUser) return [];
      
      let query = supabase
        .from('profiles')
        .select('*');
        
      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser,
  });

  // Fetch all calls
  const { data: calls, isLoading: callsLoading } = useQuery({
    queryKey: ['allCalls'],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser,
  });

  // Fetch all tags
  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ['allTags'],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const { data, error } = await supabase
        .from('expertise_tags')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data || [];
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

  // Add new tag mutation
  const addTag = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('expertise_tags')
        .insert({ name });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTags'] });
      setNewTag("");
      setAddTagDialogOpen(false);
      toast({
        title: "Tag added",
        description: "New expertise tag has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add tag",
        description: error.message || "An error occurred while adding the tag.",
        variant: "destructive",
      });
    },
  });

  // Delete tag mutation
  const deleteTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('expertise_tags')
        .delete()
        .eq('id', tagId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTags'] });
      toast({
        title: "Tag deleted",
        description: "The expertise tag has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete tag",
        description: error.message || "An error occurred while deleting the tag.",
        variant: "destructive",
      });
    },
  });

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle add tag submission
  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag.mutate(newTag.trim());
    }
  };

  // Handle user role change
  const handleRoleChange = (userId: string, role: string) => {
    if (currentUser?.role !== 'superadmin' && role === 'superadmin') {
      toast({
        title: "Permission denied",
        description: "Only superadmins can assign the superadmin role.",
        variant: "destructive",
      });
      return;
    }
    
    updateUserRole.mutate({ userId, role });
  };

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
        
        <TabsContent value="users" className="space-y-6">
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
                            {user.role}
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
                        <TableCell>{formatDate(user.created_at)}</TableCell>
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
                                disabled
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
                                disabled={user.role === 'admin' || currentUser.role !== 'superadmin'}
                              >
                                Set as Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user.id, 'superadmin')}
                                disabled={user.role === 'superadmin' || currentUser.role !== 'superadmin'}
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
                <div className="py-12 text-center">
                  <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No users found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm ? "Try a different search term." : "There are no users registered yet."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Call History</CardTitle>
              <CardDescription>
                All help sessions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <div className="py-8 text-center">Loading calls...</div>
              ) : calls && calls.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Expert</TableHead>
                      <TableHead>Seeker</TableHead>
                      <TableHead>Topics</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-mono text-xs">{call.id.substring(0, 8)}...</TableCell>
                        <TableCell>{formatDate(call.created_at)}</TableCell>
                        <TableCell>{call.expert_id.substring(0, 8)}...</TableCell>
                        <TableCell>{call.seeker_id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {call.tags?.map((tag) => (
                              <Badge key={tag} variant="outline" className="tag">
                                {tag}
                              </Badge>
                            )) || <span className="text-muted-foreground text-sm">No tags</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {call.end_time 
                            ? `${Math.round((new Date(call.end_time).getTime() - new Date(call.start_time).getTime()) / 60000)} min` 
                            : "In progress"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center">
                  <Phone className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No calls recorded</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    There are no help sessions recorded in the system yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tags" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expertise Tags</CardTitle>
                  <CardDescription>
                    Manage available expertise tags
                  </CardDescription>
                </div>
                <Dialog open={addTagDialogOpen} onOpenChange={setAddTagDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Tag
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Expertise Tag</DialogTitle>
                      <DialogDescription>
                        Create a new expertise tag that users can select.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="tag-name">Tag Name</Label>
                        <Input
                          id="tag-name"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Enter tag name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddTagDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" onClick={handleAddTag} disabled={!newTag.trim() || addTag.isPending}>
                        {addTag.isPending ? "Adding..." : "Add Tag"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {tagsLoading ? (
                <div className="py-8 text-center">Loading tags...</div>
              ) : tags && tags.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell className="font-medium">{tag.name}</TableCell>
                        <TableCell>{formatDate(tag.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTag.mutate(tag.id)}
                            disabled={deleteTag.isPending}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center">
                  <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No tags found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add expertise tags to help users find experts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
