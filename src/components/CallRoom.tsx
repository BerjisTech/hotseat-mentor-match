
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, MonitorSmartphone, MessageSquare, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SummaryModal from "@/components/SummaryModal";
import DailyIframe from '@daily-co/daily-js';
import { toast } from "@/components/ui/sonner";

interface CallRoomProps {
  expertName: string;
  expertImage?: string;
  callId: string;
  userName: string;
}

const CallRoom = ({
  expertName,
  expertImage,
  callId,
  userName,
}: CallRoomProps) => {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [callObject, setCallObject] = useState<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // Get initials for Avatar fallback
  const expertInitials = expertName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    // Create Daily call object when component mounts
    const initCall = async () => {
      try {
        if (!callId) return;
        
        // Create a URL for the call (in a real app, this would come from your backend)
        const url = `https://your-domain.daily.co/${callId}`;
        
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
        
        toast.success("You've joined the call");
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Failed to join call");
      }
    };
    
    initCall();
    
    return () => {
      // Clean up the call when component unmounts
      if (callObject) {
        callObject.destroy();
      }
    };
  }, [callId, userName]);
  
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
  const endCall = () => {
    if (callObject) {
      callObject.leave();
      callObject.destroy();
      setCallObject(null);
      
      // Redirect or show end call screen
      window.location.href = `/call-ended/${callId}`;
    }
  };

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
