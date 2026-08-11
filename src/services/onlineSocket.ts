import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getOnlineSocket(): Socket {
  if (!socketInstance) {
    // Connect to current origin port where server.ts serves Express + Socket.IO
    socketInstance = io(window.location.origin, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[OnlineSocket] Connected to Socket.IO server with id:', socketInstance?.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('[OnlineSocket] Disconnected from Socket.IO server');
    });
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
}
