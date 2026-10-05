import {
  announce,
  createMemory,
  el,
  favoriteButton,
  loadTools,
  matchesQuery,
  openAnchor,
  previewImage,
  statusMark,
  tagList,
} from "../shared/catalog.js";

const ORDER = [
  "knowledge-base",
  "material-library",
  "shock-pulse",
  "center-of-gravity",
  "pre-run-checklist",
  "standard-finder",
  "weight-manager",
];

const memory = createMemory("f");
const spine = document.querySelector("#spine");
const links = document.querySelector("#links");
const board = document.querySelector("#board");
const search = document.querySelector("#tool-search");
const count = document.querySelector("#count");
const live = document.querySelector("#live");

let tools = [];
let query = "";
let openId = "";

search.addEventListener("input", () => {
  query = search.value;
  const matches = visibleMatches();
  if (matches.length === 1) openId = matches[0].id;
  render();
  announce(live, matches.length ? `${matches.length} stations match.` : "No stations match. The route is still available.");
});

board.addEventListener("keydown", (event) => {
  const buttons = [...spine.querySelectorAll(".toggle")];
  const index = buttons.indexOf(document.activeElement);
  if (index < 0) return;
  let next = index;
  if (event.key === "ArrowDown" || event.key === "ArrowRight") next = Math.min(buttons.length - 1, index + 1);
  else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = Math.max(0, index - 1);
  else return;
  event.preventDefault();
  openId = buttons[next].dataset.id;
  render();
  spine.querySelector(`.toggle[data-id="${openId}"]`)?.focus();
});

function visibleMatches() {
  return tools.filter((tool) => matchesQuery(tool, query));
}

function orderedTools() {
  return ORDER.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean);
}

function render() {
  const matches = visibleMatches();
  const searching = query.trim().length > 0;
  count.textContent = searching ? `${matches.length} of ${tools.length} stations match` : `${tools.length} stations`;
  spine.replaceChildren();
  orderedTools().forEach((tool, index) => {
    const match = !searching || matchesQuery(tool, query);
    const expanded = tool.id === openId;
    const plateId = `plate-${tool.id}`;
    const toggle = el("button", {
      type: "button",
      class: "toggle",
      "aria-expanded": expanded ? "true" : "false",
      "aria-controls": plateId,
    }, [
      el("span", { class: "index", text: String(index + 1).padStart(2, "0") }),
      el("span", {}, [
        el("span", { class: "cat", text: tool.category }),
        el("span", { class: "name", text: tool.name }),
      ]),
      statusMark(tool.status),
    ]);
    toggle.dataset.id = tool.id;
    toggle.addEventListener("click", () => {
      openId = expanded ? "" : tool.id;
      render();
      spine.querySelector(`.toggle[data-id="${tool.id}"]`)?.focus();
      announce(live, openId ? `${tool.name} expanded.` : `${tool.name} collapsed.`);
    });
    const plate = el("div", { class: "plate", id: plateId }, [
      el("div", { class: "frame" }, [previewImage(tool)]),
      el("p", { text: tool.description }),
      tagList(tool.tags),
      el("div", { class: "actions" }, [
        openAnchor(tool, memory, () => announce(live, `${tool.name} added to recently used.`)),
        favoriteButton(tool, memory, () => {
          render();
          announce(live, memory.isFavorite(tool.id) ? `${tool.name} marked.` : `${tool.name} unmarked.`);
        }),
      ]),
    ]);
    if (!expanded) plate.hidden = true;
    const station = el("article", { class: `station${expanded ? " is-open" : ""}${match ? "" : " is-dim"}`, "data-station": tool.id }, [
      toggle,
      el("p", { class: "purpose", text: tool.description }),
      el("p", { class: "match-note", text: "Outside this search" }),
      plate,
    ]);
    spine.append(station);
  });
  drawLinks();
}

function box(id) {
  const node = spine.querySelector(`[data-station="${id}"]`);
  if (!node) return null;
  const root = spine.getBoundingClientRect();
  const rect = node.getBoundingClientRect();
  return {
    left: rect.left - root.left,
    right: rect.right - root.left,
    top: rect.top - root.top,
    bottom: rect.bottom - root.top,
    cx: rect.left - root.left + rect.width / 2,
    cy: rect.top - root.top + rect.height / 2,
  };
}

function drawLinks() {
  if (window.matchMedia("(max-width: 800px)").matches) {
    links.replaceChildren();
    return;
  }
  const width = spine.offsetWidth;
  const height = spine.offsetHeight;
  links.setAttribute("viewBox", `0 0 ${width} ${height}`);
  links.setAttribute("preserveAspectRatio", "none");
  const k = box("knowledge-base");
  const m = box("material-library");
  const s = box("shock-pulse");
  const g = box("center-of-gravity");
  const c = box("pre-run-checklist");
  const standards = box("standard-finder");
  const w = box("weight-manager");
  links.replaceChildren();
  if (!k || !m || !s || !g || !c || !standards || !w) return;
  const fork = m.bottom + Math.max(16, (s.top - m.bottom) / 2);
  const merge = s.bottom + Math.max(16, (c.top - s.bottom) / 2);
  const split = c.bottom + Math.max(16, (standards.top - c.bottom) / 2);
  const mid = (k.right + m.left) / 2;
  const commands = [
    `M ${k.right} ${k.cy} H ${mid} V ${m.cy} H ${m.left}`,
    `M ${m.cx} ${m.bottom} V ${fork}`,
    `M ${Math.min(s.cx, g.cx)} ${fork} H ${Math.max(s.cx, g.cx)}`,
    `M ${s.cx} ${fork} V ${s.top}`,
    `M ${g.cx} ${fork} V ${g.top}`,
    `M ${s.cx} ${s.bottom} V ${merge}`,
    `M ${g.cx} ${g.bottom} V ${merge}`,
    `M ${Math.min(s.cx, g.cx)} ${merge} H ${Math.max(s.cx, g.cx)}`,
    `M ${c.cx} ${merge} V ${c.top}`,
    `M ${c.cx} ${c.bottom} V ${split}`,
    `M ${Math.min(standards.cx, w.cx)} ${split} H ${Math.max(standards.cx, w.cx)}`,
    `M ${standards.cx} ${split} V ${standards.top}`,
    `M ${w.cx} ${split} V ${w.top}`,
  ];
  commands.forEach((d) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    links.append(path);
  });
}

async function init() {
  try {
    tools = await loadTools();
  } catch {
    count.textContent = "Unavailable";
    spine.append(el("div", { class: "empty" }, [
      el("h2", { text: "Tools could not be loaded" }),
      el("p", { text: "Refresh the page. The route reads the Hub tool list." }),
    ]));
    return;
  }
  if (openId && !tools.some((tool) => tool.id === openId)) openId = "";
  render();
  const observer = new ResizeObserver(() => drawLinks());
  observer.observe(spine);
  window.addEventListener("resize", drawLinks);
}

init();
