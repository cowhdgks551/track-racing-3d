import RAPIER from '@dimforge/rapier3d-compat';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const angleDelta = (target, current) => Math.atan2(Math.sin(target - current), Math.cos(target - current));
let initialization;

export async function createVehiclePhysics() {
  // The compat build bundles WASM, including inside Electron file:// and Capacitor.
  initialization ??= RAPIER.init();
  await initialization;
  return new ArcadeVehiclePhysics();
}

export class ArcadeVehiclePhysics {
  constructor() {
    // Existing circuits are flat. Keep height, pitch and roll fixed; yaw and X/Z
    // contacts are solved by Rapier. This is an arcade chassis, not suspension.
    this.world = new RAPIER.World({ x: 0, y: 0, z: 0 });
    this.body = this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0, .65, 0).enabledTranslations(true, false, true)
      .enabledRotations(false, true, false).setCcdEnabled(true).setCanSleep(false));
    this.collider = this.world.createCollider(RAPIER.ColliderDesc.cuboid(.92, .5, 1.65)
      .setMass(250).setFriction(.15).setRestitution(.05), this.body);
    this.obstacles = [];
    this.stop();
  }

  setShape(width, length) { this.collider.setHalfExtents({x:width/2,y:.5,z:length/2}); }

  setObstacles(boxes) {
    for (const collider of this.obstacles) this.world.removeCollider(collider, true);
    this.obstacles = boxes.map(({ x, y, z, width, height, depth, rotation }) =>
      this.world.createCollider(RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
        .setTranslation(x, y, z)
        .setRotation({ x: 0, y: Math.sin(rotation / 2), z: 0, w: Math.cos(rotation / 2) })
        .setFriction(.25).setRestitution(.05)));
  }

  reset(x, z, heading) {
    this.stop();
    this.body.setTranslation({ x, y: .65, z }, true);
    this.body.setRotation({ x: 0, y: Math.sin(heading / 2), z: 0, w: Math.cos(heading / 2) }, true);
    this.body.setEnabled(true);
    return this.state();
  }

  clearControls() { this.steering = 0; this.drifting = false; this.driftDirection = 0; this.recovery = 0; }

  stop() {
    this.clearControls();
    this.body.resetForces(true); this.body.resetTorques(true);
    this.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }

  state() {
    const p = this.body.translation(), q = this.body.rotation(), v = this.body.linvel();
    const heading = Math.atan2(2 * q.w * q.y, 1 - 2 * q.y * q.y);
    return { x: p.x, z: p.z, heading, speed: Math.hypot(v.x, v.z),
      forwardSpeed: v.x * Math.sin(heading) + v.z * Math.cos(heading),
      slip: Math.hypot(v.x, v.z) > .1 ? angleDelta(heading, Math.atan2(v.x, v.z)) : 0,
      yaw: this.body.angvel().y, drifting: this.drifting };
  }

  step(dt, input, stats, distanceFromRoad = 0) {
    if (!(dt > 0 && dt <= .05)) throw new RangeError('Physics step must be between 0 and 0.05 seconds');
    const current = this.state();
    const turn = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    this.steering += (turn - this.steering) * (1 - Math.exp(-10 * dt));
    const wasDrifting = this.drifting;
    // Pressing drift alone must not choose an arbitrary steering direction.
    this.drifting = !!input.drift && current.forwardSpeed > 6 && (wasDrifting || Math.abs(turn) > .1);
    if (this.drifting && !wasDrifting) this.driftDirection = Math.sign(turn);
    if (!this.drifting && wasDrifting) { this.recovery = .9; this.driftDirection = 0; }
    this.recovery = Math.max(0, this.recovery - dt);

    const grip = clamp(stats.grip, .65, 1.3);
    const turnScale = clamp(stats.turn / 1.8, .6, 1.4);
    const reverse = current.forwardSpeed < -.5;
    const ordinaryYaw = this.steering * 1.8 * turnScale * clamp(current.speed / 12, 0, 1) * (reverse ? -1 : 1);
    // Opposite steering overcomes the entry bias and can reverse yaw immediately.
    const driftYaw = (this.driftDirection * .60 + this.steering * 1.25) * turnScale;
    const targetYaw = this.drifting ? driftYaw : ordinaryYaw;
    const nextYaw = current.yaw + (targetYaw - current.yaw) * (1 - Math.exp(-8 * dt));
    const inertia = this.body.principalInertia().y;
    this.body.applyTorqueImpulse({ x: 0, y: (nextYaw - current.yaw) * inertia, z: 0 }, true);

    const v = this.body.linvel();
    let vx = v.x, vz = v.z;
    if (this.drifting || this.recovery > 0) {
      // Front-end bite turns the travel line into the bend instead of building
      // a large sideways lag. Recovery uses the same velocity rotation model.
      const travel = Math.atan2(vx, vz);
      const slipTarget = this.drifting ? this.driftDirection * .22 : 0;
      const target = current.heading - slipTarget;
      const bite = this.drifting ? 5.5 * grip : (2.2 + 3.3 * (1 - this.recovery / .9)) * grip;
      const feedForward = this.drifting ? nextYaw * .65 * dt : 0;
      const correction = angleDelta(target, travel) * (1 - Math.exp(-bite * dt)) + feedForward;
      // Cap travel-direction recovery per step; never snap to the nose on release.
      const maxTurn = (this.drifting ? 2.8 : 1.5) * dt;
      const next = travel + clamp(correction, -maxTurn, maxTurn);
      const drag = this.drifting ? (input.gas ? .045 : .14) : .04;
      const drive = !this.drifting && input.gas ? stats.accel * .40 * dt : 0;
      const speed = Math.max(0, current.speed * Math.exp(-drag * dt) + drive - (input.reverse ? 16 * dt : 0));
      vx = Math.sin(next) * speed; vz = Math.cos(next) * speed;
    } else {
      const fx = Math.sin(current.heading), fz = Math.cos(current.heading);
      const rx = Math.cos(current.heading), rz = -Math.sin(current.heading);
      const lateral = vx * rx + vz * rz;
      const retention = Math.exp(-(this.recovery > 0 ? 11 : 7) * grip * dt);
      vx -= rx * lateral * (1 - retention); vz -= rz * lateral * (1 - retention);
      const drive = ((input.gas ? 1 : 0) - (input.reverse ? 1 : 0)) * stats.accel * .40;
      vx += fx * drive * dt; vz += fz * drive * dt;
      const speed = Math.hypot(vx, vz);
      const loss = (.22 + .006 * speed + .001 * speed * speed) * dt;
      const scale = speed > 0 ? Math.max(0, speed - loss) / speed : 0;
      vx *= scale; vz *= scale;
    }
    // Soft grass resistance, independent of the steering aid.
    if (distanceFromRoad > 9.5) { const factor = Math.exp(-1.25 * dt); vx *= factor; vz *= factor; }
    const magnitude = Math.hypot(vx, vz);
    const max = current.forwardSpeed < -.5 && !input.gas ? stats.max * .30 : stats.max;
    if (magnitude > max) { vx *= max / magnitude; vz *= max / magnitude; }
    const mass = this.body.mass();
    this.body.applyImpulse({ x: (vx - v.x) * mass, y: 0, z: (vz - v.z) * mass }, true);
    this.world.timestep = dt;
    this.world.step();
    return this.state();
  }

  free() { this.world.free(); }
}
