import { UI } from "./i18n.js";

function fmt(days, u) {
  if (days < 60) return `${days} ${u.d}`;
  if (days < 730) return `${Math.round(days / 30.4)} ${u.mo}`;
  return `${(days / 365.25).toFixed(1)} ${u.y}`;
}

function coords(a) {
  if (a.world === "space") return null;
  const ns = a.lat >= 0 ? "N" : "S";
  const ew = a.lon >= 0 ? "E" : "W";
  return `${Math.abs(a.lat).toFixed(2)}° ${ns}, ${Math.abs(a.lon).toFixed(2)}° ${ew}`;
}

function dossier(a, t) {
  const rows = [];
  const c = coords(a);
  if (c) rows.push(`<div><dt>${t.coords}</dt><dd dir="ltr">${c}</dd></div>`);
  if (!a.life) return rows.length ? `<h3>${t.dossier}</h3><dl class="grid">${rows.join("")}</dl>` : "";
  const ratio = Math.round(a.life.actual / a.life.planned);
  const pw = Math.max(2, (a.life.planned / a.life.actual) * 100);
  return `
    <h3>${t.dossier}</h3>
    ${rows.length ? `<dl class="grid">${rows.join("")}</dl>` : ""}
    <div class="life">
      <div class="big"><b dir="ltr">×${ratio}</b><span>${t.longer}</span></div>
      <div class="row"><span>${t.designed}</span><em>${fmt(a.life.planned, t.u)}</em></div>
      <div class="track"><i class="plan" style="width:${pw}%"></i></div>
      <div class="row"><span>${t.actual}</span><em>${fmt(a.life.actual, t.u)}</em></div>
      <div class="track"><i class="real" style="width:100%"></i></div>
    </div>`;
}

export function renderPanel(el, artifact, artifacts, lang, onPick, world) {
  const t = UI[lang];
  el.innerHTML = "";
  if (!artifact) {
    el.innerHTML = `<p class="worldintro">${t[world + "Intro"]}</p><p class="empty">${t.pick}</p>`;
  } else {
    const fig = artifact.image
      ? `<figure><img src="${artifact.image}" alt="${artifact.name}" referrerpolicy="no-referrer"><figcaption>${t.credit}</figcaption></figure>`
      : "";
    el.insertAdjacentHTML("beforeend", `
      ${fig}
      <h2>${artifact.name}</h2>
      <p class="chips"><span>${artifact.year}</span><span>${artifact.status[lang]}</span></p>
      <p class="story">${artifact.summary[lang]}</p>
      ${dossier(artifact, t)}
      <h3>${t.why}</h3>
      <p>${artifact.science[lang]}</p>
      <h3>${t.sources}</h3>
      ${artifact.sources.map((s) => `<p><a href="${s}" target="_blank" rel="noopener">${s.replace("https://", "")}</a></p>`).join("")}`);
    const img = el.querySelector("img");
    if (img) img.addEventListener("error", () => img.closest("figure").remove());
  }
  const h = document.createElement("h3");
  h.textContent = t.all;
  const list = document.createElement("ul");
  list.className = "list";
  artifacts.forEach((a) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.textContent = `${a.name} · ${a.year}`;
    if (artifact && a.id === artifact.id) b.className = "on";
    b.addEventListener("click", () => onPick(a.id));
    li.appendChild(b);
    list.appendChild(li);
  });
  el.append(h, list);
  el.scrollTop = 0;
}
