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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Reply, Copy, Paperclip, Send, Smile, Search, Phone, Video, Info, MoreHorizontal } from "lucide-react";
import EnhancedChatInput from './EnhancedChatInput';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import ModernMessageBubble from './ModernMessageBubble';
import GlobalinkLogo from "./GlobalinkLogo";
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

  const emojis = ["😀", "😂", "😊", "😍", "🤔", "😢", "😡", "👍", "👎", "❤️", "🎉", "🔥", "💯", "👏", "🙏", "🎊", "✨", "⚡", "🌟", "💫"];
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    mutationFn: async ({ content, type = "text", audioData }: { content: string, type?: string, audioData?: any }) => {
      const payload: any = {
        receiverId: selectedContactId,
        content,
        messageType: type,
        replyToId: replyTo?.id || null,
      };
      
      if (audioData) {
        payload.audioData = audioData;
      }
      
      await apiRequest("POST", "/api/messages", payload);
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

  const handleSendMessage = (content?: string, type?: string, audioData?: any) => {
    const messageContent = content || messageInput.trim();
    if (!messageContent || !selectedContactId) return;
    sendMessageMutation.mutate({ content: messageContent, type, audioData });
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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, just show the file name in the message
      setMessageInput(prev => prev + `[File: ${file.name}]`);
      toast({
        title: "File Selected",
        description: `Selected: ${file.name}`,
      });
    }
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
      <div className="flex-1 flex flex-col glass-panel relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl"></div>
        
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="mx-auto mb-6 floating-element">
              <GlobalinkLogo size="xl" showText={false} className="drop-shadow-2xl" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-bold gradient-text">Welcome to GLOBALINK</h3>
              <p className="text-gray-600 text-lg">Connect, collaborate, and communicate</p>
              <p className="text-gray-500">Select a contact to start your conversation</p>
            </div>
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Secure Messaging</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <span>Voice & Video Calls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span>File Sharing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Modern Chat Header */}
      <div className="glass-panel border-b border-white/20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20"></div>
        <div className="absolute top-0 right-0 w-32 h-16 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-14 h-14 ring-3 ring-white/30 shadow-lg">
                  <AvatarImage src={selectedContact?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-lg font-semibold">
                    {selectedContact?.firstName?.[0]}{selectedContact?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                  selectedContact?.status === 'online' ? 'bg-green-400' :
                  selectedContact?.status === 'away' ? 'bg-yellow-400' :
                  selectedContact?.status === 'busy' ? 'bg-red-400' : 'bg-gray-300'
                }`}></div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedContact?.firstName} {selectedContact?.lastName}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedContact?.status === 'online' ? 'Online' : 
                     selectedContact?.status === 'away' ? 'Away' :
                     selectedContact?.status === 'busy' ? 'Busy' : 'Offline'}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500 font-mono">ID: {selectedContact?.id}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onCallStart('voice')} className="h-10 w-10 p-0 hover:bg-white/20 rounded-xl floating-element">
                <Phone className="w-5 h-5 text-gray-700" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onCallStart('video')} className="h-10 w-10 p-0 hover:bg-white/20 rounded-xl floating-element">
                <Video className="w-5 h-5 text-gray-700" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onContactInfoToggle} className="h-10 w-10 p-0 hover:bg-white/20 rounded-xl floating-element">
                <Info className="w-5 h-5 text-gray-700" />
              </Button>
            </div>
          </div>

          {/* Modern Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white/80 border border-white/30 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="space-y-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-corp-blue"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-black py-20">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <Send className="w-8 h-8 text-black" />
              </div>
              <p className="text-lg font-medium text-black">No messages yet</p>
              <p className="text-sm text-black">Start the conversation!</p>
            </div>
          ) : (
            filteredMessages.reverse().map((message: any) => {
              const isOwn = message.senderId === currentUser.id;
              return (
                <div key={message.id} className={`flex items-start space-x-3 ${isOwn ? 'justify-end' : ''}`}>
                  {!isOwn && (
                    <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm">
                      <AvatarImage src={selectedContact?.profileImageUrl || ""} />
                      <AvatarFallback className="bg-gray-100">
                        {selectedContact?.firstName?.[0]}{selectedContact?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-first' : ''}`}>
                    {message.replyToId && (
                      <div className="mb-2 opacity-75">
                        <div className="text-xs text-gray-500 border-l-2 border-corp-blue pl-2 bg-gray-50 rounded p-2">
                          <Reply className="w-3 h-3 inline mr-1" />
                          Replying to message
                        </div>
                      </div>
                    )}
                    <div className={`rounded-2xl p-4 shadow-sm group relative transition-all hover:shadow-md ${
                      isOwn 
                        ? 'message-bubble-own' 
                        : 'message-bubble-other'
                    }`}>
                      {message.messageType === 'voice' && message.audioData ? (
                        <VoiceMessagePlayer 
                          audioData={message.audioData.audio}
                          duration={message.audioData.duration}
                          isOwn={isOwn}
                        />
                      ) : (
                        <p className={`text-sm leading-relaxed message-text ${
                          isOwn ? 'text-white' : 'text-visible'
                        }`}>
                          {message.content}
                        </p>
                      )}
                      
                      {/* Message Actions */}
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center space-x-1 bg-white rounded-full shadow-lg p-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleReply(message)}
                            className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                          >
                            <Reply className="w-3 h-3 text-black" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCopy(message.content)}
                            className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                          >
                            <Copy className="w-3 h-3 text-black" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : ''}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                  {isOwn && (
                    <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm">
                      <AvatarImage src={currentUser.profileImageUrl || ""} />
                      <AvatarFallback className="bg-corp-blue text-white">
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
      </ScrollArea>

      {/* Enhanced Message Input */}
      <EnhancedChatInput
        messageText={messageInput}
        setMessageText={setMessageInput}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
        onInputChange={(e) => setMessageInput(e.target.value)}
        isLoading={sendMessageMutation.isPending}
      />
    </div>
  );
}
