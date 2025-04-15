
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvailabilityToggleProps {
  showOnlyAvailable: boolean;
  onToggle: () => void;
}

const AvailabilityToggle = ({ showOnlyAvailable, onToggle }: AvailabilityToggleProps) => {
  return (
    <Button
      variant="outline"
      className={showOnlyAvailable ? "bg-hotseat-100 dark:bg-hotseat-900" : ""}
      onClick={onToggle}
    >
      <Flame className={`mr-2 h-4 w-4 ${showOnlyAvailable ? "text-hotseat-500" : ""}`} />
      Live Now
    </Button>
  );
};

export default AvailabilityToggle;
