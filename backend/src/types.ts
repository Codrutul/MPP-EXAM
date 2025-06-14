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
  name: string;
  count: number;
  avgLevel: number;
  avgHP: number;
  avgDamage: number;
  avgArmor: number;
} 