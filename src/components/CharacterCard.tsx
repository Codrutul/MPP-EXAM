import React, { useState } from 'react';
import type { Character } from '../types';
import { api } from '../services/api';
import geraltImage from '../assets/geralt.jpg';

interface CharacterCardProps {
  character: Character;
  onDelete: (id: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = async () => {
    try {
      setIsLoading(true);
      const session = await api.startGameSession(character.id);
      // Open game window in a new window
      const gameWindow = window.open('', '_blank', 'width=800,height=800');
      if (gameWindow) {
        gameWindow.document.write(`
          <html>
            <head>
              <title>Game - ${character.name}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .game-grid { 
                  display: grid;
                  grid-template-columns: repeat(20, 30px);
                  gap: 1px;
                  background-color: #ccc;
                  padding: 10px;
                  margin: 20px;
                }
                .grid-cell {
                  width: 30px;
                  height: 30px;
                  background-color: white;
                  border: 1px solid #eee;
                  position: relative;
                }
                .character {
                  width: 100%;
                  height: 100%;
                  background-image: url(${geraltImage});
                  background-size: cover;
                  background-position: center;
                }
                .character-name {
                  position: absolute;
                  bottom: -20px;
                  left: 50%;
                  transform: translateX(-50%);
                  white-space: nowrap;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <h2>Game Window - ${character.name}</h2>
              <div class="game-grid">
                ${Array.from({ length: 400 }).map((_, i) => {
                  const x = i % 20;
                  const y = Math.floor(i / 20);
                  const isCharacterHere = x === session.position.x && y === session.position.y;
                  return `
                    <div class="grid-cell">
                      ${isCharacterHere ? `
                        <div class="character">
                          <div class="character-name">${character.name}</div>
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="character-card">
      <img src={geraltImage} alt={character.name} className="character-image" />
      <h3>{character.name}</h3>
      <p className="character-class">Class: {character.class}</p>
      <p>Level: {character.level}</p>
      <div className="character-stats">
        <p>HP: {character.hp}</p>
        <p>Damage: {character.damage}</p>
        <p>Armor: {character.armor}</p>
        <p>Magic Resistance: {character.magicResistance}</p>
        <p>Critical Chance: {character.criticalChance}%</p>
      </div>
      <p className="character-description">{character.description}</p>
      <div className="character-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button 
          onClick={() => onDelete(character.id)}
          className="delete-button"
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Delete
        </button>
        <button 
          onClick={handleStartGame}
          className="start-game-button"
          disabled={isLoading}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Starting...' : 'Start Game'}
        </button>
      </div>
    </div>
  );
}; 