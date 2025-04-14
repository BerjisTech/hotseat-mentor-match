
import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, MonitorSmartphone, MessageSquare, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SummaryModal from "@/components/SummaryModal";

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
  
  // Get initials for Avatar fallback
  const expertInitials = expertName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
        {/* This would be replaced with the actual Daily.co iframe */}
        <div className="absolute inset-0 flex items-center justify-center">
          <iframe
            title="Video call"
            src="about:blank"
            className="w-full h-full"
            allow="camera; microphone; fullscreen; speaker; display-capture"
          />
        </div>
        
        {/* Overlay with expert info */}
        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 px-3 py-1.5 rounded-full">
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
            onClick={() => setMicEnabled(!micEnabled)}
          >
            {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            <span className="sr-only">{micEnabled ? "Mute microphone" : "Unmute microphone"}</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={videoEnabled ? "" : "bg-hotseat-500 text-white hover:bg-hotseat-600"}
            onClick={() => setVideoEnabled(!videoEnabled)}
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            <span className="sr-only">{videoEnabled ? "Turn off camera" : "Turn on camera"}</span>
          </Button>
          
          <Button variant="outline" size="icon">
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
          
          <Button variant="destructive" size="sm">
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
