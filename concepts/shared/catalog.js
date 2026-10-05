const CATEGORIES = [
  "Knowledge",
  "Materials",
  "Calculators",
  "Workflow",
  "Standards",
  "Project Data",
];

const STATUS_ORDER = ["Active", "Preview", "In Development"];

const CATEGORY_ICON = {
  Knowledge: "book",
  Materials: "database",
  Calculators: "calculator",
  Workflow: "checklist",
  Standards: "document",
  "Project Data": "weight",
};

const STATUS_ICON = {
  Active: "check",
  Preview: "eye",
  "In Development": "wrench",
};

const PATHS = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16.2 16.2 4 4"/>',
  star: '<path d="m12 3.4 2.2 4.6 5 .7-3.6 3.5.9 5.1L12 15.1 7.5 17.3l.9-5.1L4.8 8.7l5-.7L12 3.4z"/>',
  external: '<path d="M14 5h5v5"/><path d="M19 5 10.5 13.5"/><path d="M16.5 13.5V19H5V7.5h5.5"/>',
  book: '<path d="M12 6.2v12.2"/><path d="M12 6.2C9.8 4.7 7 5 4.2 5.8v12.2C7 17.2 9.8 16.9 12 18.4c2.2-1.5 5-1.2 7.8-.4V5.8C17 5 14.2 4.7 12 6.2z"/>',
  database: '<ellipse cx="12" cy="6.2" rx="7" ry="2.5"/><path d="M5 6.2v11.2c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6.2"/><path d="M5 11.8c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
  calculator: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M8.5 7h7M9 11.8h.01M12 11.8h.01M15 11.8h.01M9 15.4h.01M12 15.4h.01M15 15.4h.01"/>',
  checklist: '<rect x="6" y="3.5" width="12" height="17" rx="2"/><path d="m8.6 12.1 2.2 2.2 4.2-4.4"/>',
  document: '<path d="M7 3.5h6.8L18 7.7V20.5H7z"/><path d="M13.8 3.5V8H18"/><path d="M9.5 12.5h5M9.5 16h5"/>',
  weight: '<path d="M8 8.2h8l2.1 10.6H5.9z"/><path d="M9.6 8.2V6.4a2.4 2.4 0 0 1 4.8 0v1.8"/>',
  check: '<circle cx="12" cy="12" r="8"/><path d="m8.4 12.2 2.4 2.4 4.8-5.1"/>',
  eye: '<path d="M2.8 12S6.2 6.8 12 6.8 21.2 12 21.2 12 17.8 17.2 12 17.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.4"/>',
  wrench: '<path d="M14.7 6.4a3.1 3.1 0 0 0-4 4.1L5.2 16a1.5 1.5 0 0 0 2.1 2.1l5.5-5.5a3.1 3.1 0 0 0 4.1-4z"/><path d="m13.2 7.8 2.2 2.2"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4.4l2.8 1.8"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/>',
  route: '<circle cx="6" cy="7" r="2.1"/><circle cx="18" cy="7" r="2.1"/><circle cx="12" cy="17" r="2.1"/><path d="M8 8.2h8M7.2 8.8 11 15.2M16.8 8.8 13 15.2"/>',
  list: '<path d="M9 7h10M9 12h10M9 17h10M5 7h.01M5 12h.01M5 17h.01"/>',
  close: '<path d="m7 7 10 10M17 7 7 17"/>',
  back: '<path d="M15 6 9 12l6 6"/><path d="M10 12h10"/>',
  pin: '<path d="M9 4.5h6l-1 5 2.2 2.2H7.8L10 9.5z"/><path d="M12 11.7V20"/>',
};

function el(tag, props = {}, kids = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value == null || value === false) return;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = String(value);
    else if (key === "hidden") node.hidden = true;
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? "" : String(value));
  });
  const list = Array.isArray(kids) ? kids : [kids];
  list.forEach((kid) => {
    if (kid == null || kid === false) return;
    node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  });
  return node;
}

function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.75");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.innerHTML = PATHS[name] || PATHS.grid;
  return svg;
}

function assetUrl(imagePath) {
  const path = imagePath || "assets/images/default.svg";
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(`../../${path.replace(/^\//, "")}`, import.meta.url).href;
}

