
import { useState } from "react";
import { Calendar, Clock, Info, Settings, ToggleLeft, User } from "lucide-react";
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
import { Link } from "react-router-dom";

// Mock data for past calls
const pastCalls = [
  {
    id: "call-1",
    user: "Michael Chen",
    tags: ["javascript", "react", "debugging"],
    startTime: "2025-04-10T14:30:00",
    endTime: "2025-04-10T15:05:00",
    duration: 35,
  },
  {
    id: "call-2",
    user: "Emma Williams",
    tags: ["ui-design", "figma", "prototyping"],
    startTime: "2025-04-08T10:15:00",
    endTime: "2025-04-08T10:45:00",
    duration: 30,
  },
  {
    id: "call-3",
    user: "James Rodriguez",
    tags: ["node.js", "express", "mongodb"],
    startTime: "2025-04-05T16:00:00",
    endTime: "2025-04-05T16:40:00",
    duration: 40,
  },
];

const Dashboard = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [expertiseTags, setExpertiseTags] = useState<string[]>([
    "react",
    "javascript",
    "typescript",
    "web-development",
  ]);

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/profile">
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
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
                    onCheckedChange={setIsAvailable}
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
                <div className="text-2xl font-bold">15</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Hours Helped
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5</div>
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
                  {pastCalls.slice(0, 3).map((call) => (
                    <TableRow key={call.id}>
                      <TableCell className="font-medium">{call.user}</TableCell>
                      <TableCell>{formatDate(call.startTime)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {call.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="tag">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {call.duration} min
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button asChild variant="ghost" size="sm">
                <Link to="?tab=history">View All Calls</Link>
              </Button>
            </CardFooter>
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
                  onCheckedChange={setIsAvailable}
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
              {pastCalls.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Topics</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastCalls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">{call.user}</TableCell>
                        <TableCell>{formatDate(call.startTime)}</TableCell>
                        <TableCell>
                          {formatTime(call.startTime)} - {formatTime(call.endTime)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {call.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="tag">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {call.duration} min
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
                  Showing {pastCalls.length} calls
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
