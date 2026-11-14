import { UI } from "./i18n.js";

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
