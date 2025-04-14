import { useState, useEffect } from "react";
import { Calendar, Clock, Info, Settings, ToggleLeft, User, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import TagSelector from "@/components/TagSelector";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ProfileWithRole } from "@/types/supabase-extensions";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(false);
  const [expertiseTags, setExpertiseTags] = useState<string[]>([]);

  // Fetch user profile and calls
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['dashboardProfile'],
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
      return data as unknown as ProfileWithRole;
    }
  });

  // Fetch call history
  const { data: calls, isLoading: callsLoading } = useQuery({
    queryKey: ['userCalls'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .or(`expert_id.eq.${session.user.id},seeker_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user's expertise tags
  const { data: userTags } = useQuery({
    queryKey: ['dashboardExpertiseTags'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      const { data, error } = await supabase
        .from('user_expertise_tags')
        .select('expertise_tags(name)')
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      // Extract tag names from the query result
      return data.map(tag => tag.expertise_tags?.name || '').filter(Boolean);
    }
  });

  // Update availability mutation
  const updateAvailability = useMutation({
    mutationFn: async (available: boolean) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_available: available })
        .eq('id', session.user.id);
        
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables ? "You are now available" : "You are now offline",
        description: variables 
          ? "Users can now find you for help sessions." 
          : "You will not receive new help requests.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your availability.",
        variant: "destructive",
      });
    },
  });

  // Update effect based on fetched data
  useEffect(() => {
    if (profile) {
      setIsAvailable(profile.is_available || false);
    }
  }, [profile]);

  useEffect(() => {
    if (userTags) {
      setExpertiseTags(userTags);
    }
  }, [userTags]);

  // Handle availability toggle
  const handleAvailabilityChange = (available: boolean) => {
    setIsAvailable(available);
    updateAvailability.mutate(available);
  };

  // Format date and time
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate call duration in minutes
  const calculateDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return "In progress";
    
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;
    
    return Math.round(durationMs / 60000); // Convert to minutes
  };

  // Check if user is admin or superadmin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  if (profileLoading) {
    return <div className="flex justify-center items-center min-h-[50vh]">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="space-x-2">
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="mr-2">
              <Link to="/admin">
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="history">Call History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Availability Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {isAvailable ? "Live" : "Offline"}
                  </span>
                  <Switch
                    checked={isAvailable}
                    onCheckedChange={handleAvailabilityChange}
                    className="data-[state=checked]:bg-hotseat-500"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calls?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Hours Helped
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calls?.reduce((total, call) => {
                    if (call.end_time) {
                      const duration = calculateDuration(call.start_time, call.end_time);
                      return typeof duration === 'number' ? total + (duration / 60) : total;
                    }
                    return total;
                  }, 0).toFixed(1) || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Expertise Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expertiseTags.length}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Calls</CardTitle>
              <CardDescription>
                Your 3 most recent help sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <div className="py-8 text-center">Loading calls...</div>
              ) : calls && calls.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Topics</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.slice(0, 3).map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">
                          {call.expert_id === profile?.id ? "Seeker" : "Expert"}
                        </TableCell>
                        <TableCell>{formatDate(call.start_time)}</TableCell>
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
                          {typeof calculateDuration(call.start_time, call.end_time) === 'number' 
                            ? `${calculateDuration(call.start_time, call.end_time)} min` 
                            : calculateDuration(call.start_time, call.end_time)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No calls yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    When you complete help sessions, they will appear here.
                  </p>
                </div>
              )}
            </CardContent>
            {calls && calls.length > 0 && (
              <CardFooter className="flex justify-end">
                <Button asChild variant="ghost" size="sm">
                  <Link to="?tab=history">View All Calls</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft className="h-5 w-5 text-hotseat-500" /> 
                Availability Status
              </CardTitle>
              <CardDescription>
                Toggle your availability to receive help requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="availability"
                  checked={isAvailable}
                  onCheckedChange={handleAvailabilityChange}
                  className="data-[state=checked]:bg-hotseat-500"
                />
                <label htmlFor="availability" className="text-lg font-medium cursor-pointer">
                  {isAvailable ? "Available for calls" : "Not available"}
                </label>
              </div>
              <div className={`rounded-md p-4 ${isAvailable ? "bg-hotseat-50 dark:bg-hotseat-900/30" : "bg-secondary"}`}>
                <div className="flex items-start">
                  <Info className={`mr-3 h-5 w-5 ${isAvailable ? "text-hotseat-500" : "text-muted-foreground"}`} />
                  <p className="text-sm text-muted-foreground">
                    {isAvailable
                      ? "You are now visible to users seeking help. You'll receive notifications when someone wants to connect."
                      : "You are currently not visible to users seeking help. Toggle the switch to start receiving call requests."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Expertise Tags</CardTitle>
              <CardDescription>
                Set the topics you're available to help with
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TagSelector
                tags={expertiseTags}
                onChange={setExpertiseTags}
                placeholder="Add a skill or topic..."
                suggestedTags={[
                  "nodejs",
                  "python",
                  "design",
                  "marketing",
                  "machine-learning",
                ]}
              />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Users will find you when searching for these tags. Be specific about your areas of expertise.
              </p>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Availability Schedule</CardTitle>
              <CardDescription>
                Coming soon: Set recurring availability windows
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">Schedule Availability</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This feature is coming soon. You'll be able to set specific hours when you're regularly available to help.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Call History</CardTitle>
              <CardDescription>
                All your past help sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <div className="py-8 text-center">Loading calls...</div>
              ) : calls && calls.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Topics</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">
                          {call.expert_id === profile?.id ? "Expert" : "Seeker"}
                        </TableCell>
                        <TableCell>{formatDate(call.start_time)}</TableCell>
                        <TableCell>
                          {formatTime(call.start_time)} 
                          {call.end_time && ` - ${formatTime(call.end_time)}`}
                        </TableCell>
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
                          {typeof calculateDuration(call.start_time, call.end_time) === 'number' 
                            ? `${calculateDuration(call.start_time, call.end_time)} min` 
                            : calculateDuration(call.start_time, call.end_time)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No calls yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    When you complete help sessions, they will appear here.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t py-4">
              <div className="flex items-center justify-between w-full">
                <p className="text-sm text-muted-foreground">
                  Showing {calls?.length || 0} calls
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
