/**
 * Real-time Updates System v1.0.0
 * 
 * Kapsamlı real-time güncelleme kütüphanesi:
 * - WebSocket bağlantı yönetimi
 * - Event broadcasting
 * - Room/channel management
 * - Auto-reconnection
 * - Event filtering
 * - Türkçe hata mesajları
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * WebSocket bağlantı durumu
 */
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

/**
 * Event tipi
 */
export enum EventType {
  // Sistem olayları
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  RECONNECT = 'reconnect',
  
  // Veri olayları
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  
  // Özel olaylar
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
  PRESENCE = 'presence',
  TYPING = 'typing'
}

/**
 * WebSocket mesaj formatı
 */
export interface WebSocketMessage<T = any> {
  type: EventType;
  event?: string;           // Özel event adı
  data?: T;                 // Mesaj verisi
  room?: string;            // Oda adı
  from?: string;            // Gönderen ID
  timestamp: number;        // Zaman damgası
  id?: string;              // Mesaj ID
}

/**
 * Event listener
 */
export type EventListener<T = any> = (data: T) => void | Promise<void>;

/**
 * Event kaydı
 */
interface EventRegistration<T = any> {
  listener: EventListener<T>;
  once?: boolean;           // Tek seferlik mi
  filter?: (data: T) => boolean; // Filtre fonksiyonu
}

/**
 * Bağlantı seçenekleri
 */
export interface ConnectionOptions {
  url: string;              // WebSocket URL
  protocols?: string | string[]; // Sub-protocols
  reconnect?: boolean;      // Otomatik yeniden bağlanma
  reconnectInterval?: number; // Yeniden bağlanma aralığı (ms)
  reconnectAttempts?: number; // Maksimum deneme sayısı
  heartbeatInterval?: number; // Heartbeat aralığı (ms)
  heartbeatMessage?: string | object; // Heartbeat mesajı
  autoConnect?: boolean;    // Otomatik bağlanma
  debug?: boolean;          // Debug modu
}

/**
 * Oda seçenekleri
 */
export interface RoomOptions {
  name: string;             // Oda adı
  autoJoin?: boolean;       // Otomatik katılma
  data?: any;               // Oda verisi
}

/**
 * İstatistikler
 */
export interface RealtimeStats {
  connected: boolean;
  connectionState: ConnectionState;
  connectedAt?: Date;
  lastMessageAt?: Date;
  messagesReceived: number;
  messagesSent: number;
  reconnectAttempts: number;
  roomsJoined: number;
  eventListeners: number;
}

/**
 * Presence durumu
 */
export interface PresenceState {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  data?: any;
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Real-time hatası
 */
export class RealtimeError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'RealtimeError';
  }
}

/**
 * Bağlantı hatası
 */
export class ConnectionError extends RealtimeError {
  constructor(message: string, originalError?: Error) {
    super(message, 'CONNECTION_ERROR', originalError);
    this.name = 'ConnectionError';
  }
}

/**
 * Yeniden bağlanma hatası
 */
export class ReconnectError extends RealtimeError {
  constructor(message: string, attempts: number) {
    super(
      `${message} (${attempts} deneme)`,
      'RECONNECT_ERROR'
    );
    this.name = 'ReconnectError';
  }
}

// ============================================================================
// WEBSOCKET CLIENT CLASS
// ============================================================================

/**
 * Real-time WebSocket istemcisi
 */
export class RealtimeClient {
  private ws: WebSocket | null = null;
  private url: string;
  private options: Required<ConnectionOptions>;
  
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  
  private eventListeners = new Map<string, EventRegistration[]>();
  private rooms = new Set<string>();
  private presence = new Map<string, PresenceState>();
  
  private messageQueue: WebSocketMessage[] = [];
  private connectedAt: Date | null = null;
  private lastMessageAt: Date | null = null;
  
  private messagesReceived = 0;
  private messagesSent = 0;
  
  // Static instance for singleton pattern
  private static instance: RealtimeClient | null = null;

