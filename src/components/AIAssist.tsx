
import { useState } from "react";
import { BrainCircuit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface AIAssistProps {
  title: string;
  description: string;
  placeholder?: string;
  buttonText?: string;
  onSubmit: (input: string) => Promise<string>;
}

const AIAssist = ({
  title,
  description,
  placeholder = "Type your question or request here...",
  buttonText = "Get AI Suggestions",
  onSubmit,
}: AIAssistProps) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    setIsLoading(true);
    
    try {
      // This is a placeholder - would connect to OpenAI or Claude later
      const response = await onSubmit(input);
      setResult(response);
    } catch (error) {
      console.error("AI assistant error:", error);
      setResult("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-hotseat-100 dark:border-hotseat-900">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <BrainCircuit className="h-5 w-5 text-hotseat-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="min-h-24 resize-none"
          />
          
          {result && (
            <div className="mt-4 rounded-md bg-secondary p-3 text-sm">
              <p className="font-medium mb-1">AI Suggestions:</p>
              <p className="text-muted-foreground whitespace-pre-line">{result}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AIAssist;
