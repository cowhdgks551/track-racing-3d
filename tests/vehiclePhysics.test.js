import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVehiclePhysics } from '../client/src/vehiclePhysics.js';

const stats = { max: 39, accel: 28.2, turn: 1.8, grip: 1 };
const gas = { gas: true };
const run = (p, seconds, input, config = stats, dt = 1 / 120) => {
  for (let i = 0; i < Math.round(seconds / dt); i++) p.step(dt, input, config);
  return p.state();
};
async function vehicle(t) { const p = await createVehiclePhysics(); t.after(() => p.free()); p.reset(0, 0, 0); return p; }

test('straight acceleration, cap and reverse remain finite', async t => {
  const p = await vehicle(t);
  const s = run(p, 12, gas);
  assert.ok(s.speed > 37 && s.speed <= stats.max + .1, JSON.stringify(s));
  assert.ok(Math.abs(s.x) < .01 && Math.abs(s.heading) < .01);
  p.reset(0, 0, 0);
  const reverse = run(p, 6, { reverse: true });
  assert.ok(reverse.forwardSpeed < -5 && reverse.speed <= stats.max * .3 + .1);
});

test('drift retains momentum, creates slip and never accelerates from the assist', async t => {
  const p = await vehicle(t); run(p, 4, gas);
  const entry = p.state().speed;
  const drift = run(p, 2, { gas: true, left: true, drift: true });
  assert.ok(drift.drifting);
  assert.ok(drift.speed > entry * .82 && drift.speed <= entry + .05, JSON.stringify({entry,drift}));
  assert.ok(Math.abs(drift.slip) > .2, JSON.stringify(drift));
  const long = run(p, 60, { gas: true, left: true, drift: true });
  assert.ok(Number.isFinite(long.speed) && long.speed <= stats.max + .1);
});

test('countersteer reverses yaw; releasing drift restores alignment', async t => {
  const p = await vehicle(t); run(p, 4, gas);
  run(p, 1, { gas: true, left: true, drift: true });
  assert.ok(p.state().yaw > .5);
  const counter = run(p, .8, { gas: true, right: true, drift: true });
  assert.ok(counter.yaw < -.2, JSON.stringify(counter));
  const release = run(p, 1.5, gas);
  assert.ok(!release.drifting && Math.abs(release.slip) < .12, JSON.stringify(release));
});

test('left/right drift is symmetric and drift alone never picks a direction', async t => {
  const a = await vehicle(t), b = await vehicle(t); run(a, 4, gas); run(b, 4, gas);
  const l = run(a, 1.2, { gas: true, left: true, drift: true });
  const r = run(b, 1.2, { gas: true, right: true, drift: true });
  assert.ok(Math.abs(l.x + r.x) < .02 && Math.abs(l.z - r.z) < .02);
  a.reset(0, 0, 0); run(a, 4, gas);
  const straight = run(a, 1, { gas: true, drift: true });
  assert.ok(!straight.drifting && Math.abs(straight.heading) < .01);
});

test('reset and stop erase yaw, slip and steering from the previous race', async t => {
  const p = await vehicle(t); run(p, 4, gas); run(p, 1, { gas: true, left: true, drift: true });
  p.stop(); assert.equal(p.state().speed, 0); assert.equal(p.state().yaw, 0);
  p.reset(0, 0, 0);
  const next = run(p, 2, gas);
  assert.ok(Math.abs(next.x) < .01 && Math.abs(next.heading) < .01 && !next.drifting);
});

test('Rapier contacts stop the chassis at a wall without a speed restoration boost', async t => {
  const p = await vehicle(t);
  p.setObstacles([{ x: 0, y: .65, z: 12, width: 80, height: 2, depth: 1, rotation: 0 }]);
  const s = run(p, 4, gas);
  assert.ok(s.z < 10.1 && s.speed < 1, JSON.stringify(s));
  const impactSpeed = s.speed;
  const drift = run(p, .2, { gas: true, left: true, drift: true });
  assert.ok(drift.speed < 3 && impactSpeed < 1);
  p.setObstacles([]); p.reset(0, 0, 0);
  assert.ok(run(p, 3, gas).z > 12, 'changing tracks must remove old colliders');
});

test('class/grade stats still change performance; 60/120 Hz remain comparable', async t => {
  const a = await vehicle(t), b = await vehicle(t);
  const low = run(a, 4, gas, { ...stats, max: 34, accel: 20 });
  const high = run(b, 4, gas, { ...stats, max: 48.75, accel: 35.25 });
  assert.ok(high.speed > low.speed + 5);
  a.reset(0, 0, 0); b.reset(0, 0, 0);
  const s60 = run(a, 3, gas, stats, 1 / 60), s120 = run(b, 3, gas);
  assert.ok(Math.abs(s60.speed - s120.speed) < .5);
});

test('drift bites into the bend without excessive sideslip; release rotates travel gradually', async t => {
  const p=await vehicle(t); run(p,4,gas);
  const drift=run(p,1.5,{gas:true,left:true,drift:true});
  assert.ok(drift.slip > .15 && drift.slip < .5, JSON.stringify(drift));
  const travelBefore=drift.heading-drift.slip;
  const released=p.step(1/120,{},stats);
  const travelAfter=released.heading-released.slip;
  const difference=Math.atan2(Math.sin(travelAfter-travelBefore),Math.cos(travelAfter-travelBefore));
  assert.ok(Math.abs(difference)<=1.5/120+.001, JSON.stringify({difference,released}));
  assert.ok(released.speed>drift.speed*.98,'release must not discard lateral momentum');
  const recovery=run(p,1.5,gas);
  assert.ok(Math.abs(recovery.slip)<.12, JSON.stringify(recovery));
});
