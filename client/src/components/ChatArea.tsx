import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
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
  const [searchInput, setSearchInput] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const emojis = ["😀", "😂", "😊", "😍", "🤔", "😢", "😡", "👍", "👎", "❤️", "🎉", "🔥", "💯", "👏", "🙏"];
  const messageInputRef = useRef<HTMLInputElement>(null);

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

  // Filter messages based on search
  const filteredMessages = messages.filter((message: any) => 
    searchInput === "" || message.content.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/messages", {
        receiverId: selectedContactId,
        content,
        messageType: "text",
        replyToId: replyTo?.id || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContactId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setMessageInput("");
      setReplyTo(null);
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

  // Listen for real-time message updates
  useEffect(() => {
    const handleMessage = (data: any) => {
      const parsedData = JSON.parse(data.data);
      if (parsedData.type === 'newMessage' || parsedData.type === 'messageSent') {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContactId] });
        queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      }
    };

    if (window.WebSocket) {
      // This would be handled by the WebSocket hook in parent component
      // For now, we'll rely on the parent to handle it
    }
  }, [selectedContactId, queryClient]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContactId) return;
    sendMessageMutation.mutate(messageInput);
  };

  const handleReply = (message: any) => {
    setReplyTo(message);
    messageInputRef.current?.focus();
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
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
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  selectedContact?.status === 'online' ? 'bg-green-500' :
                  selectedContact?.status === 'away' ? 'bg-yellow-500' :
                  selectedContact?.status === 'busy' ? 'bg-red-500' : 'bg-gray-300'
                }`}></div>
                <p className="text-sm text-gray-600">
                  {selectedContact?.status === 'online' ? 'Online' : 
                   selectedContact?.status === 'away' ? 'Away' :
                   selectedContact?.status === 'busy' ? 'Busy' : 'Offline'} • ID: {selectedContact?.id}
                </p>
              </div>
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

        {/* Search Bar */}
        <div className="mt-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-sm"></i>
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
          filteredMessages.reverse().map((message: any) => {
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
                  {message.replyToId && (
                    <div className="mb-2 opacity-75">
                      <div className="text-xs text-gray-500 border-l-2 border-gray-300 pl-2">
                        <i className="fas fa-reply mr-1"></i>
                        Replying to message
                      </div>
                    </div>
                  )}
                  <div className={`rounded-lg p-3 shadow-sm group relative ${
                    isOwn 
                      ? 'bg-corp-blue text-white' 
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Message Actions */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                          >
                            <i className="fas fa-ellipsis-v text-xs"></i>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleReply(message)}>
                            <i className="fas fa-reply mr-2"></i>
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopy(message.content)}>
                            <i className="fas fa-copy mr-2"></i>
                            Copy
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
        {/* Reply Preview */}
        {replyTo && (
          <div className="mb-3 p-2 bg-gray-50 rounded border-l-4 border-corp-blue">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="fas fa-reply text-corp-blue"></i>
                <span className="text-sm text-gray-600">
                  Replying to {replyTo.sender?.firstName}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setReplyTo(null)}
                className="h-6 w-6 p-0"
              >
                <i className="fas fa-times text-gray-400"></i>
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {replyTo.content}
            </p>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <i className="fas fa-paperclip text-gray-600"></i>
          </Button>
          <div className="flex-1">
            <Input
              ref={messageInputRef}
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isPending}
            />
          </div>
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <i className="fas fa-smile text-gray-600"></i>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid grid-cols-5 gap-2">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEmojiSelect(emoji)}
                    className="text-lg hover:bg-gray-100"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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
