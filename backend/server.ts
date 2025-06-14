import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { Character, CharacterCreate } from './types';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage
let characters: Character[] = [];

// Character generation constants
const CLASSES = ['Warrior', 'Rogue', 'Mage', 'Paladin'];
const NAMES_PREFIX = ['Brave', 'Swift', 'Mighty', 'Wise', 'Dark', 'Light', 'Storm', 'Fire', 'Ice'];
const NAMES_SUFFIX = ['blade', 'heart', 'soul', 'mind', 'fist', 'spirit', 'walker', 'weaver', 'master'];

// Helper function to generate random character
const generateRandomCharacter = (): CharacterCreate => {
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

// Calculate statistics
const calculateStats = () => {
  const classCounts = new Map<string, number>();
  const classStats = new Map<string, { 
    levels: number[], 
    hps: number[],
    damages: number[],
    armors: number[]
  }>();

  characters.forEach(char => {
    classCounts.set(char.class, (classCounts.get(char.class) || 0) + 1);
    
    if (!classStats.has(char.class)) {
      classStats.set(char.class, {
        levels: [],
        hps: [],
        damages: [],
        armors: []
      });
    }
    
    const stats = classStats.get(char.class)!;
    stats.levels.push(char.level);
    stats.hps.push(char.hp);
    stats.damages.push(char.damage);
    stats.armors.push(char.armor);
  });

  return Array.from(classCounts.entries()).map(([className, count]) => {
    const stats = classStats.get(className)!;
    return {
      name: className,
      count,
      avgLevel: Math.round(stats.levels.reduce((a, b) => a + b, 0) / count),
      avgHP: Math.round(stats.hps.reduce((a, b) => a + b, 0) / count),
      avgDamage: Math.round(stats.damages.reduce((a, b) => a + b, 0) / count),
      avgArmor: Math.round(stats.armors.reduce((a, b) => a + b, 0) / count)
    };
  });
};

// Broadcast updated statistics to all clients
const broadcastStats = () => {
  io.emit('statsUpdate', calculateStats());
};

// REST API endpoints
app.get('/api/characters', (req, res) => {
  res.json(characters);
});

app.post('/api/characters', (req, res) => {
  const characterData: CharacterCreate = req.body;
  const newCharacter: Character = {
    id: uuidv4(),
    ...characterData
  };
  
  characters.push(newCharacter);
  broadcastStats();
  res.status(201).json(newCharacter);
});

app.put('/api/characters/:id', (req, res) => {
  const { id } = req.params;
  const characterData: CharacterCreate = req.body;
  
  const index = characters.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Character not found' });
  }
  
  characters[index] = {
    ...characterData,
    id
  };
  
  broadcastStats();
  res.json(characters[index]);
});

app.delete('/api/characters/:id', (req, res) => {
  const { id } = req.params;
  
  const index = characters.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Character not found' });
  }
  
  characters.splice(index, 1);
  broadcastStats();
  res.status(204).send();
});

// Auto-generation of characters
let autoGenerateInterval: NodeJS.Timeout | null = null;

io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send initial statistics
  socket.emit('statsUpdate', calculateStats());
  
  // Handle auto-generation toggle
  socket.on('toggleAutoGenerate', (enabled: boolean) => {
    if (enabled && !autoGenerateInterval) {
      autoGenerateInterval = setInterval(() => {
        const newCharacter: Character = {
          id: uuidv4(),
          ...generateRandomCharacter()
        };
        characters.push(newCharacter);
        io.emit('characterCreated', newCharacter);
        broadcastStats();
      }, 5000);
    } else if (!enabled && autoGenerateInterval) {
      clearInterval(autoGenerateInterval);
      autoGenerateInterval = null;
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 