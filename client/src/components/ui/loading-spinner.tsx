import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'gradient' | 'pulse';
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  variant = 'default',
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const getSpinner = () => {
    switch (variant) {
      case 'gradient':
        return (
          <div className={cn(
            "rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 animate-spin relative",
            sizeClasses[size]
          )}>
            <div className="absolute inset-1 bg-white rounded-full" />
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn(
            "rounded-full bg-purple-500 animate-pulse",
            sizeClasses[size]
          )} />
        );
      
      default:
        return (
          <div className={cn(
            "border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin",
            sizeClasses[size]
          )} />
        );
    }
  };

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      {getSpinner()}
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}