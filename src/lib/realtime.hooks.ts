/**
 * Real-time Updates System - React Hooks v1.0.0
 * 
 * Kapsamlı React hooks:
 * - useRealtime - WebSocket bağlantı yönetimi
 * - useRealtimeEvent - Event dinleme
 * - useRealtimeRoom - Oda yönetimi
 * - usePresence - Presence takibi
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeClient, ConnectionState, EventType } from '../lib/realtime';

// ============================================================================
// USEREALTIME HOOK
// ============================================================================

/**
 * Ana real-time hook
 * 
 * @example
 * const { client, connected, state, stats } = useRealtime({
 *   url: 'ws://localhost:3000',
 *   autoConnect: true
 * });
 */
export function useRealtime(options: {
  url: string;
  autoConnect?: boolean;
  reconnect?: boolean;
  debug?: boolean;
}) {
  const clientRef = useRef<RealtimeClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [error, setError] = useState<Error | null>(null);

  // Client başlat
  useEffect(() => {
    const client = new RealtimeClient({
      url: options.url,
      autoConnect: options.autoConnect,
      reconnect: options.reconnect,
      debug: options.debug
    });

    clientRef.current = client;

    // Event listener'ları kur
    client.on(EventType.CONNECT, () => {
      setConnected(true);
      setState(ConnectionState.CONNECTED);
      setError(null);
    });

    client.on(EventType.DISCONNECT, () => {
      setConnected(false);
      setState(ConnectionState.DISCONNECTED);
    });

    client.on(EventType.ERROR, (err: any) => {
      setError(err);
      setState(ConnectionState.ERROR);
    });

    client.on(EventType.RECONNECT, () => {
      setState(ConnectionState.RECONNECTING);
    });

    // Cleanup
    return () => {
      client.disconnect();
    };
  }, [options.url]);

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const getStats = useCallback(() => {
    return clientRef.current?.getStats();
  }, []);

  return {
    client: clientRef.current,
    connected,
    state,
    error,
    connect,
    disconnect,
    getStats
  };
}

// ============================================================================
// USEREALTIMEEVENT HOOK
// ============================================================================

/**
 * Event dinleme hook
 * 
 * @example
 * const { data, error } = useRealtimeEvent(client, 'message');
 * 
 * @example
 * useRealtimeEvent(client, 'notification', (data) => {
 *   console.log('Bildirim:', data);
 * });
 */
export function useRealtimeEvent<T = any>(
  client: RealtimeClient | null,
  event: string,
  callback?: (data: T) => void
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client) return;

    const listener = (messageData: T) => {
      if (callback) {
        callback(messageData);
      } else {
        setData(messageData);
      }
    };

    client.on<T>(event, listener);

    // Error listener
    const errorListener = (err: any) => {
      setError(err);
    };

    client.on(EventType.ERROR, errorListener);

    return () => {
      client.off(event, listener);
      client.off(EventType.ERROR, errorListener);
    };
  }, [client, event, callback]);

  return { data, error };
}

// ============================================================================
// USEREALTIMEROOM HOOK
// ============================================================================

/**
 * Oda yönetimi hook
 * 
 * @example
 * const { joined, join, leave } = useRealtimeRoom(client, 'room-123');
 */
export function useRealtimeRoom(
  client: RealtimeClient | null,
  room: string,
  options?: {
    autoJoin?: boolean;
  }
) {
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    if (!client || !options?.autoJoin) return;

    // Odaya katıl
    client.join(room);
    setJoined(true);

    // Room event'lerini dinle
    const handleJoin = (data: any) => {
      if (data.userId) {
        setMembers(prev => [...prev, data.userId]);
      }
    };

    const handleLeave = (data: any) => {
      if (data.userId) {
        setMembers(prev => prev.filter(id => id !== data.userId));
      }
    };

    client.on(`room:${room}:join`, handleJoin);
    client.on(`room:${room}:leave`, handleLeave);

    return () => {
      client.off(`room:${room}:join`, handleJoin);
      client.off(`room:${room}:leave`, handleLeave);
      client.leave(room);
      setJoined(false);
    };
  }, [client, room, options?.autoJoin]);

  const join = useCallback(() => {
    if (client) {
      client.join(room);
      setJoined(true);
    }
  }, [client, room]);

  const leave = useCallback(() => {
    if (client) {
      client.leave(room);
      setJoined(false);
    }
  }, [client, room]);

  return { joined, members, join, leave };
}

// ============================================================================
// USEPRESENCE HOOK
// ============================================================================

/**
 * Presence takibi hook
 * 
 * @example
 * const { onlineUsers, isUserOnline } = usePresence(client);
 */
export function usePresence(client: RealtimeClient | null) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [presenceMap, setPresenceMap] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (!client) return;

    // Presence event'lerini dinle
    const handlePresence = (data: any) => {
      setPresenceMap(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, data);
        return newMap;
      });

      if (data.status === 'online') {
        setOnlineUsers(prev => new Set(prev).add(data.userId));
      } else {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    client.on('presence', handlePresence);

    return () => {
      client.off('presence', handlePresence);
    };
  }, [client]);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  return {
    onlineUsers: Array.from(onlineUsers),
    presenceMap,
    isUserOnline
  };
}

// ============================================================================
// USEREALTIMEMESSAGE HOOK
// ============================================================================

/**
 * Mesaj gönderme hook
 * 
 * @example
 * const { sendMessage, broadcast } = useRealtimeMessage(client);
 * 
 * sendMessage('Merhaba!');
 * broadcast('notification', { text: 'Yeni mesaj' });
 */
export function useRealtimeMessage(client: RealtimeClient | null) {
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback((data: any) => {
    if (!client || !client.isConnected()) {
      throw new Error('WebSocket bağlı değil');
    }

    setSending(true);
    client.send(data);
    setSending(false);
  }, [client]);

  const broadcast = useCallback((event: string, data: any, room?: string) => {
    if (!client || !client.isConnected()) {
      throw new Error('WebSocket bağlı değil');
    }

    setSending(true);
    client.broadcast(event, data, room);
    setSending(false);
  }, [client]);

  const sendToRoom = useCallback((room: string, data: any) => {
    if (!client || !client.isConnected()) {
      throw new Error('WebSocket bağlı değil');
    }

    setSending(true);
    client.sendToRoom(room, data);
    setSending(false);
  }, [client]);

  return {
    sending,
    sendMessage,
    broadcast,
    sendToRoom
  };
}

// ============================================================================
// USEREALTIMESTATS HOOK
// ============================================================================

/**
 * Real-time istatistikleri hook
 * 
 * @example
 * const stats = useRealtimeStats(client);
 * console.log(stats.messagesReceived, stats.messagesSent);
 */
export function useRealtimeStats(client: RealtimeClient | null) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!client) return;

    // İlk istatistikleri al
    setStats(client.getStats());

    // Her saniye istatistikleri güncelle
    const interval = setInterval(() => {
      setStats(client.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [client]);

  return stats;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  useRealtime,
  useRealtimeEvent,
  useRealtimeRoom,
  usePresence,
  useRealtimeMessage,
  useRealtimeStats
};
