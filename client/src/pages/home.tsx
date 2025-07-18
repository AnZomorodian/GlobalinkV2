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
              duration: 2000, // 2 seconds as requested
            });
            
            // Browser notification if permission granted
            if (Notification.permission === 'granted') {
              const notification = new Notification(`New message from ${data.message.sender?.firstName}`, {
                body: data.message.content,
                icon: data.message.sender?.profileImageUrl || '/default-avatar.png',
              });
              
              // Auto-hide notification after 2 seconds
              setTimeout(() => {
                notification.close();
              }, 2000);
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20"></div>
        <div className="glass-card p-8 animate-pulse-slow">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-spin relative">
              <div className="absolute inset-2 bg-white rounded-full"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold gradient-text">Loading Globalink</h3>
              <p className="text-gray-600 text-sm">Connecting to your workspace...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Ultra-modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 -z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20 -z-10"></div>
      
      {/* Main application container with animations */}
      <div className="flex w-full animate-fade-in">
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
      </div>
      
      {/* Modern settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
          <SettingsModal
            user={user}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}
      
      {/* Modern call modal */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in">
          <CallModal
            call={activeCall}
            currentUser={user}
            onEnd={() => setActiveCall(null)}
          />
        </div>
      )}
    </div>
  );
}
