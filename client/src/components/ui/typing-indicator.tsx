import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  isVisible: boolean;
  userName?: string;
  className?: string;
}

export function TypingIndicator({ isVisible, userName, className }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className={cn("flex items-center space-x-3 p-3 rounded-xl bg-gray-50/80 backdrop-blur-sm", className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-gray-600 font-medium">
        {userName ? `${userName} is typing...` : 'Someone is typing...'}
      </span>
    </div>
  );
}