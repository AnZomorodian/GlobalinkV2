import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { OnlineIndicator } from '@/components/ui/online-indicator';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiRequest } from '@/lib/queryClient';
import { Phone, Video, Info, Paperclip, Smile, Send } from 'lucide-react';
import { format } from 'date-fns';
import type { ChatWithMembers, MessageWithSender, User } from '@shared/schema';

interface MainChatAreaProps {
  selectedChatId: string | null;
  onVideoCall: (chatId: string) => void;
  onVoiceCall: (chatId: string) => void;
  onShowInfo: () => void;
}

export function MainChatArea({ selectedChatId, onVideoCall, onVoiceCall, onShowInfo }: MainChatAreaProps) {
  const { user } = useAuth();
  const { sendMessage, sendTyping, lastMessage } = useWebSocket();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: chat } = useQuery<ChatWithMembers>({
    queryKey: ['/api/chats', selectedChatId],
    enabled: !!selectedChatId,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: ['/api/chats', selectedChatId, 'messages'],
    enabled: !!selectedChatId,
  });

  const { data: chatMembers = [] } = useQuery<User[]>({
    queryKey: ['/api/chats', selectedChatId, 'members'],
    enabled: !!selectedChatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest('POST', `/api/chats/${selectedChatId}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats', selectedChatId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
    },
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'new_message':
        if (lastMessage.data.chatId === selectedChatId) {
          queryClient.invalidateQueries({ queryKey: ['/api/chats', selectedChatId, 'messages'] });
          queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
        }
        break;
      case 'user_typing':
        if (lastMessage.data.chatId === selectedChatId) {
          const userId = lastMessage.data.userId;
          const isTyping = lastMessage.data.isTyping;
          
          setTypingUsers(prev => {
            if (isTyping) {
              return prev.includes(userId) ? prev : [...prev, userId];
            } else {
              return prev.filter(id => id !== userId);
            }
          });
        }
        break;
    }
  }, [lastMessage, selectedChatId, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChatId) {
      sendMessageMutation.mutate(messageText.trim());
      setMessageText('');
      
      // Clear typing indicator
      sendTyping(selectedChatId, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    
    // Send typing indicator
    if (selectedChatId) {
      sendTyping(selectedChatId, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(selectedChatId, false);
      }, 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (date: Date) => {
    return format(new Date(date), 'h:mm a');
  };

  const getTypingUserNames = () => {
    return typingUsers
      .map(userId => chatMembers.find(member => member.id === userId)?.firstName)
      .filter(Boolean) as string[];
  };

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat to start messaging</h3>
          <p className="text-gray-500">Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src={chat?.avatarUrl || `https://ui-avatars.com/api/?name=${chat?.name}&background=2563eb&color=fff`}
              alt={chat?.name || 'Chat'}
              className={`w-10 h-10 object-cover ${
                chat?.type === 'direct' ? 'rounded-full' : 'rounded-lg'
              }`}
            />
            {chat?.type === 'direct' && chat.members.length > 0 && (
              <OnlineIndicator 
                status={chat.members[0].user.status as any || 'offline'} 
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white"
              />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{chat?.name}</h2>
            <p className="text-sm text-gray-500">
              {chat?.type === 'direct' 
                ? chat.members[0]?.user.companyRole 
                : `${chat?.members.length} members • ${chatMembers.filter(m => m.status === 'online').length} online`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onVoiceCall(selectedChatId)}
            className="p-2 hover:bg-gray-100"
          >
            <Phone className="h-5 w-5 text-gray-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onVideoCall(selectedChatId)}
            className="p-2 hover:bg-gray-100"
          >
            <Video className="h-5 w-5 text-gray-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onShowInfo}
            className="p-2 hover:bg-gray-100"
          >
            <Info className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        {messagesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Phone className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender.id === user?.id;
              
              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isOwn && (
                      <img 
                        src={message.sender.profileImageUrl || `https://ui-avatars.com/api/?name=${message.sender.firstName}+${message.sender.lastName}&background=2563eb&color=fff`}
                        alt={`${message.sender.firstName} ${message.sender.lastName}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                      {!isOwn && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">
                            {message.sender.firstName} {message.sender.lastName}
                          </span>
                          <span className="text-xs text-gray-500">{message.sender.companyRole}</span>
                          <span className="text-xs text-gray-400">
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`rounded-lg p-3 shadow-sm ${
                        isOwn 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        <p className={`text-sm ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                          {message.content}
                        </p>
                      </div>
                      {isOwn && (
                        <div className="flex items-center justify-end space-x-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {formatMessageTime(message.createdAt)}
                          </span>
                          <span className="text-xs text-gray-500">{user?.companyRole}</span>
                          <span className="font-medium text-gray-900 text-sm">You</span>
                        </div>
                      )}
                    </div>
                    {isOwn && (
                      <img 
                        src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=2563eb&color=fff`}
                        alt="Your profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            <TypingIndicator userNames={getTypingUserNames()} />
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
            <Paperclip className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
            <Smile className="h-4 w-4 text-gray-500" />
          </Button>
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="pr-12"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100"
            >
              <Send className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
