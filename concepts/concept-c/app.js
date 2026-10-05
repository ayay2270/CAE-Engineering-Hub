import {
  CATEGORIES,
  announce,
  commandShortcut,
  createMemory,
  el,
  favoriteButton,
  loadTools,
  matchesQuery,
  openAnchor,
  statusMark,
} from "../shared/catalog.js";

const memory = createMemory("c");
const input = document.querySelector("#command-input");
const results = document.querySelector("#results");
const recentBox = document.querySelector("#recent");
const favoriteBox = document.querySelector("#favorites");
const categoryBox = document.querySelector("#categories");
const scopeBox = document.querySelector("#scopes");
const count = document.querySelector("#count");
const live = document.querySelector("#live");
const shortcut = document.querySelector("#shortcut");

let tools = [];
let query = "";
let category = "All";
let scope = "all";
let active = 0;

shortcut.textContent = commandShortcut();

input.addEventListener("input", () => {
  query = input.value;
  active = 0;
  render();
  const total = currentResults().length;
  announce(live, total ? `${total} results.` : "No results. Try a category or tag.");
});

input.addEventListener("keydown", onCommandKey);
results.addEventListener("keydown", onCommandKey);

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    input.focus();
    input.select();
    announce(live, "Search ready.");
  }
});

function toolById(id) {
  return tools.find((tool) => tool.id === id);
}

function orderedRecent() {
  return memory.recent().map(toolById).filter(Boolean);
}

function currentResults() {
  let list = tools.filter((tool) => matchesQuery(tool, query));
  if (category !== "All") list = list.filter((tool) => tool.category === category);
  if (scope === "favorites") {
    const favs = new Set(memory.favorites());
    list = list.filter((tool) => favs.has(tool.id));
  }
  if (scope === "recent") {
    const order = memory.recent();
    list = order.map(toolById).filter((tool) => tool && list.some((item) => item.id === tool.id));
  }
  return list;
}

function openTool(tool) {
  const result = memory.touch(tool.id);
  if (!result.persisted) announce(live, "Recently used could not be saved in this browser.");
  const link = document.createElement("a");
  link.href = tool.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
  renderSide();
}

function onCommandKey(event) {
  const list = currentResults();
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!list.length) return;
    if (document.activeElement === input) {
      renderResults();
      focusActive();
      return;
    }
    active = Math.min(list.length - 1, active + 1);
    renderResults();
    focusActive();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (active <= 0) {
      active = 0;
      input.focus();
      renderResults();
      return;
    }
    active -= 1;
    renderResults();
    focusActive();
  } else if (event.key === "Enter") {
    const tool = list[active];
    if (!tool) return;
    event.preventDefault();
    openTool(tool);
    announce(live, `Opening ${tool.name}.`);
  } else if (event.key === "Escape") {
    if (!query && category === "All" && scope === "all") return;
    query = "";
    input.value = "";
    category = "All";
    scope = "all";
    active = 0;
    render();
    input.focus();
    announce(live, "Search cleared.");
  } else if (event.key === "Home" && document.activeElement !== input) {
    event.preventDefault();
    active = 0;
    renderResults();
    focusActive();
  } else if (event.key === "End" && document.activeElement !== input) {
    event.preventDefault();
    active = Math.max(0, list.length - 1);
    renderResults();
    focusActive();
  }
}

function focusActive() {
  const selected = results.querySelector('[aria-selected="true"]');
  selected?.focus();
  selected?.scrollIntoView({ block: "nearest" });
}

