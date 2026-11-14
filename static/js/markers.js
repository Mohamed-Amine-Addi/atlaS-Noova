import * as THREE from "three";
import { RADIUS } from "./globe.js";

export function latLonToVec3(lat, lon, r) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

export function createMarkers(artifacts, camera, dom, onPick, onHover) {
  const group = new THREE.Group();
  const items = new Map();
  let ghost = false;
  let selectedId = null;

  artifacts.forEach((a) => {
    const pos = latLonToVec3(a.lat, a.lon, RADIUS * 1.02);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf2b84b, transparent: true });
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 16), mat);
    dot.position.copy(pos);
    dot.userData.id = a.id;
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf2b84b, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 40), ringMat);
    ring.position.copy(pos);
    ring.lookAt(pos.clone().multiplyScalar(2));
    group.add(dot, ring);
    items.set(a.id, { dot, ring, mat, ringMat });
  });

  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let down = null;

  dom.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
  dom.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const r = dom.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects([...items.values()].map((i) => i.dot))[0];
    if (hit) onPick(hit.object.userData.id);
  });

  dom.addEventListener("pointermove", (e) => {
    if (e.buttons) return;
    const r = dom.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects([...items.values()].map((i) => i.dot))[0];
    dom.style.cursor = hit ? "pointer" : "grab";
    if (onHover) onHover(hit ? hit.object.userData.id : null, e);
  });

  function update(t) {
    items.forEach((it, id) => {
      const sel = id === selectedId;
      const pulse = 1 + 0.35 * Math.sin(t * (ghost ? 3 : 2) + it.dot.position.x);
      it.ring.scale.setScalar(sel ? 1.6 + 0.4 * Math.sin(t * 4) : pulse);
      it.mat.color.set(sel ? 0x5fd0c5 : 0xf2b84b);
      it.ringMat.color.set(sel ? 0x5fd0c5 : 0xf2b84b);
      it.mat.opacity = ghost && !sel ? 0.35 + 0.25 * Math.sin(t * 2 + it.dot.position.y) : 1;
      it.ringMat.opacity = ghost && !sel ? 0.25 : 0.6;
    });
  }

  return {
    group,
    update,
    select(id) { selectedId = id; },
    setGhost(v) { ghost = v; },
    position(id) { return items.get(id).dot.position.clone(); }
  };
}
