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

// Cloud KV integration (Optional: Vercel KV / Upstash Redis if configured)
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

let wishes: Wish[] = [];

// Initialize data storage from local file /tmp or local data
function loadWishesFromDisk(): Wish[] {
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

  // Also sync to Cloud KV if available
  if (kvUrl && kvToken) {
    fetch(`${kvUrl}/set/thadingyut_wishes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(wishes)),
    }).catch(err => console.error('Cloud KV set error:', err));
  }
}

// Initial load
wishes = loadWishesFromDisk();

// Async Cloud KV load if credentials exist
async function syncFromCloudKV() {
  if (kvUrl && kvToken) {
    try {
      const resp = await fetch(`${kvUrl}/get/thadingyut_wishes`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const data = await resp.json();
      if (data && data.result) {
        const cloudWishes = JSON.parse(data.result);
        if (Array.isArray(cloudWishes)) {
          wishes = cloudWishes;
          saveWishesToDisk();
        }
      }
    } catch (err) {
      console.warn('Cloud KV load error:', err);
    }
  }
}
syncFromCloudKV();

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
      // Dead client
    }
  });
}

// Keep-alive heartbeat every 20 seconds
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
app.get('/api/wishes', async (_req, res) => {
  if (isVercel) {
    const diskWishes = loadWishesFromDisk();
    if (diskWishes.length > wishes.length) {
      wishes = diskWishes;
    }
  }
  res.json({
    success: true,
    wishes: wishes.slice(0, 300),
    total: wishes.length,
  });
});

// 2. POST /api/wishes - Add new public wish
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

  broadcast({
    type: 'new_wish',
    wish: newWish,
  });

  res.status(201).json({
    success: true,
    wish: newWish,
  });
});

// 3. POST /api/wishes/sync - Client-to-Server bidirectional sync for serverless durability
app.post('/api/wishes/sync', (req, res) => {
  const clientWishes = req.body?.wishes;
  if (Array.isArray(clientWishes) && clientWishes.length > 0) {
    const map = new Map<string, Wish>();
    wishes.forEach(w => map.set(w.id, w));

    clientWishes.forEach((cw: Wish) => {
      if (cw && cw.id && cw.text) {
        if (map.has(cw.id)) {
          const cur = map.get(cw.id)!;
          map.set(cw.id, { ...cur, likes: Math.max(cur.likes || 0, cw.likes || 0) });
        } else {
          map.set(cw.id, cw);
        }
      }
    });

    wishes = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt).slice(0, 300);
    saveWishesToDisk();
  }

  res.json({
    success: true,
    total: wishes.length,
    wishes: wishes.slice(0, 300),
  });
});

// 4. POST /api/wishes/:id/like - Like / Sadhu reaction
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

// 5. GET /api/stats - Live stats
app.get('/api/stats', (_req, res) => {
  const totalLikes = wishes.reduce((acc, w) => acc + (w.likes || 0), 0);
  res.json({
    totalWishes: wishes.length,
    totalLikes,
    activeViewers: Math.max(1, clients.length),
  });
});

// 6. GET /api/wishes/stream - SSE real-time stream
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
