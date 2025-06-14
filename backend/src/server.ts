import express, { Request, Response } from 'express';
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

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Initial characters
const initialCharacters: Character[] = [
  {
    id: uuidv4(),
    name: "Stormweaver",
    class: "Mage",
    level: 25,
    hp: 1500,
    damage: 180,
    armor: 40,
    magicResistance: 80,
    criticalChance: 15,
    imageUrl: "https://static1.srcdn.com/wordpress/wp-content/uploads/2022/04/How-Old-Is-Geralt-of-Rivia.jpg",
    description: "A powerful mage who controls the elements."
  },
  {
    id: uuidv4(),
    name: "Ironheart",
    class: "Warrior",
    level: 30,
    hp: 2200,
    damage: 150,
    armor: 85,
    magicResistance: 45,
    criticalChance: 10,
    imageUrl: "https://static1.srcdn.com/wordpress/wp-content/uploads/2022/04/How-Old-Is-Geralt-of-Rivia.jpg",
    description: "A stalwart warrior with unbreakable defense."
  },
  {
    id: uuidv4(),
    name: "Shadowblade",
    class: "Rogue",
    level: 28,
    hp: 1600,
    damage: 200,
    armor: 45,
    magicResistance: 35,
    criticalChance: 25,
    imageUrl: "https://static1.srcdn.com/wordpress/wp-content/uploads/2022/04/How-Old-Is-Geralt-of-Rivia.jpg",
    description: "A deadly assassin who strikes from the shadows."
  },
  {
    id: uuidv4(),
    name: "Lightbringer",
    class: "Paladin",
    level: 27,
    hp: 1900,
    damage: 160,
    armor: 70,
    magicResistance: 65,
    criticalChance: 12,
    imageUrl: "https://static1.srcdn.com/wordpress/wp-content/uploads/2022/04/How-Old-Is-Geralt-of-Rivia.jpg",
    description: "A holy warrior blessed with divine power."
  }
];

// In-memory storage
const characters: Character[] = [...initialCharacters];

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
  const stats = calculateStats();
  io.emit('statsUpdate', stats);
};

// REST API endpoints
app.get('/api/characters', (_req: Request, res: Response) => {
  console.log('[API] GET /api/characters - Fetching all characters');
  res.json(characters);
});

app.post('/api/characters', (req: Request, res: Response) => {
  console.log('[API] POST /api/characters - Creating new character:', req.body.name);
  const characterData: CharacterCreate = req.body;
  const newCharacter: Character = {
    id: uuidv4(),
    ...characterData
  };
  
  characters.push(newCharacter);
  broadcastStats();
  res.status(201).json(newCharacter);
});

app.put('/api/characters/:id', (req: Request, res: Response) => {
  console.log(`[API] PUT /api/characters/${req.params.id} - Updating character:`, req.body.name);
  const { id } = req.params;
  const characterData: CharacterCreate = req.body;
  
  const index = characters.findIndex(c => c.id === id);
  if (index === -1) {
    console.log(`[API] Character not found with id: ${id}`);
    return res.status(404).json({ error: 'Character not found' });
  }
  
  characters[index] = {
    ...characterData,
    id
  };
  
  broadcastStats();
  res.json(characters[index]);
});

app.delete('/api/characters/:id', (req: Request, res: Response) => {
  console.log(`[API] DELETE /api/characters/${req.params.id} - Deleting character`);
  const { id } = req.params;
  
  const index = characters.findIndex(c => c.id === id);
  if (index === -1) {
    console.log(`[API] Character not found with id: ${id}`);
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