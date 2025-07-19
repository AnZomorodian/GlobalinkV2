import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  status: 'online' | 'busy' | 'away' | 'offline';
  className?: string;
}

export function OnlineIndicator({ status, className }: OnlineIndicatorProps) {
  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-300',
  };

  const shouldPulse = status === 'online';

  return (
    <div
      className={cn(
        'w-2 h-2 rounded-full',
        statusColors[status],
        shouldPulse && 'animate-pulse',
        className
      )}
    />
  );
}
