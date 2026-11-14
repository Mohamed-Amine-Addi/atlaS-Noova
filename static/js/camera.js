import * as THREE from "three";

let frame = null;

export function flyTo(camera, controls, target, distance = 11, ms = 1400) {
  cancelAnimationFrame(frame);
  const from = camera.position.clone();
  const to = target.clone().normalize().multiplyScalar(distance);
  const start = performance.now();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function step(now) {
    const k = reduce ? 1 : Math.min((now - start) / ms, 1);
    const e = ease(k);
    const dir = from.clone().normalize().lerp(to.clone().normalize(), e).normalize();
    const len = THREE.MathUtils.lerp(from.length(), to.length(), e);
    camera.position.copy(dir.multiplyScalar(len));
    camera.lookAt(0, 0, 0);
    if (k < 1) frame = requestAnimationFrame(step);
  }
  frame = requestAnimationFrame(step);
}
