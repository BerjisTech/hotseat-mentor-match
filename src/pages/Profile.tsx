
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Save, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import TagSelector from "@/components/TagSelector";
import TagSuggestor from "@/components/TagSuggestor";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState("Alex Johnson");
  const [bio, setBio] = useState("Full-stack developer specializing in React, Node.js, and cloud architecture. 8+ years experience building scalable applications.");
  const [profileImage, setProfileImage] = useState("");
  const [tags, setTags] = useState<string[]>(["react", "javascript", "node.js", "aws", "typescript"]);
  
  // Suggested tags would come from AI in a real implementation
  const suggestedTags = [
    "frontend",
    "backend",
    "web-development",
    "api-design",
    "cloud-computing",
    "serverless",
    "microservices",
  ];
  
  const handleSaveProfile = () => {
    // This would save to Supabase in a real implementation
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully saved.",
    });
    
    navigate("/dashboard");
  };
  
  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about your expertise and experience..."
                  className="min-h-32 resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  {bio.length}/500 characters
                </p>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label>Profile Image</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileImage} alt={name} />
                    <AvatarFallback className="text-lg">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Areas of Expertise</CardTitle>
              <CardDescription>
                Add tags representing your skills and knowledge areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TagSelector
                tags={tags}
                onChange={setTags}
                placeholder="Add a skill or expertise..."
              />
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Users will find you when searching for these tags. Be specific about your expertise.
              </p>
            </CardFooter>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button
              className="gap-2"
              onClick={handleSaveProfile}
              disabled={!name.trim() || !bio.trim()}
            >
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
              <CardDescription>
                How others will see your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border-2 border-hotseat-100 dark:border-hotseat-800">
                  <AvatarImage src={profileImage} alt={name} />
                  <AvatarFallback className="bg-hotseat-100 text-hotseat-800 dark:bg-hotseat-900 dark:text-hotseat-100">
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-semibold">{name || "Your Name"}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {bio || "Your bio will appear here..."}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tags.length > 0 ? (
                      tags.slice(0, 8).map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Add tags to showcase your expertise
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <TagSuggestor
            userInput={bio}
            suggestedTags={suggestedTags}
            onSelectTag={handleAddTag}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-hotseat-500" />
                AI Bio Enhancement
              </CardTitle>
              <CardDescription>
                Let AI help improve your profile bio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                variant="outline"
                disabled={!bio.trim()}
              >
                Enhance My Bio
              </Button>
              <p className="text-sm text-muted-foreground">
                Our AI can suggest improvements to make your bio more effective at showcasing your expertise.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