function renderSide() {
  const recent = orderedRecent().filter((tool) => matchesQuery(tool, query)).slice(0, 5);
  recentBox.replaceChildren();
  if (!recent.length) {
    recentBox.append(el("p", { class: "blank", text: memory.recent().length ? "Nothing recent matches." : "Tools you open will show up here." }));
  } else {
    recent.forEach((tool) => recentBox.append(sideLink(tool)));
  }

  const favorites = memory.favorites().map(toolById).filter((tool) => tool && matchesQuery(tool, query));
  favoriteBox.replaceChildren();
  if (!favorites.length) {
    favoriteBox.append(el("p", { class: "blank", text: memory.favorites().length ? "No favorite matches." : "Star a tool to keep it here." }));
  } else {
    favorites.forEach((tool) => favoriteBox.append(sideLink(tool)));
  }

  categoryBox.replaceChildren();
  [["All", "All categories"], ...CATEGORIES.map((name) => [name, name])].forEach(([value, label]) => {
    const button = el("button", {
      type: "button",
      class: "cat",
      "aria-pressed": category === value ? "true" : "false",
      text: label,
    });
    button.addEventListener("click", () => {
      category = value;
      active = 0;
      render();
      [...categoryBox.querySelectorAll(".cat")].find((item) => item.textContent === label)?.focus();
      announce(live, value === "All" ? "All categories." : `Category ${value}.`);
    });
    categoryBox.append(button);
  });

  scopeBox.replaceChildren();
  ["all", "favorites", "recent"].forEach((value) => {
    const labels = { all: "All tools", favorites: "Favorites", recent: "Recently used" };
    const button = el("button", {
      type: "button",
      class: "cat",
      "aria-pressed": scope === value ? "true" : "false",
      text: labels[value],
    });
    button.addEventListener("click", () => {
      scope = value;
      active = 0;
      render();
      [...scopeBox.querySelectorAll(".cat")].find((item) => item.textContent === labels[value])?.focus();
      announce(live, labels[value]);
    });
    scopeBox.append(button);
  });
}

function sideLink(tool) {
  const link = el("a", { class: "cmd", href: tool.url, target: "_blank", rel: "noopener noreferrer" }, [
    el("span", { text: tool.shortName || tool.name }),
    el("small", { text: tool.category }),
  ]);
  link.addEventListener("click", () => memory.touch(tool.id));
  link.addEventListener("auxclick", (event) => {
    if (event.button === 1) memory.touch(tool.id);
  });
  return link;
}

function renderResults() {
  const list = currentResults();
  if (active > list.length - 1) active = Math.max(0, list.length - 1);
  count.textContent = `${list.length} results`;
  input.setAttribute("aria-expanded", list.length ? "true" : "false");
  results.replaceChildren();
  if (!list.length) {
    results.append(el("div", { class: "empty" }, [
      el("h3", { text: "No results" }),
      el("p", { text: "Try Knowledge, Shock, Impact, or clear the category command." }),
      el("button", {
        type: "button",
        class: "clear-search",
        text: "Clear search",
        onclick: () => {
          query = "";
          input.value = "";
          category = "All";
          scope = "all";
          active = 0;
          render();
          input.focus();
        },
      }),
    ]));
    input.setAttribute("aria-activedescendant", "");
    return;
  }
  const ids = [];
  list.forEach((tool, index) => {
    const selected = index === active;
    const option = el("div", {
      role: "option",
      id: `result-${tool.id}`,
      class: "option",
      tabindex: selected ? "0" : "-1",
      "aria-selected": selected ? "true" : "false",
    }, [
      el("span", { class: "name", text: tool.name }),
      el("span", { class: "purpose", text: tool.description }),
      statusMark(tool.status),
    ]);
    option.addEventListener("click", () => {
      active = index;
      openTool(tool);
      announce(live, `Opening ${tool.name}.`);
    });
    ids.push(option.id);
    const line = el("div", { class: "row" }, [
      option,
      favoriteButton(tool, memory, () => {
        render();
        announce(live, memory.isFavorite(tool.id) ? `${tool.name} added to favorites.` : `${tool.name} removed from favorites.`);
      }),
      openAnchor(tool, memory, () => renderSide()),
    ]);
    results.append(line);
  });
  results.setAttribute("aria-owns", ids.join(" "));
  input.setAttribute("aria-activedescendant", `result-${list[active].id}`);
}

function render() {
  renderSide();
  renderResults();
}

async function init() {
  try {
    tools = await loadTools();
  } catch {
    count.textContent = "Unavailable";
    results.append(el("div", { class: "empty" }, [
      el("h3", { text: "Tools could not be loaded" }),
      el("p", { text: "Refresh the page. Commands read the Hub tool list." }),
    ]));
    return;
  }
  render();
}

init();
