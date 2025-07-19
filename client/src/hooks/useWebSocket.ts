import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket(userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000); // Start with 1 second

  const connect = useCallback(() => {
    if (!userId) return;

    try {
      setConnectionState('connecting');
      setLastError(null);

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000; // Reset delay
        
        // Authenticate with the server
        ws.current?.send(JSON.stringify({
          type: 'authenticate',
          userId,
          timestamp: Date.now(),
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(event);
          
          // Handle specific message types
          if (data.type === 'error') {
            console.error('WebSocket server error:', data.message);
            setLastError(data.message);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionState('disconnected');
        
        // Attempt to reconnect if it wasn't a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setConnectionState('disconnected');
        setLastError('Connection failed');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setLastError('Failed to establish connection');
      setConnectionState('disconnected');
    }
  }, [userId]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      setLastError('Connection failed after multiple attempts');
      return;
    }

    reconnectAttempts.current++;
    setConnectionState('reconnecting');
    
    console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts}) in ${reconnectDelay.current}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
      reconnectDelay.current = Math.min(reconnectDelay.current * 1.5, 10000); // Exponential backoff, max 10s
    }, reconnectDelay.current);
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify({
          ...message,
          timestamp: Date.now(),
        }));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        setLastError('Failed to send message');
        return false;
      }
    } else {
      console.warn('WebSocket not connected, message queued for retry');
      setLastError('Not connected');
      return false;
    }
  }, []);

  const forceReconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  return {
    isConnected,
    connectionState,
    lastMessage,
    lastError,
    sendMessage,
    forceReconnect,
  };
}
