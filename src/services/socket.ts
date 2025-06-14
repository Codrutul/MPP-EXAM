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

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private statsListeners: ((stats: ClassStats[]) => void)[] = [];
  private characterCreatedListeners: ((character: Character) => void)[] = [];

  constructor() {
    console.log('Initializing socket connection...');
    this.socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('statsUpdate', (stats) => {
      console.log('Received stats update:', stats);
      this.statsListeners.forEach(listener => listener(stats));
    });

    this.socket.on('characterCreated', (character) => {
      console.log('Received new character:', character);
      this.characterCreatedListeners.forEach(listener => listener(character));
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  onStatsUpdate(listener: (stats: ClassStats[]) => void) {
    console.log('Adding stats listener');
    this.statsListeners.push(listener);
    // Request initial stats if we're connected
    if (this.socket.connected) {
      this.requestStats();
    }
    return () => {
      console.log('Removing stats listener');
      this.statsListeners = this.statsListeners.filter(l => l !== listener);
    };
  }

  onCharacterCreated(listener: (character: Character) => void) {
    this.characterCreatedListeners.push(listener);
    return () => {
      this.characterCreatedListeners = this.characterCreatedListeners.filter(l => l !== listener);
    };
  }

  toggleAutoGenerate(enabled: boolean) {
    console.log('Toggling auto-generate:', enabled);
    this.socket.emit('toggleAutoGenerate', enabled);
  }

  requestStats() {
    console.log('Requesting stats update');
    this.socket.emit('requestStats');
  }

  disconnect() {
    console.log('Disconnecting socket');
    this.socket.disconnect();
  }
}

export const socketService = new SocketService(); 