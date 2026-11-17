import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import WebSocket from 'ws';

test('online rooms preserve grades, race locks, positions, results and restart', async t => {
  const port = 3099;
  const server = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, PORT: String(port) }, stdio: 'pipe' });
  t.after(() => server.kill());
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) { ready = true; break; } } catch {}
    await delay(100);
  }
  assert.ok(ready, 'server must start');
  async function client(name, grade) {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`), messages = [];
    t.after(() => ws.terminate());
    ws.on('message', raw => messages.push(JSON.parse(raw)));
    await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
    const wait = async predicate => {
      for (let i = 0; i < 100; i++) { const m = messages.find(predicate); if (m) return m; await delay(20); }
      throw new Error('No expected message: ' + JSON.stringify(messages));
    };
    const send = data => ws.send(JSON.stringify(data));
    send({ type: 'join', room: 'PHYSICS', name, car: 'balance', grade });
    const joined = await wait(m => m.type === 'joined');
    return { ws, messages, wait, send, id: joined.id };
  }
  const host = await client('Host', 'A'), guest = await client('Guest', 'B');
  const room = await host.wait(m => m.type === 'room-state' && m.players.length === 2);
  assert.equal(room.players.find(p => p.id === guest.id).grade, 'B');
  host.send({ type: 'start' }); await guest.wait(m => m.type === 'race-start');
  host.send({ type: 'select', car: 'topSpeed', grade: 'D' });
  host.send({ type: 'state', x: 145, z: -130, rotation: .5, lap: 1, progress: .3 });
  const state = await guest.wait(m => m.type === 'players' && m.players.some(p => p.id === host.id && p.x === 145));
  const self = state.players.find(p => p.id === host.id);
  assert.equal(self.grade, 'A'); assert.equal(self.car, 'balance'); assert.equal(self.z, -130);
  host.send({ type: 'finish' }); guest.send({ type: 'finish' });
  const results = await host.wait(m => m.type === 'race-results');
  assert.equal(results.results.length, 2); assert.ok(results.raceId);
  assert.deepEqual(results.results.map(p => p.points).sort((a,b) => b-a), [10,9]);
  host.send({ type: 'restart' });
  await guest.wait(m => m.type === 'room-state' && !m.started && m.players.some(p => p.finished));
});