async function loadTools() {
  const url = new URL("../../data/tools.json", import.meta.url);
  const response = await fetch(url);
  if (!response.ok) throw new Error("tools-unavailable");
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("tools-unavailable");
  return data.filter((tool) => tool && tool.id && tool.name && tool.url && tool.category);
}

function createMemory(conceptId) {
  const favKey = `cae-hub-concept-${conceptId}:favorites:v1`;
  const recentKey = `cae-hub-concept-${conceptId}:recent:v1`;
  let persisted = true;

  function read(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
      persisted = false;
      return [];
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      persisted = false;
      return false;
    }
  }

  return {
    favorites: () => read(favKey),
    isFavorite: (id) => read(favKey).includes(id),
    toggleFavorite(id) {
      const current = read(favKey);
      const favorites = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
      return { favorites, persisted: write(favKey, favorites) };
    },
    recent: () => read(recentKey),
    touch(id) {
      const recent = [id, ...read(recentKey).filter((item) => item !== id)].slice(0, 12);
      return { recent, persisted: write(recentKey, recent) };
    },
    get persisted() {
      return persisted;
    },
  };
}

function matchesQuery(tool, query) {
  const words = String(query || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return true;
  const haystack = [tool.name, tool.shortName, tool.description, tool.category, ...(tool.tags || [])]
    .join(" ")
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}

function groupByCategory(tools) {
  const groups = new Map(CATEGORIES.map((category) => [category, []]));
  tools.forEach((tool) => {
    if (!groups.has(tool.category)) groups.set(tool.category, []);
    groups.get(tool.category).push(tool);
  });
  return [...groups.entries()].filter(([, list]) => list.length);
}

function statusClass(status) {
  return `status-${String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
}

function statusMark(status) {
  return el("span", { class: `status ${statusClass(status)}` }, [
    icon(STATUS_ICON[status] || "check"),
    el("span", { text: status || "Unknown" }),
  ]);
}

function previewImage(tool) {
  const img = el("img", {
    src: assetUrl(tool.image),
    alt: "",
    width: "600",
    height: "240",
    loading: "lazy",
  });
  img.addEventListener("error", () => {
    if (!img.dataset.fallback) {
      img.dataset.fallback = "1";
      img.src = assetUrl("assets/images/default.svg");
    }
  });
  return img;
}

function tagList(tags) {
  const list = el("ul", { class: "tags" });
  (tags || []).forEach((tag) => list.append(el("li", { text: tag })));
  return list;
}

function openAnchor(tool, memory, onRecord, label = "Open tool") {
  const link = el("a", {
    class: "open-tool",
    href: tool.url,
    target: "_blank",
    rel: "noopener noreferrer",
  }, [label, icon("external")]);
  const record = () => onRecord?.(memory.touch(tool.id));
  link.addEventListener("click", record);
  link.addEventListener("auxclick", (event) => {
    if (event.button === 1) record();
  });
  return link;
}

function favoriteButton(tool, memory, onRecord) {
  const pressed = memory.isFavorite(tool.id);
  const button = el("button", {
    type: "button",
    class: "fav",
    "aria-pressed": pressed ? "true" : "false",
    "aria-label": `${pressed ? "Remove" : "Add"} ${tool.name} ${pressed ? "from" : "to"} favorites`,
  }, [icon("star"), el("span", { class: "fav-text", text: pressed ? "Favorited" : "Favorite" })]);
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onRecord?.(memory.toggleFavorite(tool.id));
  });
  return button;
}

function announce(node, message) {
  if (!node) return;
  node.textContent = "";
  window.setTimeout(() => {
    node.textContent = message;
  }, 30);
}

function commandShortcut() {
  const platform = navigator.userAgent || "";
  return /Mac|iPhone|iPad/.test(platform) ? "⌘K" : "Ctrl K";
}

function byName(a, b) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function categoryRank(category) {
  const index = CATEGORIES.indexOf(category);
  return index === -1 ? CATEGORIES.length : index;
}

function statusRank(status) {
  const index = STATUS_ORDER.indexOf(status);
  return index === -1 ? STATUS_ORDER.length : index;
}

export {
  CATEGORIES,
  CATEGORY_ICON,
  STATUS_ORDER,
  announce,
  assetUrl,
  byName,
  categoryRank,
  commandShortcut,
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
  statusRank,
  tagList,
};
