
import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
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
  
  // Fetch user profile data
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
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
      return data;
    }
  });

  // Fetch user's expertise tags
  const { data: expertiseTags } = useQuery({
    queryKey: ['expertiseTags'],
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
  
  // Set state values when data is loaded
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setBio(profile.bio || "");
      setProfileImage(profile.avatar_url || "");
    }
  }, [profile]);
  
  useEffect(() => {
    if (expertiseTags) {
      setTags(expertiseTags);
    }
  }, [expertiseTags]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (profileData: { full_name: string; bio: string; avatar_url: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', session.user.id);
        
      if (error) throw error;
      
      // Update expertise tags
      // First, fetch existing tags to find tag IDs or create new ones
      const tagPromises = tags.map(async (tagName) => {
        // Check if tag exists
        let { data: existingTags } = await supabase
          .from('expertise_tags')
          .select('id')
          .eq('name', tagName);
          
        let tagId;
        
        if (!existingTags || existingTags.length === 0) {
          // Create new tag
          const { data: newTag, error: createError } = await supabase
            .from('expertise_tags')
            .insert({ name: tagName })
            .select('id')
            .single();
            
          if (createError) throw createError;
          tagId = newTag.id;
        } else {
          tagId = existingTags[0].id;
        }
        
        // Delete existing user-tag associations
        await supabase
          .from('user_expertise_tags')
          .delete()
          .eq('user_id', session.user.id);
          
        // Create new user-tag association
        const { error: linkError } = await supabase
          .from('user_expertise_tags')
          .insert({
            user_id: session.user.id,
            tag_id: tagId
          });
          
        if (linkError) throw linkError;
      });
      
      await Promise.all(tagPromises);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    },
  });
  
  const handleSaveProfile = () => {
    updateProfile.mutate({
      full_name: name,
      bio: bio,
      avatar_url: profileImage
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    setLoading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    try {
      // Check if the storage bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(b => b.name === 'avatars')) {
        await supabase.storage.createBucket('avatars', {
          public: true,
        });
      }
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      setProfileImage(data.publicUrl);
      
      toast({
        title: "Upload successful",
        description: "Your profile image has been uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[50vh]">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-2">Error loading profile</h2>
        <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

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
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={loading}
                  >
                    <Upload className="h-4 w-4" />
                    {loading ? "Uploading..." : "Upload Image"}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
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
              disabled={!name.trim() || !bio.trim() || updateProfile.isPending}
            >
              <Save className="h-4 w-4" />
              {updateProfile.isPending ? "Saving..." : "Save Profile"}
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
