import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { User, Message } from "@shared/schema";

interface ChatAreaProps {
  currentUser: User;
  selectedContactId: string | null;
  onContactInfoToggle: () => void;
  sendWsMessage: (message: any) => void;
  onCallStart: (callType: 'voice' | 'video') => void;
}

export default function ChatArea({ 
  currentUser, 
  selectedContactId, 
  onContactInfoToggle, 
  sendWsMessage,
  onCallStart 
}: ChatAreaProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contact details
  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
    retry: false,
  });

  const selectedContact = contacts.find((contact: any) => contact.contactId === selectedContactId)?.contact;

  // Fetch messages for selected contact
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", selectedContactId],
    enabled: !!selectedContactId,
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/messages", {
        receiverId: selectedContactId,
        content,
        messageType: "text",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContactId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setMessageInput("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContactId) return;
    sendMessageMutation.mutate(messageInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  if (!selectedContactId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <i className="fas fa-comments text-gray-400 text-3xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Corporate Messenger</h2>
          <p className="text-gray-600">Select a contact to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedContact?.profileImageUrl || ""} />
              <AvatarFallback>
                {selectedContact?.firstName?.[0]}{selectedContact?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedContact?.firstName} {selectedContact?.lastName}
              </h2>
              <p className={`text-sm ${getStatusColor(selectedContact?.status || 'offline')}`}>
                {selectedContact?.status === 'online' ? 'Online' : 'Offline'} • ID: {selectedContact?.id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onCallStart('voice')}>
              <i className="fas fa-phone text-gray-600"></i>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onCallStart('video')}>
              <i className="fas fa-video text-gray-600"></i>
            </Button>
            <Button variant="ghost" size="sm" onClick={onContactInfoToggle}>
              <i className="fas fa-info-circle text-gray-600"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-corp-blue"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.reverse().map((message: any) => {
            const isOwn = message.senderId === currentUser.id;
            return (
              <div key={message.id} className={`flex items-start space-x-3 ${isOwn ? 'justify-end' : ''}`}>
                {!isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedContact?.profileImageUrl || ""} />
                    <AvatarFallback>
                      {selectedContact?.firstName?.[0]}{selectedContact?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-first' : ''}`}>
                  <div className={`rounded-lg p-3 shadow-sm ${
                    isOwn 
                      ? 'bg-corp-blue text-white' 
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : ''}`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
                {isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser.profileImageUrl || ""} />
                    <AvatarFallback>
                      {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <i className="fas fa-paperclip text-gray-600"></i>
          </Button>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isPending}
            />
          </div>
          <Button variant="ghost" size="sm">
            <i className="fas fa-smile text-gray-600"></i>
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className="bg-corp-blue hover:bg-blue-700"
          >
            <i className="fas fa-paper-plane"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
