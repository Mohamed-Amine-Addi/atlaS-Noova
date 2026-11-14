const TEXT = {
  en: { pick: "Pick an artifact on the globe or the timeline to hear its story.", status: "Where it is now", why: "What it taught us", sources: "Sources", all: "Artifacts here" },
  fr: { pick: "Choisis un objet sur le globe ou la frise pour entendre son histoire.", status: "Où il se trouve aujourd'hui", why: "Ce qu'il nous a appris", sources: "Sources", all: "Objets ici" }
};

export function renderPanel(el, artifact, artifacts, lang, onPick) {
  const t = TEXT[lang];
  if (!artifact) {
    el.innerHTML = `<p class="empty">${t.pick}</p>`;
  } else {
    el.innerHTML = `
      <h2>${artifact.name}</h2>
      <p class="meta">${artifact.year} · ${artifact.status[lang]}</p>
      <p>${artifact.summary[lang]}</p>
      <h3>${t.why}</h3>
      <p>${artifact.science[lang]}</p>
      <h3>${t.sources}</h3>
      ${artifact.sources.map((s) => `<p><a href="${s}" target="_blank" rel="noopener">${s}</a></p>`).join("")}`;
  }
  const list = document.createElement("ul");
  list.className = "list";
  artifacts.forEach((a) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.textContent = `${a.name} (${a.year})`;
    b.addEventListener("click", () => onPick(a.id));
    li.appendChild(b);
    list.appendChild(li);
  });
  const h = document.createElement("h3");
  h.textContent = t.all;
  el.append(h, list);
}
