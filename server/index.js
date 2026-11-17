import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const rooms = new Map();
const MAX_PLAYERS = 8;

app.get('/health', (_req, res) => res.json({ ok: true, game: 'TRACK RACING 3D' }));
app.use(express.static(path.resolve(__dirname, '../dist')));
app.get('*', (_req, res) => res.sendFile(path.resolve(__dirname, '../dist/index.html')));

function send(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}
function snapshot(room) {
  return [...room.players.values()].map(p => ({
    id:p.id, name:p.name, color:p.color, x:p.x, z:p.z, rotation:p.rotation,
    lap:p.lap, finished:p.finished
  }));
}
function broadcast(room, data) {
  for (const p of room.players.values()) send(p.ws, data);
}
wss.on('connection', ws => {
  ws.id = crypto.randomUUID();
  ws.roomCode = null;
  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.type === 'join') {
      const code = String(msg.room || 'RACE').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8) || 'RACE';
      let room = rooms.get(code);
      if (!room) { room = { players:new Map(), started:false }; rooms.set(code, room); }
      if (room.players.size >= MAX_PLAYERS) return send(ws, {type:'error', message:'방이 가득 찼습니다. (최대 8명)'});
      const colors = ['#ff5b55','#45b7ff','#ffd447','#7be0a3','#bd8cff','#ff8ac7','#ff9852','#80e7e7'];
      const player = {
        id:ws.id, ws, name:String(msg.name || 'Racer').slice(0,14), color:colors[room.players.size % colors.length],
        x:0, z:0, rotation:0, lap:0, finished:false
      };
      room.players.set(ws.id, player); ws.roomCode = code;
      send(ws, {type:'joined', id:ws.id, room:code, color:player.color, players:snapshot(room), started:room.started});
      broadcast(room, {type:'players', players:snapshot(room)});
      return;
    }
    const room = rooms.get(ws.roomCode);
    if (!room) return;
    const player = room.players.get(ws.id);
    if (!player) return;
    if (msg.type === 'state') {
      player.x = Number.isFinite(msg.x) ? Math.max(-90,Math.min(90,msg.x)) : player.x;
      player.z = Number.isFinite(msg.z) ? Math.max(-90,Math.min(90,msg.z)) : player.z;
      player.rotation = Number.isFinite(msg.rotation) ? msg.rotation : player.rotation;
      player.lap = Number.isFinite(msg.lap) ? Math.max(0,Math.min(99,msg.lap)) : player.lap;
      player.finished = !!msg.finished;
      broadcast(room, {type:'players', players:snapshot(room)});
    } else if (msg.type === 'start') {
      room.started = true;
      broadcast(room, {type:'race-start', at:Date.now()});
    } else if (msg.type === 'reset') {
      room.started = false;
      for (const p of room.players.values()) { p.lap=0; p.finished=false; }
      broadcast(room, {type:'race-reset'});
    }
  });
  ws.on('close', () => {
    const room = rooms.get(ws.roomCode);
    if (!room) return;
    room.players.delete(ws.id);
    broadcast(room, {type:'players', players:snapshot(room)});
    if (!room.players.size) rooms.delete(ws.roomCode);
  });
});
const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => console.log(`TRACK RACING 3D listening on ${port}`));