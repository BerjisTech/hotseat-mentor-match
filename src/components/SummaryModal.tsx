
import { useState } from "react";
import { ClipboardCheck, Copy, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  callId: string;
  expertName: string;
  userName: string;
}

const SummaryModal = ({
  isOpen,
  onClose,
  callId,
  expertName,
  userName,
}: SummaryModalProps) => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [copied, setCopied] = useState(false);

  // Simulate loading the AI-generated summary
  useState(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        // Placeholder summary - in real app, this would come from AI
        const placeholderSummary = `During this call, ${expertName} provided guidance on React hooks and state management best practices. Key points discussed:

1. When to use useState vs useReducer for complex state
2. Strategies for avoiding prop drilling with context
3. Performance optimization with useMemo and useCallback
4. Common pitfalls with useEffect dependencies
        
${userName} was advised to implement a custom hook for the form validation logic discussed and to refactor the component tree to better leverage context.`;
        
        setSummary(placeholderSummary);
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    // Save summary logic would go here
    // If sendEmail is true, would also trigger email sending
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Call Summary</DialogTitle>
          <DialogDescription>
            AI-generated summary from your call with {expertName}.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-hotseat-500" />
              <p className="mt-2 text-sm text-muted-foreground">Generating summary...</p>
            </div>
          </div>
        ) : (
          <>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[200px]"
            />
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="send-email"
                checked={sendEmail}
                onCheckedChange={setSendEmail}
              />
              <Label htmlFor="send-email" className="flex items-center gap-1 text-sm">
                <MailCheck className="h-4 w-4" />
                Send summary to both participants
              </Label>
            </div>
            
            <DialogFooter className="flex sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <ClipboardCheck className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Text
                  </>
                )}
              </Button>
              <Button onClick={handleSave}>Save Summary</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SummaryModal;
