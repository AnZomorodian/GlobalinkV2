import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import ContactInfo from "@/components/ContactInfo";
import SettingsModal from "@/components/SettingsModal";
import CallModal from "@/components/CallModal";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContactId] });
          queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
          
          // Show notification if not currently viewing the sender
          if (data.message.senderId !== selectedContactId) {
            toast({
              title: "💬 New Message",
              description: `${data.message.sender?.firstName}: ${data.message.content.substring(0, 50)}${data.message.content.length > 50 ? '...' : ''}`,
              duration: 4000,
            });
            
            // Browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification(`New message from ${data.message.sender?.firstName}`, {
                body: data.message.content,
                icon: data.message.sender?.profileImageUrl || '/default-avatar.png',
              });
            }
          }
          break;
          
        case 'messageSent':
          // Refresh messages for sender
          queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContactId] });
          queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
          break;
          
        case 'incomingCall':
          setActiveCall(data.call);
          break;
          
        case 'statusUpdate':
          // Refresh contacts to update status
          queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
          queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
          break;
      }
    }
  }, [lastMessage, toast, selectedContactId, queryClient]);

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

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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
