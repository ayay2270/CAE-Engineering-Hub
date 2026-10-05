import {
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

const memory = createMemory("a");
const list = document.querySelector("#tool-list");
const detail = document.querySelector("#detail");
const count = document.querySelector("#list-count");
const search = document.querySelector("#tool-search");
const live = document.querySelector("#live");
const narrow = window.matchMedia("(max-width: 900px)");

let tools = [];
let query = "";
let selectedId = "";
let showDetail = false;

search.addEventListener("input", () => {
  query = search.value;
  const visible = visibleTools();
  if (!visible.some((tool) => tool.id === selectedId)) {
    selectedId = visible[0]?.id || "";
  }
  renderList();
  renderDetail();
  announce(live, visible.length ? `${visible.length} tools match.` : "No tools match that search.");
});

search.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    const first = list.querySelector(".option");
    first?.focus();
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    search.focus();
    search.select();
  }
});

narrow.addEventListener("change", () => {
  if (!narrow.matches) showDetail = false;
  syncShell();
});

list.addEventListener("keydown", (event) => {
  const options = [...list.querySelectorAll(".option")];
  const index = options.findIndex((option) => option.id === document.activeElement?.id);
  if (!options.length || index < 0) return;
  let next = index;
  if (event.key === "ArrowDown") next = Math.min(options.length - 1, index + 1);
  else if (event.key === "ArrowUp") next = Math.max(0, index - 1);
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = options.length - 1;
  else if (event.key === "Enter") {
    event.preventDefault();
    const tool = tools.find((item) => item.id === selectedId);
    detail.querySelector(".open-tool")?.click();
    if (tool) announce(live, `Opening ${tool.name}.`);
    return;
  } else return;
  event.preventDefault();
  choose(options[next].dataset.id, { focus: true, detail: true });
});

function visibleTools() {
  return tools.filter((tool) => matchesQuery(tool, query));
}

function choose(id, { focus = false, detail: openDetail = false } = {}) {
  if (!id) return;
  selectedId = id;
  if (narrow.matches && openDetail) showDetail = true;
  history.replaceState(null, "", `#tool-${id}`);
  renderList();
  renderDetail();
  if (focus) list.querySelector(`#option-${id}`)?.focus();
  const tool = tools.find((item) => item.id === id);
  if (tool) announce(live, `${tool.name}, ${tool.status}.`);
}

function renderList() {
  const visible = visibleTools();
  count.textContent = `${visible.length} shown`;
  list.replaceChildren();
  if (!visible.length) {
    list.append(el("div", { class: "empty" }, [
      el("h2", { text: "No matching tools" }),
      el("p", { text: "Try a tool name, a category such as Calculators, or a tag such as Impact." }),
      el("button", { type: "button", class: "clear-search", text: "Clear search", onclick: clearSearch }),
    ]));
    list.setAttribute("aria-activedescendant", "");
    return;
  }
  groupByCategory(visible).forEach(([category, items]) => {
    const group = el("div", { role: "group", "aria-label": category });
    group.append(el("div", { class: "group-label", text: category }));
    items.forEach((tool) => {
      const selected = tool.id === selectedId;
      const option = el("button", {
        type: "button",
        class: "option",
        role: "option",
        id: `option-${tool.id}`,
        "aria-selected": selected ? "true" : "false",
        tabindex: selected ? "0" : "-1",
      }, [
        el("span", { class: "name", text: tool.name }),
        el("span", { class: "mini", text: tool.status }),
      ]);
      option.dataset.id = tool.id;
      option.addEventListener("click", () => choose(tool.id, { detail: true }));
      group.append(option);
    });
    list.append(group);
  });
  list.setAttribute("aria-activedescendant", selectedId ? `option-${selectedId}` : "");
}

function renderDetail() {
  const tool = tools.find((item) => item.id === selectedId);
  detail.replaceChildren();
  const back = el("button", { type: "button", class: "back" }, [icon("back"), "All tools"]);
  back.addEventListener("click", () => {
    showDetail = false;
    syncShell();
    list.querySelector(".option[aria-selected='true']")?.focus();
  });
  detail.append(back);
  if (!tool) {
    detail.append(el("div", { class: "empty" }, [
      el("h2", { id: "detail-title", text: "Nothing selected" }),
      el("p", { text: "Clear the search to return to the full tool list." }),
    ]));
    return;
  }
  const figure = el("figure", { class: "preview" }, [previewImage(tool)]);
  const title = el("h2", { id: "detail-title", text: tool.name });
  detail.append(
    figure,
    el("p", { class: "kicker", text: tool.category }),
    title,
    statusMark(tool.status),
    el("p", { class: "description", text: tool.description }),
    tagList(tool.tags),
    el("div", { class: "actions" }, [
      openAnchor(tool, memory, (result) => {
        if (!result.persisted) showMemoryNote();
        announce(live, `${tool.name} added to recently used.`);
      }),
      favoriteButton(tool, memory, (result) => {
        if (!result.persisted) showMemoryNote();
        renderDetail();
        detail.querySelector(".fav")?.focus();
        announce(live, result.favorites.includes(tool.id) ? `${tool.name} added to favorites.` : `${tool.name} removed from favorites.`);
      }),
    ]),
    el("p", { class: "note", text: "Opens in its own workspace." }),
  );
  if (!memory.persisted) showMemoryNote();
  syncShell();
}

function showMemoryNote() {
  if (detail.querySelector(".memory")) return;
  detail.append(el("p", { class: "memory", text: "This browser blocked saved favorites. They will last for this tab only." }));
}

function clearSearch() {
  search.value = "";
  query = "";
  const visible = visibleTools();
  if (!visible.some((tool) => tool.id === selectedId)) selectedId = visible[0]?.id || "";
  renderList();
  renderDetail();
  search.focus();
}

function syncShell() {
  document.body.classList.toggle("is-narrow", narrow.matches);
  document.body.classList.toggle("show-detail", narrow.matches && showDetail);
}

async function init() {
  syncShell();
  try {
    tools = await loadTools();
  } catch {
    count.textContent = "Unavailable";
    list.append(el("div", { class: "empty" }, [
      el("h2", { text: "Tools could not be loaded" }),
      el("p", { text: "Refresh the page. The explorer reads the Hub tool list." }),
    ]));
    return;
  }
  const hash = location.hash.replace(/^#tool-/, "");
  selectedId = tools.some((tool) => tool.id === hash) ? hash : tools[0].id;
  if (narrow.matches && location.hash) showDetail = true;
  renderList();
  renderDetail();
}

init();
