import { useState, useEffect } from 'react';
import type { Character } from '../types';
import { CharacterForm } from './CharacterForm';
import { Statistics } from './Statistics';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import './CharacterList.css';

const CLASSES = ['Warrior', 'Rogue', 'Mage', 'Paladin'];
const NAMES_PREFIX = ['Brave', 'Swift', 'Mighty', 'Wise', 'Dark', 'Light', 'Storm', 'Fire', 'Ice'];
const NAMES_SUFFIX = ['blade', 'heart', 'soul', 'mind', 'fist', 'spirit', 'walker', 'weaver', 'master'];

const generateRandomCharacter = (id: number): Omit<Character, 'id'> => {
  const randomClass = CLASSES[Math.floor(Math.random() * CLASSES.length)];
  const prefix = NAMES_PREFIX[Math.floor(Math.random() * NAMES_PREFIX.length)];
  const suffix = NAMES_SUFFIX[Math.floor(Math.random() * NAMES_SUFFIX.length)];
  
  return {
    name: `${prefix}${suffix}`,
    class: randomClass,
    level: Math.floor(Math.random() * 30) + 1,
    hp: Math.floor(Math.random() * 2000) + 1000,
    damage: Math.floor(Math.random() * 200) + 100,
    armor: Math.floor(Math.random() * 100) + 1,
    magicResistance: Math.floor(Math.random() * 100) + 1,
    criticalChance: Math.floor(Math.random() * 30) + 1,
    imageUrl: "https://static1.srcdn.com/wordpress/wp-content/uploads/2022/04/How-Old-Is-Geralt-of-Rivia.jpg",
    description: `A mysterious ${randomClass.toLowerCase()} known for their exceptional abilities and unique fighting style.`
  };
};

export const CharacterList = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial characters
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const data = await api.getCharacters();
        setCharacters(data);
        if (data.length > 0 && !selectedCharacter) {
          setSelectedCharacter(data[0]);
        }
      } catch (err) {
        setError('Failed to fetch characters');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  // Setup WebSocket listeners
  useEffect(() => {
    console.log('Setting up WebSocket listeners');
    const unsubscribeCharacter = socketService.onCharacterCreated((character) => {
      console.log('New character received:', character);
      setCharacters(prev => [...prev, character]);
    });

    return () => {
      console.log('Cleaning up WebSocket listeners');
      unsubscribeCharacter();
    };
  }, []);

  // Toggle auto-generation
  useEffect(() => {
    console.log('Toggling auto-generation:', isAutoCreating);
    socketService.toggleAutoGenerate(isAutoCreating);
  }, [isAutoCreating]);

  const handleAddCharacter = async (characterData: Omit<Character, 'id'>) => {
    try {
      const newCharacter = await api.createCharacter(characterData);
      setCharacters(prev => [...prev, newCharacter]);
      setShowForm(false);
    } catch (err) {
      setError('Failed to create character');
      console.error(err);
    }
  };

  const handleEditCharacter = async (characterData: Omit<Character, 'id'>) => {
    if (!editingCharacter) return;
    
    try {
      const updatedCharacter = await api.updateCharacter(editingCharacter.id, characterData);
      setCharacters(prev =>
        prev.map(char => char.id === editingCharacter.id ? updatedCharacter : char)
      );
      setEditingCharacter(null);
      setShowForm(false);
    } catch (err) {
      setError('Failed to update character');
      console.error(err);
    }
  };

  const handleDeleteCharacter = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      try {
        await api.deleteCharacter(id);
        setCharacters(prev => prev.filter(char => char.id !== id));
        if (selectedCharacter?.id === id) {
          setSelectedCharacter(characters.find(c => c.id !== id) || null);
        }
      } catch (err) {
        setError('Failed to delete character');
        console.error(err);
      }
    }
  };

  const startEditing = (character: Character) => {
    setEditingCharacter(character);
    setShowForm(true);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (isLoading) {
    return <div className="loading">Loading characters...</div>;
  }

  return (
    <div className="app-content">
      <div className="character-container">
        <div className="character-list">
          <div className="list-header">
            <h2>Characters</h2>
            <div className="header-actions">
              <button 
                className={`btn-auto ${isAutoCreating ? 'active' : ''}`}
                onClick={() => setIsAutoCreating(!isAutoCreating)}
              >
                {isAutoCreating ? 'Stop Auto Create' : 'Start Auto Create'}
              </button>
              <button className="btn-add" onClick={() => setShowForm(true)}>
                Add Character
              </button>
            </div>
          </div>
          
          {characters.map(character => (
            <div
              key={character.id}
              className={`character-item ${selectedCharacter?.id === character.id ? 'selected' : ''}`}
              onClick={() => setSelectedCharacter(character)}
            >
              <div className="character-item-content">
                <h3>{character.name}</h3>
                <div className="character-brief">
                  <span>Level {character.level}</span>
                  <span>{character.class}</span>
                </div>
              </div>
              <div className="character-actions">
                <button 
                  className="btn-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(character);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCharacter(character.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {selectedCharacter && (
          <div className="character-details">
            <img 
              src={selectedCharacter.imageUrl} 
              alt={selectedCharacter.name}
              className="character-image"
            />
            <h2>{selectedCharacter.name}</h2>
            <p className="character-description">{selectedCharacter.description}</p>
            
            <div className="stats-grid">
              <div className="stat-item">
                <label>Level:</label>
                <span>{selectedCharacter.level}</span>
              </div>
              <div className="stat-item">
                <label>Class:</label>
                <span>{selectedCharacter.class}</span>
              </div>
              <div className="stat-item">
                <label>HP:</label>
                <span>{selectedCharacter.hp}</span>
              </div>
              <div className="stat-item">
                <label>Damage:</label>
                <span>{selectedCharacter.damage}</span>
              </div>
              <div className="stat-item">
                <label>Armor:</label>
                <span>{selectedCharacter.armor}</span>
              </div>
              <div className="stat-item">
                <label>Magic Res:</label>
                <span>{selectedCharacter.magicResistance}</span>
              </div>
              <div className="stat-item">
                <label>Crit Chance:</label>
                <span>{selectedCharacter.criticalChance}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="statistics-container">
        <Statistics />
      </div>

      {showForm && (
        <CharacterForm
          character={editingCharacter || undefined}
          onSubmit={editingCharacter ? handleEditCharacter : handleAddCharacter}
          onCancel={() => {
            setShowForm(false);
            setEditingCharacter(null);
          }}
        />
      )}
    </div>
  );
}; 