import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, Mic, Image, FileText, Camera, Music, Video } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import VoiceRecorder from './VoiceRecorder';

interface EnhancedChatInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: (content?: string, type?: string, audioData?: any) => void;
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
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
    setShowEmojiPicker(false);
  }, [messageText, setMessageText]);

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    try {
      // Convert blob to base64 for transmission
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onSendMessage(`🎙️ Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`, 'voice', {
          audio: base64data,
          duration: duration
        });
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
    setShowVoiceRecorder(false);
  };

  const handleAttachmentClick = (type: string) => {
    setShowAttachments(false);
    
    const input = document.createElement('input');
    input.type = 'file';
    
    switch (type) {
      case 'image':
        input.accept = 'image/*';
        break;
      case 'video':
        input.accept = 'video/*';
        break;
      case 'audio':
        input.accept = 'audio/*';
        break;
      case 'document':
        input.accept = '.pdf,.doc,.docx,.txt,.xlsx,.pptx';
        break;
      default:
        input.accept = '*';
    }
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Handle file upload
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileData = e.target?.result as string;
          onSendMessage(`📎 ${file.name}`, 'file', {
            fileName: file.name,
            fileType: file.type,
            fileData: fileData,
            fileSize: file.size
          });
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    onInputChange(e);
  };

  if (showVoiceRecorder) {
    return (
      <div className="bg-white border-t border-gray-200 p-4">
        <VoiceRecorder 
          onSendVoice={handleVoiceSend}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      </div>
    );
  }

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
          onClick={() => setShowVoiceRecorder(true)}
          className="h-10 w-10 p-0 rounded-xl floating-element transition-all duration-200 hover:bg-red-500/20 text-red-600"
        >
          <Mic className="w-5 h-5" />
        </Button>

        {/* Send Button */}
        <Button
          onClick={() => onSendMessage(messageText)}
          disabled={!messageText.trim() || isLoading}
          className="h-10 w-10 p-0 rounded-xl modern-button floating-element"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}