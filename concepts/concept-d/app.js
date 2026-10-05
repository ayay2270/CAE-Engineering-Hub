import {
  CATEGORIES,
  CATEGORY_ICON,
  announce,
  createMemory,
  el,
  favoriteButton,
  groupByCategory,
  icon,
  loadTools,
  matchesQuery,
  openAnchor,
  previewImage,
  statusMark,
  tagList,
} from "../shared/catalog.js";

const memory = createMemory("d");
const app = document.querySelector("#app");
const rail = document.querySelector("#rail");
const lanes = document.querySelector("#lanes");
const title = document.querySelector("#canvas-title");
const count = document.querySelector("#count");
const search = document.querySelector("#tool-search");
const live = document.querySelector("#live");

const sections = [
  { id: "all", label: "All tools", icon: "grid" },
  ...CATEGORIES.map((category) => ({ id: category, label: category, icon: CATEGORY_ICON[category] })),
  { id: "favorites", label: "Favorites", icon: "star" },
  { id: "recent", label: "Recently used", icon: "clock" },
];

let tools = [];
let section = "all";
let query = "";
let labelsOn = false;

try {
  labelsOn = sessionStorage.getItem("cae-hub-concept-d:labels") === "1";
} catch {
  labelsOn = false;
}

search.addEventListener("input", () => {
  query = search.value;
  renderCanvas();
  announce(live, `${shownTools().length} tools in this view.`);
});

function shownTools() {
  let list = tools.filter((tool) => matchesQuery(tool, query));
  if (CATEGORIES.includes(section)) list = list.filter((tool) => tool.category === section);
  if (section === "favorites") {
    const favs = new Set(memory.favorites());
    list = list.filter((tool) => favs.has(tool.id));
  }
  if (section === "recent") {
    list = memory.recent().map((id) => list.find((tool) => tool.id === id)).filter(Boolean);
  }
  return list;
}

function renderRail() {
  app.classList.toggle("labels", labelsOn);
  rail.replaceChildren();
  rail.append(el("a", { class: "rail-mark", href: "../index.html" }, ["CAE", el("span", { class: "sr-only", text: " Engineering Hub concepts" })]));
  sections.forEach((item) => {
    const props = {
      type: "button",
      class: "rail-btn",
      "aria-label": item.label,
    };
    if (section === item.id) props["aria-current"] = "page";
    const button = el("button", props, [icon(item.icon), el("span", { class: "label", text: item.label })]);
    button.addEventListener("click", () => {
      section = item.id;
      renderRail();
      renderCanvas();
      title.focus();
      announce(live, item.label);
    });
    rail.append(button);
  });
  const pin = el("button", {
    type: "button",
    class: "pin",
    "aria-pressed": labelsOn ? "true" : "false",
    "aria-label": labelsOn ? "Hide category labels" : "Show category labels",
  }, [icon("pin"), el("span", { class: "label", text: labelsOn ? "Hide labels" : "Show labels" })]);
  pin.addEventListener("click", () => {
    labelsOn = !labelsOn;
    try { sessionStorage.setItem("cae-hub-concept-d:labels", labelsOn ? "1" : "0"); } catch { /* session only */ }
    renderRail();
    pinFocus();
    announce(live, labelsOn ? "Category labels pinned." : "Category labels hidden until focus.");
  });
  rail.append(pin);
}

function pinFocus() {
  rail.querySelector(".pin")?.focus();
}

function slab(tool, expanded) {
  const body = [
    el("p", { class: "category", text: tool.category }),
    el("h3", { text: tool.name }),
    el("p", { class: "purpose", text: tool.description }),
    statusMark(tool.status),
  ];
  if (expanded) body.push(tagList(tool.tags));
  body.push(el("div", { class: "actions" }, [
    openAnchor(tool, memory, () => renderRail()),
    favoriteButton(tool, memory, () => {
      renderRail();
      renderCanvas();
    }),
  ]));
  return el("article", { class: "slab" }, [
    el("div", { class: "frame" }, [previewImage(tool)]),
    el("div", {}, body),
  ]);
}

function renderCanvas() {
  const list = shownTools();
  const current = sections.find((item) => item.id === section);
  title.textContent = current?.label || "Tools";
  count.textContent = `${list.length} tools`;
  app.classList.toggle("focus-section", section !== "all");
  lanes.replaceChildren();
  if (!list.length) {
    lanes.append(el("div", { class: "empty" }, [
      el("h2", { text: "Nothing in this view" }),
      el("p", { text: "Choose All tools, or search for Shock, Materials, or Checklist." }),
      el("button", {
        type: "button",
        class: "clear-search",
        text: "Clear search",
        onclick: () => {
          query = "";
          search.value = "";
          renderCanvas();
          search.focus();
        },
      }),
    ]));
    return;
  }
  const groups = section === "all" ? groupByCategory(list) : [[current.label, list]];
  groups.forEach(([label, items]) => {
    const track = el("div", { class: "track" });
    items.forEach((tool) => track.append(slab(tool, section !== "all")));
    lanes.append(el("section", { class: "lane" }, [el("h2", { text: label }), track]));
  });
}

async function init() {
  renderRail();
  try {
    tools = await loadTools();
  } catch {
    count.textContent = "Unavailable";
    lanes.append(el("div", { class: "empty" }, [
      el("h2", { text: "Tools could not be loaded" }),
      el("p", { text: "Refresh the page. The canvas reads the Hub tool list." }),
    ]));
    return;
  }
  renderCanvas();
}

init();
