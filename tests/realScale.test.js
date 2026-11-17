import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TRACKS} from '../client/src/tracks.js';
import {createMeterCurve,metersPerSecondToKmh} from '../client/src/trackGeometry.js';
import {createVehiclePhysics} from '../client/src/vehiclePhysics.js';
import {createCarModel,VEHICLE_SHAPES} from '../client/src/vehicleModels.js';

for(const [id,track] of Object.entries(TRACKS))test(`${id} physical centerline matches requested meters`,()=>{
 const curve=createMeterCurve(track.points,track.lengthMeters);
 let total=0,previous=curve.getPointAt(0);
 for(let i=1;i<=20000;i++){const p=curve.getPointAt(i/20000);total+=p.distanceTo(previous);previous=p;}
 assert.ok(Math.abs(total-track.lengthMeters)<.2,JSON.stringify({id,total,target:track.lengthMeters}));
 const end=curve.getPointAt(1);assert.ok(end.distanceTo(curve.getPointAt(0))<1e-6);
});

test('36 km/h covers 100 meters in 10 physics seconds',async t=>{
 const p=await createVehiclePhysics();t.after(()=>p.free());p.reset(0,0,0);
 p.body.setLinvel({x:0,y:0,z:10},true);p.world.timestep=1/120;
 for(let i=0;i<1200;i++)p.world.step();
 assert.ok(Math.abs(p.state().z-100)<.05);assert.equal(metersPerSecondToKmh(10),36);
});

test('four classes have distinct silhouettes and matching physical collider lengths',async t=>{
 const p=await createVehiclePhysics();t.after(()=>p.free());const labels=new Set(),sizes=[];
 for(const type of Object.keys(VEHICLE_SHAPES)){
  const model=createCarModel(0xff0000,type);labels.add(model.userData.shape);model.updateMatrixWorld(true);
  const size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());sizes.push(size.toArray().join(','));
  const shape=VEHICLE_SHAPES[type];p.setShape(shape.width,shape.length);
  assert.ok(Math.abs(p.collider.halfExtents().z*2-shape.length)<.001);
  model.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 }
 assert.equal(labels.size,4);assert.equal(new Set(sizes).size,4);
});
