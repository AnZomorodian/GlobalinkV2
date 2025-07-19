import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: Date;
  className?: string;
  showTimestamp?: boolean;
}

export function MessageStatus({ status, timestamp, className, showTimestamp = true }: MessageStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending': return 'Sending...';
      case 'sent': return 'Sent';
      case 'delivered': return 'Delivered';
      case 'read': return 'Read';
      case 'failed': return 'Failed to send';
      default: return '';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={cn("flex items-center space-x-1 text-xs", className)}>
      {getStatusIcon()}
      {showTimestamp && timestamp && (
        <span className="text-gray-500">
          {formatTime(timestamp)}
        </span>
      )}
      <span className={cn(
        "text-gray-500",
        status === 'failed' && "text-red-500",
        status === 'read' && "text-blue-500"
      )}>
        {getStatusText()}
      </span>
    </div>
  );
}