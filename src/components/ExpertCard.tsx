
import { BadgeCheck, Calendar, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export interface ExpertProps {
  id: string;
  name: string;
  profileImage?: string;
  bio: string;
  tags: string[];
  isAvailable: boolean;
  callCount?: number;
  averageRating?: number;
}

const ExpertCard = ({
  id,
  name,
  profileImage,
  bio,
  tags,
  isAvailable,
  callCount = 0,
  averageRating = 0,
}: ExpertProps) => {
  // Get initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className={`expert-card ${isAvailable ? 'expert-card-available' : 'expert-card-unavailable'}`}>
      {isAvailable && (
        <div className="live-indicator">
          <span className="pulse-dot"></span>
          <span>LIVE</span>
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-hotseat-100 dark:border-hotseat-800">
            <AvatarImage src={profileImage} alt={name} />
            <AvatarFallback className="bg-hotseat-100 text-hotseat-800 dark:bg-hotseat-900 dark:text-hotseat-100">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{name}</h3>
              {callCount > 10 && (
                <BadgeCheck className="h-4 w-4 text-hotseat-500" />
              )}
            </div>
            
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{bio}</p>
            
            <div className="mt-3 flex flex-wrap gap-1">
              {tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="outline" className="tag">
                  {tag}
                </Badge>
              ))}
              {tags.length > 5 && (
                <Badge variant="outline" className="tag">
                  +{tags.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4 pt-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            <span>{callCount} sessions</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>~30 min</span>
          </div>
        </div>
        
        <Button asChild disabled={!isAvailable} className="gap-1">
          <Link to={`/call/${id}`}>
            <Video className="mr-1 h-4 w-4" />
            Join Call
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExpertCard;
