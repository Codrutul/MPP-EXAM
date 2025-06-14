import { io, Socket } from 'socket.io-client';
import type { Character, ClassStats } from '../types';

interface ServerToClientEvents {
  statsUpdate: (stats: ClassStats[]) => void;
  characterCreated: (character: Character) => void;
}

interface ClientToServerEvents {
  toggleAutoGenerate: (enabled: boolean) => void;
  requestStats: () => void;
}

export const socket = io('https://mpp-exam.onrender.com', {
  transports: ['websocket'],
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('Socket: Connected to server');
});

socket.on('disconnect', () => {
  console.log('Socket: Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('Socket: Connection error:', error);
});

class SocketService {
  private socket: Socket;
  private characterCreatedListeners: ((character: Character) => void)[] = [];
  private statsUpdateListeners: ((stats: ClassStats) => void)[] = [];

  constructor() {
    console.log('Initializing socket connection...');
    this.socket = io('https://mpp-exam.onrender.com', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('statsUpdate', (stats: ClassStats) => {
      console.log('Received stats update:', stats);
      this.statsUpdateListeners.forEach(listener => listener(stats));
    });

    this.socket.on('characterCreated', (character: Character) => {
      console.log('Character created:', character);
      this.characterCreatedListeners.forEach(listener => listener(character));
    });
  }

  onCharacterCreated(listener: (character: Character) => void) {
    this.characterCreatedListeners.push(listener);
    return () => {
      this.characterCreatedListeners = this.characterCreatedListeners.filter(l => l !== listener);
    };
  }

  onStatsUpdate(listener: (stats: ClassStats) => void) {
    this.statsUpdateListeners.push(listener);
    return () => {
      this.statsUpdateListeners = this.statsUpdateListeners.filter(l => l !== listener);
    };
  }

  requestStats() {
    this.socket.emit('requestStats');
  }

  toggleAutoGenerate(enabled: boolean) {
    console.log('Toggling auto-generate:', enabled);
    this.socket.emit('toggleAutoGenerate', enabled);
  }

  disconnect() {
    console.log('Disconnecting socket');
    this.socket.disconnect();
  }
}

export const socketService = new SocketService();

export const subscribeToCharacterUpdates = (callback: () => void) => {
  socket.on('charactersUpdated', callback);
  return () => {
    socket.off('charactersUpdated', callback);
  };
}; 