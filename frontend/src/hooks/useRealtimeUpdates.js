import { useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

/**
 * Hook for listening to real-time inventory updates
 * @param {Object} callbacks - Object with onCreated, onUpdated, onDeleted callbacks
 */
export const useInventoryUpdates = (callbacks) => {
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    if (!connected || !subscribe) return;

    const unsubscribe = subscribe('inventory-update', (data) => {
      const { action, item } = data;

      switch (action) {
        case 'created':
          callbacks.onCreated && callbacks.onCreated(item);
          break;
        case 'updated':
          callbacks.onUpdated && callbacks.onUpdated(item);
          break;
        case 'deleted':
          callbacks.onDeleted && callbacks.onDeleted(item);
          break;
        default:
          console.warn('Unknown inventory action:', action);
      }
    });

    return unsubscribe;
  }, [subscribe, connected, callbacks]);
};

/**
 * Hook for listening to real-time job updates
 * @param {Object} callbacks - Object with onCreated, onUpdated, onDeleted callbacks
 */
export const useJobUpdates = (callbacks) => {
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    if (!connected || !subscribe) return;

    const unsubscribe = subscribe('job-update', (data) => {
      const { action, job } = data;

      switch (action) {
        case 'created':
          callbacks.onCreated && callbacks.onCreated(job);
          break;
        case 'updated':
          callbacks.onUpdated && callbacks.onUpdated(job);
          break;
        case 'deleted':
          callbacks.onDeleted && callbacks.onDeleted(job);
          break;
        default:
          console.warn('Unknown job action:', action);
      }
    });

    return unsubscribe;
  }, [subscribe, connected, callbacks]);
};

/**
 * Hook for listening to real-time job item updates
 * @param {number} jobId - The job ID to listen for
 * @param {Object} callbacks - Object with onAdded, onUpdated, onRemoved callbacks
 */
export const useJobItemUpdates = (jobId, callbacks) => {
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    if (!connected || !subscribe || !jobId) return;

    const unsubscribe = subscribe('job-item-update', (data) => {
      // Only process updates for the specific job
      if (data.jobId !== jobId) return;

      const { action, item } = data;

      switch (action) {
        case 'added':
          callbacks.onAdded && callbacks.onAdded(item);
          break;
        case 'updated':
          callbacks.onUpdated && callbacks.onUpdated(item);
          break;
        case 'removed':
          callbacks.onRemoved && callbacks.onRemoved(item);
          break;
        default:
          console.warn('Unknown job item action:', action);
      }
    });

    return unsubscribe;
  }, [subscribe, connected, jobId, callbacks]);
};

/**
 * Hook for managing edit locks on items
 * @param {string} itemType - Type of item (e.g., 'inventory', 'job')
 */
export const useEditLock = (itemType) => {
  const {
    requestEditLock,
    releaseEditLock,
    isItemLocked,
    getLockInfo,
    hasLock
  } = useWebSocket();

  const acquireLock = async (itemId) => {
    try {
      await requestEditLock(itemId, itemType);
      return true;
    } catch (error) {
      console.error('Failed to acquire lock:', error);
      alert(error.message);
      return false;
    }
  };

  const releaseLock = (itemId) => {
    releaseEditLock(itemId, itemType);
  };

  const checkLock = (itemId) => {
    return isItemLocked(itemId, itemType);
  };

  const getLock = (itemId) => {
    return getLockInfo(itemId, itemType);
  };

  const checkHasLock = (itemId) => {
    return hasLock(itemId, itemType);
  };

  return {
    acquireLock,
    releaseLock,
    checkLock,
    getLock,
    checkHasLock
  };
};
