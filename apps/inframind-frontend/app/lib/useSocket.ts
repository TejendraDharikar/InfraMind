import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to the Socket.io server
    const socketIo = io(SOCKET_URL, {
      withCredentials: true,
    });

    setSocket(socketIo);

    socketIo.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
    });

    socketIo.on('disconnect', () => {
      console.log('🔴 Disconnected from WebSocket server');
    });

    // Cleanup on unmount
    return () => {
      socketIo.disconnect();
    };
  }, []);

  return socket;
}