  constructor(options: ConnectionOptions) {
    this.url = options.url;
    this.options = {
      protocols: options.protocols || [],
      reconnect: options.reconnect !== false,
      reconnectInterval: options.reconnectInterval || 3000,
      reconnectAttempts: options.reconnectAttempts || 10,
      heartbeatInterval: options.heartbeatInterval || 30000,
      heartbeatMessage: options.heartbeatMessage || { type: 'ping' },
      autoConnect: options.autoConnect !== false,
      debug: options.debug || false
    };

    if (this.options.autoConnect) {
      this.connect();
    }
  }

  // ============================================================================
  // CONNECTION METHODS
  // ============================================================================

  /**
   * WebSocket bağlantısını başlat
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.state === ConnectionState.CONNECTED || 
          this.state === ConnectionState.CONNECTING) {
        resolve();
        return;
      }

      this.setState(ConnectionState.CONNECTING);
      this.debug('Bağlanıyor:', this.url);

      try {
        this.ws = new WebSocket(this.url, this.options.protocols);

        this.ws.onopen = () => this.handleOpen();
        this.ws.onmessage = (event) => this.handleMessage(event);
        this.ws.onerror = (error) => this.handleError(error);
        this.ws.onclose = (event) => this.handleClose(event);

        // Bağlantı başarılı olursa resolve et
        this.once(EventType.CONNECT, () => resolve());
        
        // Hata durumunda reject et
        this.once(EventType.ERROR, (error) => reject(error));
        
      } catch (error) {
        const connectionError = new ConnectionError(
          'Bağlantı hatası',
          error as Error
        );
        this.setState(ConnectionState.ERROR);
        this.emit(EventType.ERROR, connectionError);
        reject(connectionError);
      }
    });
  }

  /**
   * Bağlantıyı kapat
   */
  disconnect(): void {
    this.debug('Bağlantı kesiliyor...');
    
    // Timer'ları temizle
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    // WebSocket'i kapat
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.setState(ConnectionState.DISCONNECTED);
    this.rooms.clear();
  }

