// src/hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Custom hook for WebSocket connection
 * Connects to backend WebSocket endpoint and subscribes to user-specific notifications
 *
 * @param {Object} user - Current authenticated user
 * @param {Function} onNotification - Callback when notification is received
 * @returns {Object} - { connected, error, client }
 */
export const useWebSocket = (user, onNotification) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user || !user.id) {
      console.log('⏸️ WebSocket: No user, skipping connection');
      setConnected(false);
      setError(null);
      return;
    }

    console.log('🔌 WebSocket: Attempting to connect for user', user.id);

    // Get auth token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('⚠️ WebSocket: No auth token, skipping connection');
      setConnected(false);
      return;
    }

    // Create STOMP client
    const client = new Client({
      // Use SockJS for fallback compatibility
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws`),

      // Add auth headers
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },

      // Debug logging (disable in production)
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('🔧 STOMP:', str);
        }
      },

      // Reconnect automatically
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // On successful connection
      onConnect: () => {
        console.log('✅ WebSocket connected for user', user.id);
        setConnected(true);
        setError(null);

        // Subscribe to user-specific notification queue
        const destination = `/queue/notifications/${user.id}`;
        client.subscribe(destination, (message) => {
          try {
            const notification = JSON.parse(message.body);
            console.log('📬 Received notification:', notification);

            // Call callback with notification
            if (onNotification) {
              onNotification(notification);
            }
          } catch (err) {
            console.error('❌ Error parsing notification:', err);
          }
        });

        console.log('🔔 Subscribed to notifications:', destination);
      },

      // On connection error
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
        setError(frame.headers['message'] || 'WebSocket connection error');
        setConnected(false);
      },

      // On WebSocket close
      onWebSocketClose: () => {
        console.log('🔌 WebSocket closed');
        setConnected(false);
      },

      // On WebSocket error
      onWebSocketError: (event) => {
        console.error('❌ WebSocket error:', event);
        setError('WebSocket connection failed');
      }
    });

    // Activate the client
    client.activate();
    clientRef.current = client;

    // Cleanup on unmount or user change
    return () => {
      console.log('🔌 WebSocket: Disconnecting...');
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setConnected(false);
    };
  }, [user?.id, onNotification]);

  return {
    connected,
    error,
    client: clientRef.current
  };
};

export default useWebSocket;
