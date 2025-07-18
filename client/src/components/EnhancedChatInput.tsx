import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile, Mic, Image, FileText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EnhancedChatInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading?: boolean;
}

const emojis = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
  '😉', '😍', '🥰', '😘', '😗', '😙', '😚', '🙃', '😋', '😛',
  '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
  '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔',
  '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵',
  '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏',
  '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  '✨', '🌟', '💫', '⭐', '🌠', '☄️', '💥', '🔥', '🌈', '☀️',
  '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄'
];

export default function EnhancedChatInput({
  messageText,
  setMessageText,
  onSendMessage,
  onKeyPress,
  onInputChange,
  isLoading = false
}: EnhancedChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEmojiSelect = useCallback((emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = messageText.slice(0, start) + emoji + messageText.slice(end);
      setMessageText(newText);
      
      // Reset cursor position after emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
  }, [messageText, setMessageText]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  const handleAttachmentClick = (type: string) => {
    setShowAttachments(false);
    // TODO: Implement file attachment functionality
    console.log(`Attachment type: ${type}`);
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    onInputChange(e);
  };

  return (
    <div className="p-6 border-t border-white/10 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm">
      <div className="flex items-end space-x-3">
        {/* Attachment Button */}
        <Popover open={showAttachments} onOpenChange={setShowAttachments}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-white/20 rounded-xl floating-element"
            >
              <Paperclip className="w-5 h-5 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="glass-card w-48 p-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAttachmentClick('image')}
                className="w-full justify-start hover:bg-white/20"
              >
                <Image className="w-4 h-4 mr-2" />
                Photo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAttachmentClick('document')}
                className="w-full justify-start hover:bg-white/20"
              >
                <FileText className="w-4 h-4 mr-2" />
                Document
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Main Input Area */}
        <div className="flex-1 relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTextareaChange}
              onKeyPress={onKeyPress}
              placeholder="Type a message..."
              className="w-full min-h-[44px] max-h-[120px] px-4 py-3 pr-20 bg-white/80 border border-white/30 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm resize-none"
              rows={1}
            />
            
            {/* Emoji Button */}
            <div className="absolute right-3 bottom-3 flex items-center space-x-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white/20 rounded-full"
                  >
                    <Smile className="w-4 h-4 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="glass-card w-80 p-3">
                  <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Voice Recording Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleRecording}
          className={`h-10 w-10 p-0 rounded-xl floating-element transition-all duration-200 ${
            isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : 'hover:bg-white/20'
          }`}
        >
          <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-gray-500'}`} />
        </Button>

        {/* Send Button */}
        <Button
          onClick={onSendMessage}
          disabled={!messageText.trim() || isLoading}
          className="h-10 w-10 p-0 rounded-xl modern-button floating-element"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}