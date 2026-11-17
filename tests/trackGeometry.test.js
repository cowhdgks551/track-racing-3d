import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { trackStrip } from '../client/src/trackGeometry.js';

test('road and border share an exact closed seam and matching boundary', () => {
  const curve = new THREE.CatmullRomCurve3([[-40,-30],[40,-30],[40,30],[-40,30]].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
  const road=trackStrip(curve,-9,9,.02), edge=trackStrip(curve,9,9.6,.02);
  const r=road.attributes.position, e=edge.attributes.position;
  for(let i=0;i<=400;i++) {
    assert.equal(r.getX(i*2+1),e.getX(i*2)); assert.equal(r.getZ(i*2+1),e.getZ(i*2));
    assert.ok(Number.isFinite(r.getX(i*2)));
  }
  for(const offset of [0,1]) {
    assert.equal(r.getX(offset),r.getX(800+offset)); assert.equal(r.getZ(offset),r.getZ(800+offset));
  }
  road.dispose(); edge.dispose();
});
