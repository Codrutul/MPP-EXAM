import type { Character, GameSession } from '../types';

const API_URL = 'https://mpp-exam.onrender.com/api';

export const api = {
  getCharacters: async (): Promise<Character[]> => {
    console.log('API: Fetching characters');
    const response = await fetch(`${API_URL}/characters`);
    if (!response.ok) {
      console.error('API: Failed to fetch characters', response.status, response.statusText);
      throw new Error('Failed to fetch characters');
    }
    const data = await response.json();
    console.log('API: Received characters', data);
    return data;
  },

  createCharacter: async (character: Omit<Character, '_id'>): Promise<Character> => {
    console.log('API: Creating character', character);
    const response = await fetch(`${API_URL}/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(character),
    });
    if (!response.ok) {
      console.error('API: Failed to create character', response.status, response.statusText);
      throw new Error('Failed to create character');
    }
    const data = await response.json();
    console.log('API: Character created', data);
    return data;
  },

  updateCharacter: async (id: string, character: Omit<Character, '_id'>): Promise<Character> => {
    console.log('API: Updating character', id, character);
    const response = await fetch(`${API_URL}/characters/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(character),
    });
    if (!response.ok) {
      console.error('API: Failed to update character', response.status, response.statusText);
      throw new Error('Failed to update character');
    }
    const data = await response.json();
    console.log('API: Character updated', data);
    return data;
  },

  deleteCharacter: async (id: string): Promise<void> => {
    console.log('API: Deleting character', id);
    const response = await fetch(`${API_URL}/characters/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      console.error('API: Failed to delete character', response.status, response.statusText);
      throw new Error('Failed to delete character');
    }
    console.log('API: Character deleted', id);
  },

  startGameSession: async (characterId: string): Promise<GameSession> => {
    console.log('API: Starting game session for character', characterId);
    const response = await fetch(`${API_URL}/game-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ characterId }),
    });
    if (!response.ok) {
      console.error('API: Failed to start game session', response.status, response.statusText);
      throw new Error('Failed to start game session');
    }
    const data = await response.json();
    console.log('API: Game session started', data);
    return data;
  },

  getGameSession: async (sessionId: string): Promise<GameSession> => {
    console.log('API: Fetching game session', sessionId);
    const response = await fetch(`${API_URL}/game-sessions/${sessionId}`);
    if (!response.ok) {
      console.error('API: Failed to fetch game session', response.status, response.statusText);
      throw new Error('Failed to fetch game session');
    }
    const data = await response.json();
    console.log('API: Received game session', data);
    return data;
  },
}; 