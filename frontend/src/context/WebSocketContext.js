import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [editLocks, setEditLocks] = useState(new Map());
  const eventHandlersRef = useRef(new Map());

  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      console.log('No user/token found, skipping WebSocket connection');
      return;
    }

    const user = JSON.parse(userStr);

    // Initialize Socket.IO connection
    const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setConnected(true);

      // Register user with the server
      newSocket.emit('register', {
        userId: user.id,
        username: user.username
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    });

    // Handle edit lock synchronization
    newSocket.on('edit-locks-sync', (locks) => {
      const lockMap = new Map(locks);
      setEditLocks(lockMap);
    });

    newSocket.on('edit-lock-acquired', (data) => {
      const lockKey = `${data.itemType}-${data.itemId}`;
      setEditLocks(prev => {
        const newMap = new Map(prev);
        newMap.set(lockKey, data);
        return newMap;
      });
    });

    newSocket.on('edit-lock-released', (data) => {
      const lockKey = `${data.itemType}-${data.itemId}`;
      setEditLocks(prev => {
        const newMap = new Map(prev);
        newMap.delete(lockKey);
        return newMap;
      });
    });

    // Handle lock denied
    newSocket.on('edit-lock-denied', (data) => {
      alert(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Subscribe to events
  const subscribe = useCallback((event, handler) => {
    if (!socket) return () => {};

    socket.on(event, handler);

    // Track the handler
    if (!eventHandlersRef.current.has(event)) {
      eventHandlersRef.current.set(event, new Set());
    }
    eventHandlersRef.current.get(event).add(handler);

    // Return unsubscribe function
    return () => {
      socket.off(event, handler);
      const handlers = eventHandlersRef.current.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }, [socket]);

  // Request edit lock
  const requestEditLock = useCallback((itemId, itemType) => {
    if (!socket || !connected) {
      console.warn('Socket not connected, cannot request lock');
      return Promise.reject(new Error('Not connected'));
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return Promise.reject(new Error('User not found'));
    }

    const user = JSON.parse(userStr);

    return new Promise((resolve, reject) => {
      // Set up one-time listeners for the response
      const onGranted = (data) => {
        if (data.itemId === itemId && data.itemType === itemType) {
          socket.off('edit-lock-granted', onGranted);
          socket.off('edit-lock-denied', onDenied);
          resolve(true);
        }
      };

      const onDenied = (data) => {
        if (data.itemId === itemId && data.itemType === itemType) {
          socket.off('edit-lock-granted', onGranted);
          socket.off('edit-lock-denied', onDenied);
          reject(new Error(data.message));
        }
      };

      socket.on('edit-lock-granted', onGranted);
      socket.on('edit-lock-denied', onDenied);

      // Send the request
      socket.emit('request-edit-lock', {
        itemId,
        itemType,
        userId: user.id,
        username: user.username
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        socket.off('edit-lock-granted', onGranted);
        socket.off('edit-lock-denied', onDenied);
        reject(new Error('Lock request timeout'));
      }, 5000);
    });
  }, [socket, connected]);

  // Release edit lock
  const releaseEditLock = useCallback((itemId, itemType) => {
    if (!socket || !connected) {
      console.warn('Socket not connected, cannot release lock');
      return;
    }

    socket.emit('release-edit-lock', { itemId, itemType });
  }, [socket, connected]);

  // Check if item is locked
  const isItemLocked = useCallback((itemId, itemType) => {
    const lockKey = `${itemType}-${itemId}`;
    return editLocks.has(lockKey);
  }, [editLocks]);

  // Get lock info for an item
  const getLockInfo = useCallback((itemId, itemType) => {
    const lockKey = `${itemType}-${itemId}`;
    return editLocks.get(lockKey);
  }, [editLocks]);

  // Check if current user has the lock
  const hasLock = useCallback((itemId, itemType) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;

    const user = JSON.parse(userStr);
    const lockInfo = getLockInfo(itemId, itemType);

    return lockInfo && lockInfo.userId === user.id;
  }, [getLockInfo]);

  const value = {
    socket,
    connected,
    subscribe,
    requestEditLock,
    releaseEditLock,
    isItemLocked,
    getLockInfo,
    hasLock,
    editLocks
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
