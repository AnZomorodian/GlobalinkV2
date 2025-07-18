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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <GlobalinkLogo className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-semibold text-black mb-2">Welcome to Globalink</h2>
          <p className="text-black">Select a contact to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <Card className="border-b border-gray-200 rounded-none bg-gradient-to-r from-corp-blue to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-white/20">
                <AvatarImage src={selectedContact?.profileImageUrl || ""} />
                <AvatarFallback className="bg-white/20 text-white">
                  {selectedContact?.firstName?.[0]}{selectedContact?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedContact?.firstName} {selectedContact?.lastName}
                </h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedContact?.status === 'online' ? 'bg-green-400' :
                    selectedContact?.status === 'away' ? 'bg-yellow-400' :
                    selectedContact?.status === 'busy' ? 'bg-red-400' : 'bg-gray-300'
                  }`}></div>
                  <p className="text-sm text-white/80">
                    {selectedContact?.status === 'online' ? 'Online' : 
                     selectedContact?.status === 'away' ? 'Away' :
                     selectedContact?.status === 'busy' ? 'Busy' : 'Offline'} • ID: {selectedContact?.id}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={() => onCallStart('voice')} className="hover:bg-white/10 text-black">
                <Phone className="w-4 h-4 text-black" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onCallStart('video')} className="hover:bg-white/10 text-black">
                <Video className="w-4 h-4 text-black" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onContactInfoToggle} className="hover:bg-white/10 text-black">
                <Info className="w-4 h-4 text-black" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-black placeholder:text-black/60 focus:bg-white/20"
              />
              <Search className="absolute left-3 top-2.5 text-black w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <div className={`rounded-2xl p-3 shadow-sm group relative transition-all hover:shadow-md ${
                      isOwn 
                        ? 'bg-gradient-to-r from-corp-blue to-blue-600 text-white' 
                        : 'bg-white border border-gray-200 text-black'
                    }`}>
                      <p className={`text-sm leading-relaxed ${isOwn ? 'text-white' : 'text-black'}`}>{message.content}</p>
                      
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

      {/* Message Input */}
      <Card className="border-t border-gray-200 rounded-none bg-white shadow-lg">
        <CardContent className="p-4">
          {/* Reply Preview */}
          {replyTo && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-corp-blue">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Reply className="w-4 h-4 text-corp-blue" />
                  <span className="text-sm text-gray-700 font-medium">
                    Replying to {replyTo.sender?.firstName}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setReplyTo(null)}
                  className="h-6 w-6 p-0 hover:bg-red-100"
                >
                  <span className="text-gray-400">×</span>
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-1 truncate bg-white p-2 rounded">
                {replyTo.content}
              </p>
            </div>
          )}

          <div className="flex items-end space-x-3">
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFileUpload}
                className="hover:bg-gray-100 text-black"
              >
                <Paperclip className="w-4 h-4 text-black" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
            </div>
            
            <div className="flex-1">
              <Textarea
                ref={messageInputRef}
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendMessageMutation.isPending}
                className="min-h-[40px] max-h-[120px] resize-none border-2 border-gray-200 focus:border-corp-blue rounded-xl bg-gray-50 focus:bg-white transition-colors"
                rows={1}
              />
            </div>
            
            <div className="flex items-center space-x-1">
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-gray-100 text-black"
                  >
                    <Smile className="w-4 h-4 text-black" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-lg hover:bg-gray-100 h-8 w-8 p-0 rounded-full"
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
                className="bg-gradient-to-r from-corp-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full w-10 h-10 p-0 shadow-lg hover:shadow-xl transition-all"
              >
                {sendMessageMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
