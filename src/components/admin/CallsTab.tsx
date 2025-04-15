
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
import { Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileWithRole } from "@/types/supabase-extensions";

interface CallsTabProps {
  currentUser: ProfileWithRole;
}

const CallsTab = ({ currentUser }: CallsTabProps) => {
  // Fetch all calls
  const { data: calls, isLoading: callsLoading } = useQuery({
    queryKey: ['allCalls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
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
  );
};

export default CallsTab;
