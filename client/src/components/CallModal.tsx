import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWebRTC } from "@/hooks/useWebRTC";
import type { Call, User } from "@shared/schema";

interface CallModalProps {
  call: Call & { caller: User; receiver: User };
  currentUser: User;
  onEnd: () => void;
}

export default function CallModal({ call, currentUser, onEnd }: CallModalProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(call.callType === 'video');
  
  const isIncoming = call.receiverId === currentUser.id;
  const otherUser = isIncoming ? call.caller : call.receiver;
  
  const {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isCalling,
    acceptCall,
    rejectCall,
    endCall,
    muteAudio,
    toggleVideo,
  } = useWebRTC();

  // Update call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    acceptCall();
  };

  const handleReject = () => {
    rejectCall();
    onEnd();
  };

  const handleEnd = () => {
    endCall();
    onEnd();
  };

  const handleMute = () => {
    muteAudio();
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoEnabled(!isVideoEnabled);
  };

  return (
    <Dialog open onOpenChange={onEnd}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <div className="relative">
          {/* Video containers for video calls */}
          {call.callType === 'video' && (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {/* Remote video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Local video (picture-in-picture) */}
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Call info overlay */}
          <div className={`${call.callType === 'video' ? 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent' : ''} p-6 text-center text-white`}>
            {call.callType === 'voice' && (
              <div className="mb-6">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={otherUser.profileImageUrl || ""} />
                  <AvatarFallback className="text-2xl bg-gray-700 text-white">
                    {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            
            <h3 className="text-xl font-semibold mb-2">
              {otherUser.firstName} {otherUser.lastName}
            </h3>
            
            <p className="text-gray-300 mb-6">
              {isConnected ? (
                `${call.callType === 'video' ? 'Video' : 'Voice'} Call • ${formatDuration(callDuration)}`
              ) : isIncoming ? (
                `Incoming ${call.callType} call`
              ) : isCalling ? (
                'Calling...'
              ) : (
                'Connecting...'
              )}
            </p>

            {/* Call controls */}
            <div className="flex justify-center space-x-4">
              {isIncoming && !isConnected ? (
                <>
                  <Button
                    size="lg"
                    onClick={handleReject}
                    className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700"
                  >
                    <i className="fas fa-phone-slash text-xl"></i>
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleAccept}
                    className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700"
                  >
                    <i className="fas fa-phone text-xl"></i>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={handleMute}
                    variant={isMuted ? "destructive" : "secondary"}
                    className="w-12 h-12 rounded-full"
                  >
                    <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                  </Button>
                  
                  {call.callType === 'video' && (
                    <Button
                      size="lg"
                      onClick={handleToggleVideo}
                      variant={!isVideoEnabled ? "destructive" : "secondary"}
                      className="w-12 h-12 rounded-full"
                    >
                      <i className={`fas ${!isVideoEnabled ? 'fa-video-slash' : 'fa-video'}`}></i>
                    </Button>
                  )}
                  
                  <Button
                    size="lg"
                    onClick={handleEnd}
                    className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700"
                  >
                    <i className="fas fa-phone-slash text-xl"></i>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
