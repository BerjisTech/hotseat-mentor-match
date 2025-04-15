
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CallRoomComponent from "@/components/CallRoom";
import SummaryModal from "@/components/SummaryModal";
import { toast } from "@/components/ui/sonner";

// Mock expert data based on id
const getMockExpert = (id: string) => {
  const experts = {
    "1": {
      name: "Alex Johnson",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    "2": {
      name: "Sara Lee",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    "3": {
      name: "Michael Chen",
      profileImage: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    "4": {
      name: "Emma Williams",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    "5": {
      name: "James Rodriguez",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  };

  return experts[id as keyof typeof experts] || { name: "Unknown Expert", profileImage: "" };
};

const CallRoom = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  
  // Get mock expert data based on id
  const expert = getMockExpert(id || "1");
  
  // Set page title
  useEffect(() => {
    document.title = `Call with ${expert.name} | HotSeat.live`;
    
    // Get user name from local storage or session
    const storedUserName = localStorage.getItem("userName") || "Guest User";
    setUserName(storedUserName);
    
    // Function to create the Daily.co room (in a real app)
    const createDailyRoom = async () => {
      try {
        // This would be an API call to your backend which creates a Daily.co room
        // const response = await fetch('/api/rooms', { method: 'POST' });
        // const data = await response.json();
        // console.log("Daily.co room created:", data.url);
        
        console.log("Call room loaded with ID:", id);
      } catch (error) {
        console.error("Error creating Daily.co room:", error);
        toast.error("Failed to create video call room");
      }
    };
    
    createDailyRoom();
    
    return () => {
      document.title = "HotSeat.live";
    };
  }, [expert.name, id]);

  // Handle ending the call
  const handleEndCall = () => {
    setIsCallEnded(true);
    setIsSummaryModalOpen(true);
    toast.info("Call has ended");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <div className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </div>
        </Button>
        {isCallEnded && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsSummaryModalOpen(true)}
          >
            View Call Summary
          </Button>
        )}
      </div>
      
      {isCallEnded ? (
        <Card>
          <CardHeader>
            <CardTitle>Call Ended</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">
              Your call with {expert.name} has ended
            </h2>
            <p className="text-muted-foreground mb-6">
              Thank you for using HotSeat.live!
            </p>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <a href="/">Return Home</a>
              </Button>
              <Button 
                onClick={() => setIsSummaryModalOpen(true)}
              >
                View Call Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="h-[70vh]">
          <CallRoomComponent
            expertName={expert.name}
            expertImage={expert.profileImage}
            callId={id || ""}
            userName={userName}
          />
        </div>
      )}
      
      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        callId={id || ""}
        expertName={expert.name}
        userName={userName}
      />
    </div>
  );
};

export default CallRoom;
