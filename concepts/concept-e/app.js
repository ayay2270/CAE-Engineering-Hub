import {
  CATEGORIES,
  STATUS_ORDER,
  announce,
  byName,
  categoryRank,
  createMemory,
  el,
  favoriteButton,
  loadTools,
  matchesQuery,
  openAnchor,
  previewImage,
  statusMark,
  statusRank,
  tagList,
} from "../shared/catalog.js";

const memory = createMemory("e");
const index = document.querySelector("#index");
const categoryBox = document.querySelector("#categories");
const statusBox = document.querySelector("#statuses");
const sortBox = document.querySelector("#sorts");
const densityBox = document.querySelector("#densities");
const count = document.querySelector("#count");
const search = document.querySelector("#tool-search");
const live = document.querySelector("#live");

let tools = [];
let query = "";
let category = "All";
let status = "All";
let sort = "category";
let density = "comfortable";

search.addEventListener("input", () => {
  query = search.value;
  render();
  announce(live, `${filtered().length} tools in the index.`);
});

function filtered() {
  const list = tools.filter((tool) => {
    if (category !== "All" && tool.category !== category) return false;
    if (status !== "All" && tool.status !== status) return false;
    return matchesQuery(tool, query);
  });
  const copy = [...list];
  if (sort === "name") copy.sort(byName);
  if (sort === "category") copy.sort((a, b) => categoryRank(a.category) - categoryRank(b.category) || byName(a, b));
  if (sort === "status") copy.sort((a, b) => statusRank(a.status) - statusRank(b.status) || byName(a, b));
  return copy;
}

function chipRow(container, options, current, onPick) {
  container.replaceChildren();
  options.forEach((option) => {
    const button = el("button", {
      type: "button",
      class: "chip",
      "aria-pressed": option.value === current ? "true" : "false",
      text: option.label,
    });
    button.addEventListener("click", () => {
      onPick(option.value);
      container.querySelector('[aria-pressed="true"]')?.focus();
    });
    container.append(button);
  });
}

function renderControls() {
  chipRow(categoryBox, [{ value: "All", label: "All" }, ...CATEGORIES.map((item) => ({ value: item, label: item }))], category, (value) => {
    category = value;
    render();
    announce(live, value === "All" ? "All categories." : value);
  });
  chipRow(statusBox, [{ value: "All", label: "All" }, ...STATUS_ORDER.map((item) => ({ value: item, label: item }))], status, (value) => {
    status = value;
    render();
    announce(live, value === "All" ? "All statuses." : value);
  });
  chipRow(sortBox, [
    { value: "category", label: "Category" },
    { value: "name", label: "Name" },
    { value: "status", label: "Status" },
  ], sort, (value) => {
    sort = value;
    render();
    announce(live, `Sorted by ${value}.`);
  });
  chipRow(densityBox, [
    { value: "comfortable", label: "Comfortable" },
    { value: "compact", label: "Compact" },
  ], density, (value) => {
    density = value;
    render();
    announce(live, `${value} density.`);
  });
  document.body.classList.toggle("compact", density === "compact");
}

function render() {
  renderControls();
  const list = filtered();
  count.textContent = `${list.length} tools`;
  index.replaceChildren();
  if (!list.length) {
    index.append(el("div", { class: "empty" }, [
      el("h2", { text: "No tools in this index" }),
      el("p", { text: "Try another status, or search for Geometry, Testing, or Weight." }),
      el("button", {
        type: "button",
        class: "clear-search",
        text: "Reset index",
        onclick: () => {
          query = "";
          search.value = "";
          category = "All";
          status = "All";
          sort = "category";
          render();
          search.focus();
        },
      }),
    ]));
    return;
  }
  list.forEach((tool) => {
    index.append(el("article", { class: "entry" }, [
      el("div", { class: "frame" }, [previewImage(tool)]),
      el("div", {}, [
        el("h2", { text: tool.name }),
        el("p", { class: "purpose", text: tool.description }),
        tagList(tool.tags),
      ]),
      el("p", { class: "category", text: tool.category }),
      statusMark(tool.status),
      el("div", { class: "actions" }, [
        openAnchor(tool, memory, () => {}),
        favoriteButton(tool, memory, () => render()),
      ]),
    ]));
  });
}

async function init() {
  try {
    tools = await loadTools();
  } catch {
    count.textContent = "Unavailable";
    index.append(el("div", { class: "empty" }, [
      el("h2", { text: "Tools could not be loaded" }),
      el("p", { text: "Refresh the page. The index reads the Hub tool list." }),
    ]));
    return;
  }
  render();
}

init();
