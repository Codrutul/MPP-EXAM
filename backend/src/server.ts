import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { Character as CharacterModel, CharacterDocument } from './models/Character';
import { GameSession } from './models/GameSession';
import type { CharacterCreate } from './types';

// Debug logging for MongoDB queries
mongoose.set('debug', true);

const app = express();
const httpServer = createServer(app);

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://mpp-exam.onrender.com"
];

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Configure Express CORS
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Connect to MongoDB
const MONGODB_URI = "mongodb+srv://afloareicodrut:J3Ir0VKx4ydI8qur@cluster0.gthabfz.mongodb.net/mmo-rpg?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  keepAlive: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// More detailed connection logging
console.log('Attempting to connect to MongoDB...');
console.log('Connection string:', MONGODB_URI.replace(/:[^:/@]+@/, ':****@')); // Hide password in logs

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      codeName: err.codeName
    });
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    code: err.code,
    codeName: err.codeName
  });
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Connection state:', mongoose.connection.readyState);
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected. Connection state:', mongoose.connection.readyState);
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} completed in ${duration}ms with status ${res.statusCode}`);
  });
  
  next();
});

app.use(express.json());

// Calculate statistics
const calculateStats = async () => {
  const characters = await CharacterModel.find();
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
const broadcastStats = async () => {
  const stats = await calculateStats();
  io.emit('statsUpdate', stats);
};

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('Client connected');
  
  // Send initial statistics
  const stats = await calculateStats();
  socket.emit('statsUpdate', stats);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Game session endpoints
app.post('/api/game-sessions', async (req, res) => {
  try {
    const { characterId } = req.body;
    const character: CharacterDocument | null = await CharacterModel.findById(characterId);
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Generate random position within a 20x20 grid
    const position = {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20)
    };

    const gameSession = new GameSession({
      characterId: character._id,
      characterName: character.name,
      position
    });

    await gameSession.save();
    res.status(201).json(gameSession);
  } catch (error) {
    console.error('Error creating game session:', error);
    res.status(500).json({ error: 'Failed to create game session' });
  }
});

// Game session retrieval endpoint
app.get('/api/game-sessions/:id', async (req, res) => {
  try {
    const gameSession = await GameSession.findById(req.params.id);
    if (!gameSession) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    res.json(gameSession);
  } catch (error) {
    console.error('Error fetching game session:', error);
    res.status(500).json({ error: 'Failed to fetch game session' });
  }
});

// Character endpoints
app.get('/api/characters', async (req, res) => {
  try {
    const characters: CharacterDocument[] = await CharacterModel.find();
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

app.post('/api/characters', async (req, res) => {
  try {
    const characterData: CharacterCreate = req.body;
    const character = new CharacterModel(characterData);
    await character.save();
    await broadcastStats();
    res.status(201).json(character);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

app.put('/api/characters/:id', async (req, res) => {
  try {
    const characterData: Partial<CharacterCreate> = req.body;
    const character: CharacterDocument | null = await CharacterModel.findByIdAndUpdate(
      req.params.id,
      characterData,
      { new: true }
    );
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    await broadcastStats();
    res.json(character);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

app.delete('/api/characters/:id', async (req, res) => {
  try {
    const character: CharacterDocument | null = await CharacterModel.findByIdAndDelete(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    await broadcastStats();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 