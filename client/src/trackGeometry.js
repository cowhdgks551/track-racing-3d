import * as THREE from 'three';

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
