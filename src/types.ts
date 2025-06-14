export interface CharacterCreate {
  name: string;
  class: string;
  level: number;
  hp: number;
  damage: number;
  armor: number;
  magicResistance: number;
  criticalChance: number;
  imageUrl: string;
  description: string;
}

export interface Character extends CharacterCreate {
  id: string;
}

export interface ClassStats {
  class: string;
  count: number;
  averageLevel: number;
  averageHp: number;
  averageDamage: number;
}

export interface GameSession {
  _id: string;
  characterId: string;
  characterName: string;
  position: {
    x: number;
    y: number;
  };
  createdAt: string;
} 