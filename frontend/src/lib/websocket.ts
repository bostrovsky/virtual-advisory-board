import { io, Socket } from 'socket.io-client';
import { WSMessage, Message, Advisor } from '@/types';

class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;

  // Event handlers
  private onMessageHandler: ((message: Message) => void) | null = null;
  private onAdvisorUpdateHandler: ((advisors: Advisor[]) => void) | null = null;
  private onConnectionHandler: ((connected: boolean) => void) | null = null;
  private onErrorHandler: ((error: string) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  connect = () => {
    if (this.isConnecting || this.socket?.connected) return;

    this.isConnecting = true;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

    try {
      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        retries: 3,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleError('Failed to establish WebSocket connection');
      this.isConnecting = false;
    }
  };

  private setupEventListeners = () => {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.onConnectionHandler?.(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnecting = false;
      this.onConnectionHandler?.(false);

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return;
      }

      this.attemptReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    });

    // Message events
    this.socket.on('message', (data: Message) => {
      this.onMessageHandler?.(data);
    });

    this.socket.on('advisor_update', (data: Advisor[]) => {
      this.onAdvisorUpdateHandler?.(data);
    });

    this.socket.on('error', (error: string) => {
      this.handleError(error);
    });

    // Voice events
    this.socket.on('voice_processing', (data) => {
      console.log('Voice processing:', data);
    });

    this.socket.on('voice_response', (data) => {
      console.log('Voice response received:', data);
    });
  };

  private attemptReconnect = () => {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handleError('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  };

  private handleError = (error: string) => {
    console.error('WebSocket error:', error);
    this.onErrorHandler?.(error);
  };

  // Public methods
  sendMessage = (message: string, sessionId: string) => {
    if (!this.socket?.connected) {
      this.handleError('Not connected to server');
      return false;
    }

    try {
      this.socket.emit('user_message', {
        content: message,
        sessionId,
        timestamp: new Date(),
      });
      return true;
    } catch (error) {
      this.handleError('Failed to send message');
      return false;
    }
  };

  sendVoiceData = (audioData: Blob, sessionId: string) => {
    if (!this.socket?.connected) {
      this.handleError('Not connected to server');
      return false;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        this.socket?.emit('voice_data', {
          audio: reader.result,
          sessionId,
          timestamp: new Date(),
        });
      };
      reader.readAsArrayBuffer(audioData);
      return true;
    } catch (error) {
      this.handleError('Failed to send voice data');
      return false;
    }
  };

  startSession = (advisorIds: string[]) => {
    if (!this.socket?.connected) {
      this.handleError('Not connected to server');
      return false;
    }

    try {
      this.socket.emit('start_session', {
        advisorIds,
        timestamp: new Date(),
      });
      return true;
    } catch (error) {
      this.handleError('Failed to start session');
      return false;
    }
  };

  endSession = (sessionId: string) => {
    if (!this.socket?.connected) {
      return false;
    }

    try {
      this.socket.emit('end_session', {
        sessionId,
        timestamp: new Date(),
      });
      return true;
    } catch (error) {
      this.handleError('Failed to end session');
      return false;
    }
  };

  addAdvisor = (advisorId: string, sessionId: string) => {
    if (!this.socket?.connected) {
      this.handleError('Not connected to server');
      return false;
    }

    try {
      this.socket.emit('add_advisor', {
        advisorId,
        sessionId,
        timestamp: new Date(),
      });
      return true;
    } catch (error) {
      this.handleError('Failed to add advisor');
      return false;
    }
  };

  removeAdvisor = (advisorId: string, sessionId: string) => {
    if (!this.socket?.connected) {
      return false;
    }

    try {
      this.socket.emit('remove_advisor', {
        advisorId,
        sessionId,
        timestamp: new Date(),
      });
      return true;
    } catch (error) {
      this.handleError('Failed to remove advisor');
      return false;
    }
  };

  // Event handler setters
  onMessage = (handler: (message: Message) => void) => {
    this.onMessageHandler = handler;
  };

  onAdvisorUpdate = (handler: (advisors: Advisor[]) => void) => {
    this.onAdvisorUpdateHandler = handler;
  };

  onConnection = (handler: (connected: boolean) => void) => {
    this.onConnectionHandler = handler;
  };

  onError = (handler: (error: string) => void) => {
    this.onErrorHandler = handler;
  };

  // Connection status
  get isConnected() {
    return this.socket?.connected || false;
  }

  // Cleanup
  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  };
}

// Singleton instance
export const wsManager = new WebSocketManager();
export default wsManager;