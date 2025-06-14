import React from 'react';
import type { GameSession } from '../types';
import geraltImage from '../assets/geralt.jpg';

interface GameWindowProps {
  gameSession: GameSession;
}

const GRID_SIZE = 20;
const CELL_SIZE = 30;

export const GameWindow: React.FC<GameWindowProps> = ({ gameSession }) => {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
    gap: '1px',
    backgroundColor: '#ccc',
    padding: '10px',
    margin: '20px'
  };

  const cellStyle: React.CSSProperties = {
    width: `${CELL_SIZE}px`,
    height: `${CELL_SIZE}px`,
    backgroundColor: 'white',
    border: '1px solid #eee'
  };

  const characterStyle: React.CSSProperties = {
    width: `${CELL_SIZE}px`,
    height: `${CELL_SIZE}px`,
    backgroundImage: `url(${geraltImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative'
  };

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isCharacterHere = x === gameSession.position.x && y === gameSession.position.y;
        grid.push(
          <div
            key={`${x}-${y}`}
            style={{
              ...cellStyle,
              ...(isCharacterHere ? characterStyle : {})
            }}
          >
            {isCharacterHere && (
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                fontSize: '12px'
              }}>
                {gameSession.characterName}
              </div>
            )}
          </div>
        );
      }
    }
    return grid;
  };

  return (
    <div className="game-window">
      <h2>Game Window - {gameSession.characterName}</h2>
      <div style={gridStyle}>
        {renderGrid()}
      </div>
    </div>
  );
}; 