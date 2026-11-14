import * as THREE from "three";

export const RADIUS = 5;

const LOOKS = {
  moon: { base: "#8d8d8b", dark: "#5f5f5e", light: "#b9b8b4", craters: 900, glow: 0xaabbd0 },
  mars: { base: "#b4623a", dark: "#7a3b21", light: "#d98d5f", craters: 500, glow: 0xff9966 },
  space: { base: "#0c1a33", dark: "#07101f", light: "#1c3763", craters: 0, glow: 0x5fd0c5 }
};

function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function makeTexture(world) {
  const look = LOOKS[world];
  const w = 2048, h = 1024;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  const rnd = seeded(world === "moon" ? 11 : world === "mars" ? 29 : 47);
  g.fillStyle = look.base;
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) {
    g.fillStyle = rnd() > 0.5 ? look.dark : look.light;
    g.globalAlpha = 0.08 + rnd() * 0.1;
    g.beginPath();
    g.ellipse(rnd() * w, rnd() * h, 40 + rnd() * 220, 20 + rnd() * 90, rnd() * 3, 0, 7);
    g.fill();
  }
  for (let i = 0; i < look.craters; i++) {
    const x = rnd() * w, y = rnd() * h, r = 2 + Math.pow(rnd(), 3) * 40;
    g.globalAlpha = 0.5;
    g.fillStyle = look.dark;
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.globalAlpha = 0.45;
    g.strokeStyle = look.light;
    g.lineWidth = Math.max(1, r * 0.15);
    g.beginPath(); g.arc(x - r * 0.1, y - r * 0.1, r, 0, 7); g.stroke();
  }
  if (world === "space") {
    g.globalAlpha = 0.5;
    g.strokeStyle = "#5fd0c5";
    g.lineWidth = 1;
    for (let x = 0; x <= w; x += w / 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += h / 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function buildGlobe(world) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ map: makeTexture(world), roughness: 1, metalness: 0 });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 96, 64), mat);
  group.add(sphere);
  if (world === "mars") {
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.03, 64, 48),
      new THREE.MeshBasicMaterial({ color: LOOKS.mars.glow, transparent: true, opacity: 0.08, side: THREE.BackSide })
    ));
  }
  group.userData.sphere = sphere;
  return group;
}