  /**
   * Yeniden bağlan
   */
  private reconnect(): void {
    if (this.reconnectAttempts >= this.options.reconnectAttempts) {
      this.emit(EventType.ERROR, new ReconnectError(
        'Maksimum yeniden bağlanma sayısına ulaşıldı',
        this.reconnectAttempts
      ));
      return;
    }

    this.setState(ConnectionState.RECONNECTING);
    this.reconnectAttempts++;
    
    this.debug(
      `Yeniden bağlanılıyor... (${this.reconnectAttempts}/${this.options.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect()
        .then(() => {
          this.reconnectAttempts = 0;
          this.emit(EventType.RECONNECT, { attempts: this.reconnectAttempts });
        })
        .catch((error) => {
          this.reconnect();
        });
    }, this.options.reconnectInterval);
  }

  // ============================================================================
  // MESSAGE HANDLERS
  // ============================================================================

  /**
   * Bağlantı açıldığında
   */
  private handleOpen(): void {
    this.debug('Bağlantı kuruldu');
    this.setState(ConnectionState.CONNECTED);
    this.connectedAt = new Date();
    this.reconnectAttempts = 0;

    // Heartbeat başlat
    if (this.options.heartbeatInterval > 0) {
      this.heartbeatTimer = setInterval(() => {
        this.send(this.options.heartbeatMessage);
      }, this.options.heartbeatInterval);
    }

    // Kuyruktaki mesajları gönder
    this.flushMessageQueue();

    // Odalara tekrar katıl
    this.rooms.forEach(room => this.join(room));

    this.emit(EventType.CONNECT, { connectedAt: this.connectedAt });
  }

  /**
   * Mesaj alındığında
   */
  private handleMessage(event: MessageEvent): void {
    this.lastMessageAt = new Date();
    this.messagesReceived++;

    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.debug('Mesaj alındı:', message);

      // Mesaj tipine göre event tetikle
      this.emit(message.type, message);

      // Özel event varsa tetikle
      if (message.event) {
        this.emit(message.event, message.data || message);
      }

      // Room mesajıysa room event'ini tetikle
      if (message.room) {
        this.emit(`room:${message.room}`, message);
      }

    } catch (error) {
      this.debug('Mesaj ayrıştırma hatası:', error);
    }
  }

  /**
   * Hata oluştuğunda
   */
  private handleError(error: Event): void {
    this.debug('WebSocket hatası:', error);
    this.emit(EventType.ERROR, new ConnectionError(
      'WebSocket hatası',
      new Error(error.toString())
    ));
  }

  /**
   * Bağlantı kapandığında
   */
  private handleClose(event: CloseEvent): void {
    this.debug('Bağlantı kapandı:', event.code, event.reason);

    // Timer'ları temizle
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.connectedAt = null;
    this.emit(EventType.DISCONNECT, { code: event.code, reason: event.reason });

    // Otomatik yeniden bağlanma
    if (this.options.reconnect && event.code !== 1000) {
      this.reconnect();
    } else {
      this.setState(ConnectionState.DISCONNECTED);
    }
  }

  // ============================================================================
  // SENDING METHODS
  // ============================================================================

  /**
   * Mesaj gönder
   */
  send<T>(data: string | object | WebSocketMessage<T>): void {
    if (this.state !== ConnectionState.CONNECTED) {
      // Bağlantı yoksa kuyruğa ekle
      this.messageQueue.push(this.normalizeMessage(data));
      return;
    }

    try {
      const message = this.normalizeMessage(data);
      const serialized = JSON.stringify(message);

      this.ws?.send(serialized);
      this.messagesSent++;
      this.debug('Mesaj gönderildi:', message);

    } catch (error) {
      this.debug('Mesaj gönderme hatası:', error);
      this.emit(EventType.ERROR, new RealtimeError(
        'Mesaj gönderilemedi',
        'SEND_ERROR',
        error as Error
      ));
    }
  }

  /**
   * Odaya mesaj gönder
   */
  sendToRoom<T>(room: string, data: string | object | WebSocketMessage<T>): void {
    const message = this.normalizeMessage(data);
    message.room = room;
    this.send(message);
  }

  /**
   * Broadcast mesaj gönder
   */
  broadcast<T>(event: string, data: T, room?: string): void {
    this.send({
      type: EventType.MESSAGE,
      event,
      data,
      room,
      timestamp: Date.now(),
      id: this.generateMessageId()
    });
  }

  /**
   * Kuyruktaki mesajları gönder
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        const serialized = JSON.stringify(message);
        this.ws?.send(serialized);
      }
    }
  }

  // ============================================================================
  // ROOM METHODS
  // ============================================================================

  /**
   * Odaya katıl
   */
  join(room: string, data?: any): void {
    this.debug('Odaya katılıyor:', room);

    this.send({
      type: 'join',
      room,
      data,
      timestamp: Date.now()
    });

    this.rooms.add(room);
  }

  /**
   * Odadan ayrıl
   */
  leave(room: string): void {
    this.debug('Odadan ayrılıyor:', room);

    this.send({
      type: 'leave',
      room,
      timestamp: Date.now()
    });

    this.rooms.delete(room);
  }

  /**
   * Tüm odalardan ayrıl
   */
  leaveAll(): void {
    this.rooms.forEach(room => this.leave(room));
    this.rooms.clear();
  }

  // ============================================================================
  // EVENT METHODS
  // ============================================================================

  /**
   * Event listener ekle
   */
  on<T>(event: string, listener: EventListener<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event)!.push({ listener });
  }

  /**
   * Tek seferlik event listener ekle
   */
  once<T>(event: string, listener: EventListener<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event)!.push({ listener, once: true });
  }

  /**
   * Event listener ile filtre ekle
   */
  onWithFilter<T>(
    event: string,
    listener: EventListener<T>,
    filter: (data: T) => boolean
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event)!.push({ listener, filter });
  }

  /**
   * Event listener kaldır
   */
  off(event: string, listener?: EventListener): void {
    if (!listener) {
      // Tüm listener'ları kaldır
      this.eventListeners.delete(event);
      return;
    }

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.findIndex(l => l.listener === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Event tetikle
   */
  private emit<T>(event: string, data: T): void {
    const listeners = this.eventListeners.get(event);
    
    if (!listeners || listeners.length === 0) {
      return;
    }

    // Listener'ları kopyala (yinelemeli değişiklikleri önlemek için)
    const listenersCopy = [...listeners];

    for (const registration of listenersCopy) {
      // Filtre kontrolü
      if (registration.filter && !registration.filter(data)) {
        continue;
      }

      // Listener'ı çalıştır
      try {
        registration.listener(data);

        // Once listener'ı kaldır
        if (registration.once) {
          const index = listeners.indexOf(registration);
          if (index !== -1) {
            listeners.splice(index, 1);
          }
        }
      } catch (error) {
        this.debug('Listener hatası:', event, error);
      }
    }
  }

  // ============================================================================
  // PRESENCE METHODS
  // ============================================================================

  /**
   * Presence durumu güncelle
   */
  updatePresence(status: PresenceState['status'], data?: any): void {
    this.broadcast('presence', {
      userId: this.getClientId(),
      status,
      data,
      lastSeen: new Date()
    });
  }

  /**
   * Kullanıcının online olup olmadığını kontrol et
   */
  isOnline(userId: string): boolean {
    const presence = this.presence.get(userId);
    return presence?.status === 'online';
  }

  /**
   * Tüm online kullanıcıları getir
   */
  getOnlineUsers(): string[] {
    return Array.from(this.presence.entries())
      .filter(([_, presence]) => presence.status === 'online')
      .map(([userId]) => userId);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Bağlantı durumunu ayarla
   */
  private setState(state: ConnectionState): void {
    this.state = state;
    this.debug('Durum:', state);
  }

  /**
   * Mesajı normalize et
   */
  private normalizeMessage<T>(
    data: string | object | WebSocketMessage<T>
  ): WebSocketMessage<T> {
    if (typeof data === 'string') {
      return {
        type: EventType.MESSAGE,
        data: data as any,
        timestamp: Date.now(),
        id: this.generateMessageId()
      };
    }

    if ('type' in data && 'timestamp' in data) {
      return data as WebSocketMessage<T>;
    }

    return {
      type: EventType.MESSAGE,
      data: data as any,
      timestamp: Date.now(),
      id: this.generateMessageId()
    };
  }

  /**
   * Mesaj ID üret
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Client ID al
   */
  private getClientId(): string {
    return 'client-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Debug log
   */
  private debug(...args: any[]): void {
    if (this.options.debug) {
      console.log('[Realtime]', ...args);
    }
  }

  // ============================================================================
  // PUBLIC GETTERS
  // ============================================================================

  /**
   * Bağlantı durumu
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Bağlı mı?
   */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  /**
   * İstatistikler
   */
  getStats(): RealtimeStats {
    return {
      connected: this.isConnected(),
      connectionState: this.state,
      connectedAt: this.connectedAt || undefined,
      lastMessageAt: this.lastMessageAt || undefined,
      messagesReceived: this.messagesReceived,
      messagesSent: this.messagesSent,
      reconnectAttempts: this.reconnectAttempts,
      roomsJoined: this.rooms.size,
      eventListeners: Array.from(this.eventListeners.values())
        .reduce((sum, listeners) => sum + listeners.length, 0)
    };
  }

  /**
   * Katılınan odalar
   */
  getRooms(): string[] {
    return Array.from(this.rooms);
  }

  /**
   * Presence durumu
   */
  getPresence(): Map<string, PresenceState> {
    return new Map(this.presence);
  }

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  /**
   * Singleton instance al
   */
  static getInstance(options?: ConnectionOptions): RealtimeClient {
    if (!RealtimeClient.instance && options) {
      RealtimeClient.instance = new RealtimeClient(options);
    }
    return RealtimeClient.instance!;
  }

  /**
   * Singleton instance'ı yok et
   */
  static destroyInstance(): void {
    if (RealtimeClient.instance) {
      RealtimeClient.instance.disconnect();
      RealtimeClient.instance = null;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ConnectionState,
  EventType,
  WebSocketMessage,
  EventListener,
  ConnectionOptions,
  RoomOptions,
  RealtimeStats,
  PresenceState,
  RealtimeError,
  ConnectionError,
  ReconnectError,
  RealtimeClient
};
