
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileWithRole } from "@/types/supabase-extensions";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface BecomeExpertButtonProps {
  user: ProfileWithRole | null;
  className?: string;
}

const BecomeExpertButton = ({ user, className }: BecomeExpertButtonProps) => {
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Skip rendering if not the current user or already an expert
  if (!user || user.role === 'expert' || user.role === 'admin' || user.role === 'superadmin') {
    return null;
  }
  
  const becomeExpertMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'expert',
          bio: bio,
          is_available: true
        })
        .eq('id', user.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast({
        title: "Expert Status Granted",
        description: "You are now an expert and can help others!",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your status.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className} variant="default">
          <UserCheck className="mr-2 h-4 w-4" />
          Become an Expert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Become an Expert</DialogTitle>
          <DialogDescription>
            Share your expertise with others! Add a bio that describes your knowledge and experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Textarea
            id="bio"
            placeholder="Share your expertise, background, and experience..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => becomeExpertMutation.mutate()} 
            disabled={becomeExpertMutation.isPending}>
            {becomeExpertMutation.isPending ? "Updating..." : "Become an Expert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BecomeExpertButton;
