import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import ContactInfo from "@/components/ContactInfo";
import SettingsModal from "@/components/SettingsModal";
import CallModal from "@/components/CallModal";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeCall, setActiveCall] = useState<any>(null);

  // WebSocket connection
  const { sendMessage: sendWsMessage, lastMessage } = useWebSocket(user?.id);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      
      switch (data.type) {
        case 'newMessage':
          toast({
            title: "New Message",
            description: `Message from ${data.message.sender?.firstName}`,
          });
          break;
          
        case 'incomingCall':
          setActiveCall(data.call);
          break;
          
        case 'statusUpdate':
          // Handle status updates for contacts
          break;
      }
    }
  }, [lastMessage, toast]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-corp-blue"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar
        currentUser={user}
        selectedContactId={selectedContactId}
        onContactSelect={setSelectedContactId}
        onSettingsOpen={() => setShowSettings(true)}
      />
      
      <ChatArea
        currentUser={user}
        selectedContactId={selectedContactId}
        onContactInfoToggle={() => setShowContactInfo(!showContactInfo)}
        sendWsMessage={sendWsMessage}
        onCallStart={(callType) => {
          // Handle call initiation
          console.log('Starting call:', callType);
        }}
      />
      
      {showContactInfo && selectedContactId && (
        <ContactInfo
          contactId={selectedContactId}
          onClose={() => setShowContactInfo(false)}
        />
      )}
      
      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {activeCall && (
        <CallModal
          call={activeCall}
          currentUser={user}
          onEnd={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
