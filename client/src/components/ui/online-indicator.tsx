import React from 'react';
import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  status: 'online' | 'away' | 'busy' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export function OnlineIndicator({ 
  status, 
  size = 'md', 
  showPulse = true, 
  className 
}: OnlineIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusClasses = {
    online: 'bg-green-500 ring-green-400',
    away: 'bg-yellow-500 ring-yellow-400',
    busy: 'bg-red-500 ring-red-400',
    offline: 'bg-gray-400 ring-gray-300',
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "rounded-full border-2 border-white",
          sizeClasses[size],
          statusClasses[status]
        )}
      />
      {showPulse && status === 'online' && (
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-75",
            sizeClasses[size],
            "bg-green-400"
          )}
        />
      )}
    </div>
  );
}