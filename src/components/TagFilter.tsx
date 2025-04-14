
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TagFilterProps {
  selectedTags: string[];
  availableTags: string[];
  onSelectTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onClearTags: () => void;
}

const TagFilter = ({
  selectedTags,
  availableTags,
  onSelectTag,
  onRemoveTag,
  onClearTags,
}: TagFilterProps) => {
  return (
    <div className="space-y-2">
      {selectedTags.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium">Filtered by:</span>
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="flex items-center gap-1 px-2 py-1 bg-hotseat-500"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:text-hotseat-200 rounded-full"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag} filter</span>
              </button>
            </Badge>
          ))}
          <button
            onClick={onClearTags}
            className="text-xs text-muted-foreground hover:text-hotseat-500"
          >
            Clear all
          </button>
        </div>
      )}
      
      <div className="flex flex-wrap gap-1 mb-2">
        {availableTags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className={`cursor-pointer transition-colors ${
              selectedTags.includes(tag) ? "tag-active" : "tag"
            }`}
            onClick={() => {
              selectedTags.includes(tag) ? onRemoveTag(tag) : onSelectTag(tag);
            }}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
