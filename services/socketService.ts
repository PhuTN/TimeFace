import { io, Socket } from 'socket.io-client';
import { authStorage } from '../src/services/authStorage';
import { AppConfig } from '../src/appconfig';


let socket: Socket | null = null;

export const socketService = {
  connect: async () => {
    try {
      const session = await authStorage.load();
      const userId = session?.user?._id;
      if (!userId) return console.log('⚠️ No user found for socket init');

      if (socket && socket.connected) {
        console.log('🔌 Socket already connected');
        return;
      }

      const base = AppConfig.getInstance().get('apiUrl');
      const socketBase = base.replace(/\/api\/?$/, '');

      socket = io(`${socketBase}/ping`, {
        transports: ['websocket'],
        reconnection: true,
      });

      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket?.id);
        socket?.emit('init', { userId });
      });

      socket.on('init:ack', res => {
        console.log('📡 Server ack:', res);
      });

      socket.on('disconnect', reason => {
        console.log('🔴 Socket disconnected:', reason);
      });
    } catch (err) {
      console.error('socketService.connect error:', err);
    }
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('👋 Socket manually disconnected');
    }
  },

  getSocket: () => socket,
};
