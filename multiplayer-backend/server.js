import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import geoip from 'geoip-lite';

const app = express();

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff;">
        <h1>🟢 Multiplayer Backend is Live!</h1>
        <p>This is the hidden server that powers the live cursors and chat.</p>
        <p>To see your actual portfolio, please visit your <strong>Vercel</strong> URL.</p>
      </body>
    </html>
  `);
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const users = new Map();
const messages = [];
const reactions = {}; // Map messageId -> Reaction[]

let lofiState = {
  isPlaying: false,
  trackIndex: 0,
  position: 0,
  updatedAt: Date.now()
};

const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
const names = [
  'Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 
  'Ivan', 'Judy', 'Mallory', 'Oscar', 'Peggy', 'Romeo', 'Sybil', 'Trent',
  'Victor', 'Walter', 'Zoe', 'Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan',
  'Casey', 'Riley', 'Jamie', 'Quinn', 'Avery', 'Cameron', 'Dylan', 'Mia',
  'Leo', 'Maya', 'Lucas', 'Nina', 'Noah', 'Elena', 'Oliver', 'Sofia'
];
const getRandomName = () => names[Math.floor(Math.random() * names.length)];

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const avatars = ['1.png', '2.png', '3.png', '4.png', '5.png'];
const getRandomAvatar = () => avatars[Math.floor(Math.random() * avatars.length)];

function broadcastUsers() {
  io.emit('users-updated', Array.from(users.values()));
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
  
  // If testing on localhost, mock an IP so we get a cool location instead of nothing
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.')) {
      const mockIps = ['8.8.8.8', '212.58.246.91', '133.1.255.255', '2.21.36.0', '189.123.45.67', '41.74.160.0', '190.15.192.0'];
      ip = mockIps[Math.floor(Math.random() * mockIps.length)];
  }

  const geo = geoip.lookup(ip);
  const locationName = geo ? `${geo.city ? geo.city + ', ' : ''}${geo.country}` : "Earth";
  const flag = geo ? getFlagEmoji(geo.country) : "🌍";

  const newUser = {
    id: socket.id,
    socketId: socket.id,
    name: getRandomName(),
    avatar: getRandomAvatar(),
    color: getRandomColor(),
    isOnline: true,
    location: locationName,
    flag: flag,
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  
  users.set(socket.id, newUser);
  broadcastUsers();

  socket.emit('session', { sessionId: socket.id });
  socket.emit('lofi-state', lofiState);

  socket.on('reaction-spawn', (data) => {
    socket.broadcast.emit('reaction-spawned', { 
      ...data, 
      socketId: socket.id, 
      id: Date.now().toString() + Math.random().toString(36).substring(7) 
    });
  });

  socket.on('lofi-action', (data) => {
    if (data.type === 'play') {
      lofiState.isPlaying = true;
      lofiState.position = data.payload?.position || 0;
      lofiState.updatedAt = Date.now();
    } else if (data.type === 'pause') {
      lofiState.isPlaying = false;
      lofiState.position = data.payload?.position || 0;
      lofiState.updatedAt = Date.now();
    } else if (data.type === 'skip') {
      lofiState.trackIndex = data.payload?.trackIndex || 0;
      lofiState.position = 0;
      lofiState.updatedAt = Date.now();
    } else if (data.type === 'sync') {
      lofiState.position = data.payload?.position || 0;
      lofiState.updatedAt = Date.now();
    }
    io.emit('lofi-state', lofiState);
  });

  socket.on('cursor-change', (data) => {
    socket.broadcast.emit('cursor-changed', {
      pos: data.pos,
      socketId: socket.id
    });
  });

  socket.on('msgs-fetch-init', () => {
    socket.emit('msgs-receive-init', messages.slice(-50));
    socket.emit('reactions-init', reactions);
  });

  socket.on('msgs-fetch-history', (data) => {
    const index = messages.findIndex(m => String(m.id) === String(data.before));
    let history = [];
    let hasMore = false;
    if (index !== -1) {
       const start = Math.max(0, index - 50);
       history = messages.slice(start, index);
       hasMore = start > 0;
    }
    socket.emit('msgs-receive-history', {
        messages: history,
        hasMore,
        reactions
    });
  });

  socket.on('msg-send', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    let replyTo = undefined;
    if (data.replyTo) {
        const repliedMsg = messages.find(m => String(m.id) === String(data.replyTo));
        if (repliedMsg) {
            replyTo = { id: repliedMsg.id, username: repliedMsg.username, content: repliedMsg.content };
        }
    }

    const newMessage = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      sessionId: user.id,
      flag: user.flag,
      country: user.location,
      username: user.name,
      avatar: user.avatar,
      color: user.color,
      content: data.content,
      createdAt: new Date().toISOString(),
      replyTo
    };
    
    messages.push(newMessage);
    if (messages.length > 500) messages.shift(); 
    
    io.emit('msg-receive', newMessage);
  });

  socket.on('msg-edit', (data) => {
    const msg = messages.find(m => String(m.id) === String(data.id));
    if (msg && msg.sessionId === socket.id) {
        msg.content = data.content;
        msg.editedAt = new Date().toISOString();
        io.emit('msg-update', { id: msg.id, content: msg.content, editedAt: msg.editedAt });
    }
  });

  socket.on('reaction-toggle', (data) => {
    const { messageId, emoji } = data;
    if (!reactions[messageId]) {
        reactions[messageId] = [];
    }
    
    let rxn = reactions[messageId].find(r => r.emoji === emoji);
    if (rxn) {
        const sidIndex = rxn.sessionIds.indexOf(socket.id);
        if (sidIndex > -1) {
            rxn.sessionIds.splice(sidIndex, 1);
            if (rxn.sessionIds.length === 0) {
                reactions[messageId] = reactions[messageId].filter(r => r.emoji !== emoji);
            }
        } else {
            rxn.sessionIds.push(socket.id);
        }
    } else {
        reactions[messageId].push({ emoji, sessionIds: [socket.id] });
    }
    
    io.emit('reaction-update', { messageId, reactions: reactions[messageId] });
  });

  socket.on('update-user', (data) => {
    const user = users.get(socket.id);
    if (user) {
        user.name = data.username || user.name;
        user.avatar = data.avatar || user.avatar;
        if (data.color) user.color = data.color;
        broadcastUsers();
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    users.delete(socket.id);
    broadcastUsers();
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO Server listening on port ${PORT}`);
});
