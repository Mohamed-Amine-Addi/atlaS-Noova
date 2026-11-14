import * as THREE from "three";

export const RADIUS = 5;

const LOOKS = {
  moon: { base: "#8d8d8b", dark: "#5f5f5e", light: "#b9b8b4", craters: 900, map: "/static/textures/moonmap1k.jpg", bump: "/static/textures/moonbump1k.jpg" },
  mars: { base: "#b4623a", dark: "#7a3b21", light: "#d98d5f", craters: 500, map: "/static/textures/marsmap1k.jpg", bump: "/static/textures/marsbump1k.jpg" },
  space: { base: "#0c1a33", dark: "#07101f", light: "#1c3763", craters: 0 }
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
  return tex;
}

export function buildGlobe(world) {
  const look = LOOKS[world];
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ map: makeTexture(world), roughness: 1, metalness: 0 });
  if (look.map) {
    const loader = new THREE.TextureLoader();
    loader.load(look.map, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      mat.map = tex;
      mat.needsUpdate = true;
    });
    loader.load(look.bump, (tex) => {
      mat.bumpMap = tex;
      mat.bumpScale = world === "moon" ? 1.2 : 0.8;
      mat.needsUpdate = true;
    });
  }
  group.add(new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 128, 96), mat));
  if (world === "mars") {
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.04, 64, 48),
      new THREE.MeshBasicMaterial({ color: 0xff9a6a, transparent: true, opacity: 0.14, side: THREE.BackSide })
    ));
  }
  return group;
}
