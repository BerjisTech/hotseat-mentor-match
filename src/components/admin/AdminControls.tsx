
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Eye, EyeOff, Settings } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent 
} from "@/components/ui/card";
import { ExpertProps } from "@/components/ExpertCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdminControlsProps {
  experts: ExpertProps[];
  onUpdateExperts: (experts: ExpertProps[]) => void;
}

const AdminControls = ({ experts, onUpdateExperts }: AdminControlsProps) => {
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDeleteExpert = (id: string) => {
    const updatedExperts = experts.filter(expert => expert.id !== id);
    onUpdateExperts(updatedExperts);
  };

  const handleDeleteAll = () => {
    onUpdateExperts([]);
    setOpen(false);
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    const updatedExperts = experts.map(expert => 
      expert.id === id ? { ...expert, isAvailable: isVisible } : expert
    );
    onUpdateExperts(updatedExperts);
  };

  if (!experts || experts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mock Data Controls</CardTitle>
        <CardDescription>Manage the mock experts data until database integration is complete</CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
          <div className="flex items-center justify-between mb-4">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                {isCollapsed ? "Show" : "Hide"} Mock Data Controls
              </Button>
            </CollapsibleTrigger>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete All Mock Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Delete All</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete all mock experts? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteAll}>
                    Delete All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <CollapsibleContent>
            <div className="bg-background border rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {experts.map((expert) => (
                    <tr key={expert.id} className="border-t">
                      <td className="px-4 py-2">{expert.name}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          expert.isAvailable 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {expert.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleVisibility(expert.id, !expert.isAvailable)}
                        >
                          {expert.isAvailable ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => handleDeleteExpert(expert.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default AdminControls;
