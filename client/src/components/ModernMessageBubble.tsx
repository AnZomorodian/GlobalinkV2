import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Reply, Edit3, Trash2, Copy, Heart, Laugh, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  reactions?: { emoji: string; count: number; userIds: string[] }[];
  edited?: boolean;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

interface ModernMessageBubbleProps {
  message: Message;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  isOwnMessage: boolean;
  currentUserId: string;
  onReply?: (message: Message) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
}

const quickReactions = [
  { emoji: '❤️', icon: Heart },
  { emoji: '😂', icon: Laugh },
  { emoji: '👍', icon: ThumbsUp },
];

export default function ModernMessageBubble({
  message,
  sender,
  isOwnMessage,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReaction
}: ModernMessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  
  const handleReaction = (emoji: string) => {
    onReaction?.(message.id, emoji);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group animate-fade-in`}>
      <div className={`flex max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwnMessage && (
          <div className="mr-3 flex-shrink-0">
            <Avatar className="w-8 h-8 ring-2 ring-white/50">
              <AvatarImage src={sender.profileImageUrl || ""} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs">
                {sender.firstName?.[0]}{sender.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Message Content */}
        <div className="flex flex-col">
          {/* Reply Context */}
          {message.replyTo && (
            <div className="mb-2 ml-3 pl-3 border-l-2 border-purple-400 bg-white/40 rounded-r-lg p-2">
              <p className="text-xs text-gray-600 font-medium">{message.replyTo.senderName}</p>
              <p className="text-xs text-gray-500 truncate">{message.replyTo.content}</p>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`message-bubble relative ${
              isOwnMessage ? 'sent' : 'received'
            }`}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                
                {/* Message Info */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs opacity-70">
                      {formatTime(message.createdAt)}
                    </span>
                    {message.edited && (
                      <span className="text-xs opacity-60 italic">edited</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Actions */}
              <div className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                isOwnMessage ? 'order-first mr-2 ml-0' : ''
              }`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-white/20 rounded-full"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-card w-48">
                    <DropdownMenuItem onClick={() => onReply?.(message)}>
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </DropdownMenuItem>
                    {isOwnMessage && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit?.(message.id)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete?.(message.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Quick Reactions */}
            {showReactions && (
              <div className={`absolute -top-8 ${isOwnMessage ? 'right-0' : 'left-0'} flex space-x-1 animate-slide-up`}>
                {quickReactions.map((reaction, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(reaction.emoji)}
                    className="h-6 w-6 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
                  >
                    <span className="text-sm">{reaction.emoji}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 ml-3">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => handleReaction(reaction.emoji)}
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
                    reaction.userIds.includes(currentUserId)
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-white/60 hover:bg-white/80 text-gray-700'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span className="font-medium">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}