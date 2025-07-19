import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  lastError?: string | null;
  onReconnect?: () => void;
  className?: string;
}

export function ConnectionStatus({ 
  isConnected, 
  connectionState, 
  lastError, 
  onReconnect, 
  className 
}: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'text-green-500';
      case 'connecting': 
      case 'reconnecting': return 'text-yellow-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="w-4 h-4" />;
      case 'connecting':
      case 'reconnecting':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'reconnecting': return 'Reconnecting...';
      case 'disconnected': return lastError || 'Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn("flex items-center", getStatusColor())}>
        {getStatusIcon()}
      </div>
      <span className={cn("text-xs font-medium", getStatusColor())}>
        {getStatusText()}
      </span>
      {connectionState === 'disconnected' && onReconnect && (
        <button
          onClick={onReconnect}
          className="text-xs text-blue-500 hover:text-blue-700 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}