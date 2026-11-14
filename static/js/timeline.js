export function renderTimeline(el, artifacts, selectedId, lang, onPick) {
  const sorted = [...artifacts].sort((a, b) => a.year - b.year);
  el.innerHTML = "";
  sorted.forEach((a) => {
    const b = document.createElement("button");
    b.className = a.id === selectedId ? "on" : "";
    b.innerHTML = `<b>${a.year}</b><span>${a.name}</span>`;
    b.addEventListener("click", () => onPick(a.id));
    el.appendChild(b);
  });
  const active = el.querySelector(".on");
  if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
}
