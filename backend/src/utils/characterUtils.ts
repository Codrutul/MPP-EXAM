export const generateRandomStats = () => {
  return {
    level: Math.floor(Math.random() * 30) + 1,
    hp: Math.floor(Math.random() * 2000) + 1000,
    damage: Math.floor(Math.random() * 200) + 100,
    armor: Math.floor(Math.random() * 100) + 1,
    magicResistance: Math.floor(Math.random() * 100) + 1,
    criticalChance: Math.floor(Math.random() * 30) + 1
  };
}; 