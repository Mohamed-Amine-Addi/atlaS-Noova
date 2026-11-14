import { renderPanel } from "./panel.js";
import { renderTimeline } from "./timeline.js";

const state = { world: "moon", selected: null, lang: "en", ghost: false, all: [] };
const view = { ready: false };

const stage = document.getElementById("stage");
const panelEl = document.getElementById("panel");
const timelineEl = document.getElementById("timeline");

const current = () => state.all.filter((a) => a.world === state.world);
const selectedArtifact = () => state.all.find((a) => a.id === state.selected) || null;

function renderUI() {
  const list = current();
  renderPanel(panelEl, selectedArtifact(), list, state.lang, select);
  renderTimeline(timelineEl, list, state.selected, state.lang, select);
  document.documentElement.lang = state.lang;
  document.getElementById("lang").textContent = state.lang === "en" ? "FR" : "EN";
  document.querySelectorAll("#worlds button").forEach((b) => b.classList.toggle("on", b.dataset.world === state.world));
}

function select(id) {
  state.selected = id;
  if (view.ready) {
    view.markers.select(id);
    view.flyTo(view.camera, view.controls, view.markers.position(id));
  }
  renderUI();
}

function loadWorld() {
  if (!view.ready) return;
  if (view.globe) view.scene.remove(view.globe);
  if (view.markers) view.scene.remove(view.markers.group);
  view.globe = view.buildGlobe(state.world);
  view.scene.add(view.globe);
  view.markers = view.createMarkers(current(), view.camera, view.renderer.domElement, select);
  view.markers.setGhost(state.ghost);
  view.scene.add(view.markers.group);
  view.camera.position.set(0, 0, 18);
}

function switchWorld(world) {
  state.world = world;
  state.selected = null;
  loadWorld();
  renderUI();
}

async function init3D() {
  try {
    const [sceneMod, globeMod, markersMod, cameraMod] = await Promise.all([
      import("./scene.js"), import("./globe.js"), import("./markers.js"), import("./camera.js")
    ]);
    const s = sceneMod.createScene(stage);
    Object.assign(view, s, {
      buildGlobe: globeMod.buildGlobe,
      createMarkers: markersMod.createMarkers,
      flyTo: cameraMod.flyTo,
      ready: true
    });
    s.tickers.push((t) => {
      if (view.markers) view.markers.update(t);
    });
    loadWorld();
  } catch (e) {
    stage.innerHTML = '<p class="empty" style="padding:24px">3D view unavailable. Use the timeline and the list to read each story.</p>';
  }
}

async function init() {
  const res = await fetch("/api/artifacts");
  state.all = await res.json();
  renderUI();
  await init3D();
  renderUI();
}

document.querySelectorAll("#worlds button").forEach((b) => b.addEventListener("click", () => switchWorld(b.dataset.world)));
document.getElementById("lang").addEventListener("click", () => {
  state.lang = state.lang === "en" ? "fr" : "en";
  renderUI();
});
document.getElementById("ghost").addEventListener("click", (e) => {
  state.ghost = !state.ghost;
  e.currentTarget.setAttribute("aria-pressed", String(state.ghost));
  if (view.markers) view.markers.setGhost(state.ghost);
});

init();
