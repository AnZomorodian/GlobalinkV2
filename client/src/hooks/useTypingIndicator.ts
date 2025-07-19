import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTypingIndicatorProps {
  sendMessage?: (message: any) => void;
  targetUserId?: string;
  delay?: number;
}

export function useTypingIndicator({ 
  sendMessage, 
  targetUserId, 
  delay = 1000 
}: UseTypingIndicatorProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState<{ [userId: string]: boolean }>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (!isTyping && sendMessage && targetUserId) {
      setIsTyping(true);
      sendMessage({
        type: 'typing',
        targetUserId,
        isTyping: true,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && sendMessage && targetUserId) {
        setIsTyping(false);
        sendMessage({
          type: 'typing',
          targetUserId,
          isTyping: false,
        });
      }
    }, delay);
  }, [isTyping, sendMessage, targetUserId, delay]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping && sendMessage && targetUserId) {
      setIsTyping(false);
      sendMessage({
        type: 'typing',
        targetUserId,
        isTyping: false,
      });
    }
  }, [isTyping, sendMessage, targetUserId]);

  const handleTypingMessage = useCallback((fromUserId: string, typing: boolean) => {
    setOtherUserTyping(prev => ({
      ...prev,
      [fromUserId]: typing,
    }));

    // Clear typing status after a timeout if user stops sending typing updates
    if (typing) {
      setTimeout(() => {
        setOtherUserTyping(prev => ({
          ...prev,
          [fromUserId]: false,
        }));
      }, delay + 2000); // Extra buffer
    }
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    otherUserTyping,
    startTyping,
    stopTyping,
    handleTypingMessage,
  };
}