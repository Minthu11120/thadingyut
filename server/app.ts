import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Wish {
  id: string;
  name: string;
  text: string;
  color: 'gold' | 'ruby' | 'emerald' | 'violet' | 'pink';
  likes: number;
  createdAt: number;
  timeAgo?: string;
}

const app = express();
app.use(express.json());

// Enable CORS for API routes
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Storage Directory resolution: On Vercel serverless, /tmp is the only writable directory
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? path.resolve('/tmp', 'data') : path.resolve(process.cwd(), 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'wishes.json');

let wishes: Wish[] = [];

// Initialize data storage
function loadWishes(): Wish[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    return [];
  } catch (err) {
    console.error('Storage load error (using in-memory cache):', err);
    return wishes;
  }
}

function saveWishesToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(wishes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Storage save error:', err);
  }
}

wishes = loadWishes();

// SSE Connected Clients Registry
type SseClient = {
  id: number;
  res: express.Response;
};

let clients: SseClient[] = [];
let nextClientId = 1;

function broadcast(event: { type: string; [key: string]: unknown }) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  clients.forEach(client => {
    try {
      client.res.write(payload);
    } catch {
      // Ignore dead connection
    }
  });
}

// Keep-alive heartbeat every 20 seconds to keep SSE connections open (where supported)
setInterval(() => {
  clients.forEach(client => {
    try {
      client.res.write(': heartbeat\n\n');
    } catch {
      // Ignored
    }
  });
}, 20000);

// API Endpoints
// 1. GET /api/wishes - Fetch all public wishes
app.get('/api/wishes', (_req, res) => {
  // Reload in case another serverless instance wrote to /tmp
  if (isVercel) {
    wishes = loadWishes();
  }
  res.json({
    success: true,
    wishes: wishes.slice(0, 300),
    total: wishes.length,
  });
});

// 2. POST /api/wishes - Add new public wish & broadcast to everyone
app.post('/api/wishes', (req, res) => {
  const { name, text, color } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'ဆုတောင်းစာ ရေးသားရန် လိုအပ်ပါသည်' });
  }

  const validColors = ['gold', 'ruby', 'emerald', 'violet', 'pink'] as const;
  const wishColor = validColors.includes(color) ? color : 'gold';

  const sanitizedName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 40) : 'အမည်မဖော်လိုသူ';
  const sanitizedText = text.trim().slice(0, 300);

  const newWish: Wish = {
    id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: sanitizedName,
    text: sanitizedText,
    color: wishColor,
    likes: 1,
    createdAt: Date.now(),
  };

  wishes.unshift(newWish);
  saveWishesToDisk();

  // Real-time broadcast to all connected clients
  broadcast({
    type: 'new_wish',
    wish: newWish,
  });

  res.status(201).json({
    success: true,
    wish: newWish,
  });
});

// 3. POST /api/wishes/:id/like - Like / Sadhu reaction
app.post('/api/wishes/:id/like', (req, res) => {
  const { id } = req.params;
  const target = wishes.find(w => w.id === id);

  if (!target) {
    return res.status(404).json({ error: 'ဆုတောင်းစာ မတွေ့ရှိပါ' });
  }

  target.likes = (target.likes || 0) + 1;
  saveWishesToDisk();

  broadcast({
    type: 'wish_liked',
    id: target.id,
    likes: target.likes,
  });

  res.json({
    success: true,
    id: target.id,
    likes: target.likes,
  });
});

// 4. GET /api/stats - Live stats
app.get('/api/stats', (_req, res) => {
  const totalLikes = wishes.reduce((acc, w) => acc + (w.likes || 0), 0);
  res.json({
    totalWishes: wishes.length,
    totalLikes,
    activeViewers: Math.max(1, clients.length),
  });
});

// 5. GET /api/wishes/stream - SSE real-time stream
app.get('/api/wishes/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const clientId = nextClientId++;
  const newClient: SseClient = { id: clientId, res };
  clients.push(newClient);

  res.write(`data: ${JSON.stringify({ type: 'connected', total: wishes.length })}\n\n`);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

export default app;
