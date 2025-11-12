const { Server } = require('socket.io');

class SocketManager {
  constructor() {
    this.io = null;
    this.editLocks = new Map(); // Track which items are being edited
    this.userSockets = new Map(); // Track user ID to socket mapping
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
    console.log('✅ WebSocket server initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle user authentication and registration
      socket.on('register', (data) => {
        const { userId, username } = data;
        socket.userId = userId;
        socket.username = username;
        this.userSockets.set(userId, socket.id);
        
        console.log(`👤 User registered: ${username} (${userId})`);
        
        // Send current edit locks to the newly connected user
        socket.emit('edit-locks-sync', Array.from(this.editLocks.entries()));
      });

      // Handle edit lock requests
      socket.on('request-edit-lock', (data) => {
        const { itemId, itemType, userId, username } = data;
        const lockKey = `${itemType}-${itemId}`;
        
        // Check if item is already locked
        const existingLock = this.editLocks.get(lockKey);
        
        if (existingLock && existingLock.userId !== userId) {
          // Item is locked by someone else
          socket.emit('edit-lock-denied', {
            itemId,
            itemType,
            lockedBy: existingLock.username,
            message: `This ${itemType} is currently being edited by ${existingLock.username}`
          });
        } else {
          // Grant the lock
          this.editLocks.set(lockKey, { userId, username, socketId: socket.id });
          
          // Notify all clients about the lock
          this.io.emit('edit-lock-acquired', {
            itemId,
            itemType,
            userId,
            username
          });
          
          socket.emit('edit-lock-granted', { itemId, itemType });
          console.log(`🔒 Edit lock granted: ${lockKey} to ${username}`);
        }
      });

      // Handle edit lock release
      socket.on('release-edit-lock', (data) => {
        const { itemId, itemType } = data;
        const lockKey = `${itemType}-${itemId}`;
        
        this.editLocks.delete(lockKey);
        
        // Notify all clients that the lock is released
        this.io.emit('edit-lock-released', { itemId, itemType });
        console.log(`🔓 Edit lock released: ${lockKey}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        
        // Release all locks held by this socket
        for (const [lockKey, lock] of this.editLocks.entries()) {
          if (lock.socketId === socket.id) {
            this.editLocks.delete(lockKey);
            const [itemType, itemId] = lockKey.split('-');
            this.io.emit('edit-lock-released', { itemId, itemType });
            console.log(`🔓 Auto-released lock: ${lockKey} (user disconnected)`);
          }
        }
        
        // Remove user from tracking
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
      });
    });
  }

  // Broadcast inventory item changes
  broadcastInventoryUpdate(action, item) {
    if (!this.io) return;
    
    this.io.emit('inventory-update', {
      action, // 'created', 'updated', 'deleted'
      item,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📢 Broadcasted inventory ${action}:`, item.id || 'new item');
  }

  // Broadcast job changes
  broadcastJobUpdate(action, job) {
    if (!this.io) return;
    
    this.io.emit('job-update', {
      action, // 'created', 'updated', 'deleted'
      job,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📢 Broadcasted job ${action}:`, job.id || 'new job');
  }

  // Broadcast job item (parts) changes
  broadcastJobItemUpdate(jobId, action, item) {
    if (!this.io) return;
    
    this.io.emit('job-item-update', {
      jobId,
      action, // 'added', 'updated', 'removed'
      item,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📢 Broadcasted job item ${action} for job:`, jobId);
  }

  // Check if an item is currently locked
  isItemLocked(itemId, itemType) {
    const lockKey = `${itemType}-${itemId}`;
    return this.editLocks.has(lockKey);
  }

  // Get lock info for an item
  getLockInfo(itemId, itemType) {
    const lockKey = `${itemType}-${itemId}`;
    return this.editLocks.get(lockKey);
  }
}

// Create singleton instance
const socketManager = new SocketManager();

module.exports = socketManager;
