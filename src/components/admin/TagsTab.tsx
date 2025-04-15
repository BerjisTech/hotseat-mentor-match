
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Tag, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileWithRole } from "@/types/supabase-extensions";

interface TagsTabProps {
  currentUser: ProfileWithRole;
}

const TagsTab = ({ currentUser }: TagsTabProps) => {
  const [addTagDialogOpen, setAddTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all tags
  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ['allTags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expertise_tags')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag.mutate(newTag.trim());
    }
  };

  return (
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
  );
};

export default TagsTab;
