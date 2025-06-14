import { useState, useEffect } from 'react';
import type { Character } from '../types';
import './CharacterForm.css';

interface CharacterFormProps {
  character?: Character;
  onSubmit: (character: Omit<Character, 'id'>) => void;
  onCancel: () => void;
}

export const CharacterForm = ({ character, onSubmit, onCancel }: CharacterFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    level: 1,
    hp: 1000,
    damage: 100,
    armor: 50,
    magicResistance: 30,
    criticalChance: 5,
    description: '',
    imageUrl: 'https://static1.srcdn.com/wordpress/wp-content/uploads/2022/04/How-Old-Is-Geralt-of-Rivia.jpg'
  });

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        class: character.class,
        level: character.level,
        hp: character.hp,
        damage: character.damage,
        armor: character.armor,
        magicResistance: character.magicResistance,
        criticalChance: character.criticalChance,
        description: character.description,
        imageUrl: character.imageUrl
      });
    }
  }, [character]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'level' || name === 'hp' || name === 'damage' || name === 'armor' || 
              name === 'magicResistance' || name === 'criticalChance' 
              ? Number(value) 
              : value
    }));
  };

  return (
    <div className="character-form-overlay">
      <form className="character-form" onSubmit={handleSubmit}>
        <h2>{character ? 'Edit Character' : 'Add New Character'}</h2>
        
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="class">Class:</label>
          <select
            id="class"
            name="class"
            value={formData.class}
            onChange={handleChange}
            required
          >
            <option value="">Select a class</option>
            <option value="Warrior">Warrior</option>
            <option value="Rogue">Rogue</option>
            <option value="Mage">Mage</option>
            <option value="Paladin">Paladin</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="level">Level:</label>
            <input
              type="number"
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              min="1"
              max="60"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hp">HP:</label>
            <input
              type="number"
              id="hp"
              name="hp"
              value={formData.hp}
              onChange={handleChange}
              min="100"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="damage">Damage:</label>
            <input
              type="number"
              id="damage"
              name="damage"
              value={formData.damage}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="armor">Armor:</label>
            <input
              type="number"
              id="armor"
              name="armor"
              value={formData.armor}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="magicResistance">Magic Resistance:</label>
            <input
              type="number"
              id="magicResistance"
              name="magicResistance"
              value={formData.magicResistance}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="criticalChance">Critical Chance:</label>
            <input
              type="number"
              id="criticalChance"
              name="criticalChance"
              value={formData.criticalChance}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {character ? 'Save Changes' : 'Add Character'}
          </button>
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}; 