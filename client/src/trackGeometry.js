import * as THREE from 'three';

export const metersPerSecondToKmh = speed => speed * 3.6;

export function createMeterCurve(points, lengthMeters) {
  const raw = new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
  raw.arcLengthDivisions=8192;raw.updateArcLengths();
  const scale=lengthMeters/raw.getLength();
  const curve=new THREE.CatmullRomCurve3(raw.points.map(p=>p.clone().multiplyScalar(scale)),true,'centripetal');
  curve.arcLengthDivisions=8192;curve.updateArcLengths();
  return curve;
}

// All road surfaces share the same samples and seam. No second spline fitting
// around offset points: that used to make the edging wander away from the road.
export function trackStrip(curve, innerOffset, outerOffset, height, segments = 400) {
  const vertices = [], indices = [];
  for (let i = 0; i <= segments; i++) {
    const t = i === segments ? 0 : i / segments;
    const p = curve.getPointAt(t), tangent = curve.getTangentAt(t);
    const length = Math.hypot(tangent.x, tangent.z);
    for (const offset of [innerOffset, outerOffset])
      vertices.push(p.x - tangent.z / length * offset, height, p.z + tangent.x / length * offset);
    if (i < segments) { const k = 2 * i; indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}
