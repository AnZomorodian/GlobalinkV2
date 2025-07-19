// Enhanced WebSocket management with queue and retry logic
export interface WSMessage {
  type: string;
  [key: string]: any;
}

export interface WSManagerConfig {
  url: string;
  maxRetries?: number;
  retryDelay?: number;
  heartbeatInterval?: number;
  queueMaxSize?: number;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WSManagerConfig;
  private messageQueue: WSMessage[] = [];
  private eventHandlers: Map<string, Function[]> = new Map();
  private retryCount = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private userId?: string;

  constructor(config: WSManagerConfig) {
    this.config = {
      maxRetries: 5,
      retryDelay: 1000,
      heartbeatInterval: 30000,
      queueMaxSize: 100,
      ...config
    };
  }

  connect(userId?: string) {
    this.userId = userId;
    this.createConnection();
  }

  private createConnection() {
    try {
      this.ws = new WebSocket(this.config.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.retryCount = 0;
        this.emit('connected');
        
        // Authenticate if userId provided
        if (this.userId) {
          this.send({
            type: 'authenticate',
            userId: this.userId
          });
        }

        // Process queued messages
        this.processQueue();
        
        // Start heartbeat
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && this.retryCount < this.config.maxRetries!) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.emit('error', error);
    }
  }

  private scheduleReconnect() {
    this.retryCount++;
    const delay = this.config.retryDelay! * Math.pow(1.5, this.retryCount - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.retryCount}/${this.config.maxRetries})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.createConnection();
    }, delay);

    this.emit('reconnecting', { attempt: this.retryCount, delay });
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping' });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  send(message: WSMessage): boolean {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          ...message,
          timestamp: Date.now()
        }));
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        this.queueMessage(message);
        return false;
      }
    } else {
      this.queueMessage(message);
      return false;
    }
  }

  private queueMessage(message: WSMessage) {
    if (this.messageQueue.length >= this.config.queueMaxSize!) {
      this.messageQueue.shift(); // Remove oldest message
    }
    this.messageQueue.push(message);
  }

  private processQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift()!;
      this.send(message);
    }
  }

  private handleMessage(message: any) {
    this.emit('message', message);
    
    // Handle specific message types
    if (message.type) {
      this.emit(message.type, message);
    }

    // Handle pong response
    if (message.type === 'pong') {
      this.emit('heartbeat', message);
    }
  }

  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler?: Function) {
    if (!this.eventHandlers.has(event)) return;
    
    if (handler) {
      const handlers = this.eventHandlers.get(event)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit(event: string, data?: any) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.isConnected = false;
    this.retryCount = 0;
  }

  getState() {
    return {
      isConnected: this.isConnected,
      retryCount: this.retryCount,
      queueSize: this.messageQueue.length,
      readyState: this.ws?.readyState
    };
  }

  forceReconnect() {
    this.disconnect();
    this.retryCount = 0;
    setTimeout(() => this.connect(this.userId), 100);
  }
}