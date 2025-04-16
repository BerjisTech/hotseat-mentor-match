import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, MonitorSmartphone, MessageSquare, ClipboardCheck, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SummaryModal from "@/components/SummaryModal";
import CallTimer from "@/components/CallTimer";
import DailyIframe from '@daily-co/daily-js';
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import dailyService from "@/services/dailyService";

interface CallRoomProps {
  expertName: string;
  expertImage?: string;
  callId: string;
  userName: string;
  isExpert?: boolean;
}

const CallRoom = ({
  expertName,
  expertImage,
  callId,
  userName,
  isExpert = false,
}: CallRoomProps) => {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [callObject, setCallObject] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [pricePerMinute, setPricePerMinute] = useState(0);
  const [isSettingPrice, setIsSettingPrice] = useState(isExpert);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // Get initials for Avatar fallback
  const expertInitials = expertName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    // Get room details including price when component mounts
    const getRoomDetails = async () => {
      try {
        if (!callId) return;
        
        const details = await dailyService.getRoomDetails(callId);
        setRoomDetails(details);
        setPricePerMinute(details.pricePerMinute || 0);
        
        // If the room doesn't exist or cannot be found, show an error
        if (!details || details.error) {
          toast.error("Call room not found or has expired");
          return;
        }
      } catch (error) {
        console.error("Error getting room details:", error);
        toast.error("Failed to get call details");
      }
    };
    
    getRoomDetails();
  }, [callId]);

  // Create Daily call object when component mounts or after price is set
  useEffect(() => {
    // Don't initialize if expert is still setting price
    if (isExpert && isSettingPrice) {
      return;
    }
    
    const initCall = async () => {
      try {
        if (!callId) return;
        
        // Create a URL for the call
        const url = roomDetails?.url || `https://yourdomain.daily.co/${callId}`;
        
        // Create the call object
        const dailyCall = DailyIframe.createFrame(videoContainerRef.current as HTMLDivElement, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            background: 'black',
          },
          showLeaveButton: false,
          showFullscreenButton: true,
        });
        
        setCallObject(dailyCall);
        
        // Join the call
        await dailyCall.join({ url, userName });
        setIsCallActive(true);
        
        toast.success("You've joined the call");
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Failed to join call");
      }
    };
    
    if (roomDetails && !isSettingPrice) {
      initCall();
    }
    
    return () => {
      // Clean up the call when component unmounts
      if (callObject) {
        callObject.destroy();
      }
    };
  }, [callId, userName, roomDetails, isExpert, isSettingPrice]);
  
  // Start the call with specified price
  const startCallWithPrice = async () => {
    try {
      if (!pricePerMinute || isNaN(Number(pricePerMinute)) || Number(pricePerMinute) < 0) {
        toast.error("Please enter a valid price per minute");
        return;
      }
      
      // Create a room with the specified price
      const result = await dailyService.createRoom({
        roomName: callId,
        pricePerMinute: Number(pricePerMinute),
        expiryMinutes: 60
      });
      
      setRoomDetails(result);
      setIsSettingPrice(false);
      toast.success(`Call room created with price: $${pricePerMinute}/min`);
      
    } catch (error) {
      console.error("Error creating priced call room:", error);
      toast.error("Failed to create call room");
    }
  };
  
  // Toggle mic
  const toggleMic = () => {
    if (callObject) {
      callObject.setLocalAudio(micEnabled ? false : true);
      setMicEnabled(!micEnabled);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (callObject) {
      callObject.setLocalVideo(videoEnabled ? false : true);
      setVideoEnabled(!videoEnabled);
    }
  };
  
  // Share screen
  const shareScreen = () => {
    if (callObject) {
      callObject.startScreenShare();
    }
  };
  
  // End call
  const endCall = async () => {
    if (callObject) {
      callObject.leave();
      callObject.destroy();
      setCallObject(null);
      setIsCallActive(false);
      
      // Save call details to the database
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (user && user.user) {
          await supabase.from('calls').insert({
            room_id: callId,
            expert_id: isExpert ? user.user.id : null,
            seeker_id: !isExpert ? user.user.id : null,
            end_time: new Date().toISOString(),
            // Other fields would be filled here
          });
        }
      } catch (error) {
        console.error("Error saving call details:", error);
      }
      
      // Redirect to call ended page
      window.location.href = `/call-ended/${callId}`;
    }
  };

  // If expert is setting price, show the price input form
  if (isExpert && isSettingPrice) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Set Your Price</h2>
          <p className="text-muted-foreground mb-6">
            Specify how much you want to charge per minute for this call.
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per minute ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricePerMinute}
                  onChange={(e) => setPricePerMinute(Number(e.target.value))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button onClick={startCallWithPrice} className="w-full">
              Start Call
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={videoContainerRef} 
        className="flex-1 bg-black rounded-lg overflow-hidden relative"
      >
        {/* Daily.co frame will be inserted here */}
        
        {/* Overlay with expert info */}
        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 px-3 py-1.5 rounded-full z-10">
          <Avatar className="h-8 w-8 border-2 border-hotseat-500">
            <AvatarImage src={expertImage} alt={expertName} />
            <AvatarFallback className="bg-hotseat-900 text-hotseat-100">
              {expertInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-white text-sm font-medium">{expertName}</span>
        </div>
        
        {/* Timer and price overlay */}
        {isCallActive && (
          <div className="absolute top-4 right-4 z-10">
            <CallTimer
              isActive={isCallActive}
              pricePerMinute={Number(pricePerMinute)}
            />
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-center">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="icon"
            className={micEnabled ? "" : "bg-hotseat-500 text-white hover:bg-hotseat-600"}
            onClick={toggleMic}
          >
            {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            <span className="sr-only">{micEnabled ? "Mute microphone" : "Unmute microphone"}</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={videoEnabled ? "" : "bg-hotseat-500 text-white hover:bg-hotseat-600"}
            onClick={toggleVideo}
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            <span className="sr-only">{videoEnabled ? "Turn off camera" : "Turn on camera"}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={shareScreen}
          >
            <MonitorSmartphone className="h-5 w-5" />
            <span className="sr-only">Share screen</span>
          </Button>
          
          <Button variant="outline" size="icon">
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Open chat</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setIsSummaryOpen(true)}
          >
            <ClipboardCheck className="h-5 w-5" />
            <span>Generate Summary</span>
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={endCall}
          >
            End Call
          </Button>
        </div>
      </div>
      
      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        callId={callId}
        expertName={expertName}
        userName={userName}
      />
    </div>
  );
};

export default CallRoom;
