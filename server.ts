import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Persistent Data Storage setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'wishes.json');

export interface Wish {
  id: string;
  name: string;
  text: string;
  color: 'gold' | 'ruby' | 'emerald' | 'violet' | 'pink';
  likes: number;
  createdAt: number;
  timeAgo?: string;
}

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
    // Production initial state: clean empty storage
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    return [];
  } catch (err) {
    console.error('Failed to load wishes from disk:', err);
    return [];
  }
}

function saveWishesToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(wishes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save wishes to disk:', err);
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

// Keep-alive heartbeat every 20 seconds to keep SSE connections open
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
  res.json({
    success: true,
    wishes: wishes.slice(0, 300), // Return recent wishes
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

  // Real-time broadcast to all other open browsers/devices!
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

  // Broadcast like update to everyone
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

// 5. GET /api/wishes/stream - SSE real-time stream for instant multi-user sync
app.get('/api/wishes/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const clientId = nextClientId++;
  const newClient: SseClient = { id: clientId, res };
  clients.push(newClient);

  // Send initial connection greeting
  res.write(`data: ${JSON.stringify({ type: 'connected', total: wishes.length })}\n\n`);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

// Start Server with Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`✨ Thadingyut Wishes server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
