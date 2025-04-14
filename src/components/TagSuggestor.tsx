
import { BrainCircuit, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TagSuggestorProps {
  userInput: string;
  suggestedTags: string[];
  onSelectTag: (tag: string) => void;
}

const TagSuggestor = ({
  userInput,
  suggestedTags,
  onSelectTag,
}: TagSuggestorProps) => {
  // Generate recommendation text based on user input (simulating AI)
  const generateRecommendation = () => {
    if (!userInput) return "";
    
    if (userInput.length < 20) {
      return "Your description is quite short. Adding more details would help generate better tag suggestions.";
    }
    
    if (suggestedTags.length === 0) {
      return "I couldn't generate specific tags from your description. Try adding more technical details or specific areas of expertise.";
    }
    
    return "Based on your description, these tags might be relevant to your expertise:";
  };

  const recommendation = generateRecommendation();

  return (
    <Card className="bg-background border-hotseat-100 dark:border-hotseat-900">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <BrainCircuit className="h-5 w-5 text-hotseat-500" />
          AI Tag Suggestions
        </CardTitle>
        <CardDescription>
          Suggested tags based on your profile and expertise
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {userInput ? (
          <>
            <p className="text-sm text-muted-foreground mb-3">{recommendation}</p>
            
            {suggestedTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {suggestedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-hotseat-100 dark:hover:bg-hotseat-900 flex items-center gap-1.5"
                    onClick={() => onSelectTag(tag)}
                  >
                    <Sparkles className="h-3 w-3 text-hotseat-500" />
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Add more details to your bio to get AI tag suggestions.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Add information to your bio first to get AI-suggested tags.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TagSuggestor;
