import {
  CATEGORIES,
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

const SIZES = {
  "knowledge-base": "size-lead",
  "material-library": "size-mate",
  "standard-finder": "size-wide",
  "weight-manager": "size-wide",
};

const memory = createMemory("b");
const bench = document.querySelector("#bench");
const chips = document.querySelector("#categories");
const count = document.querySelector("#count");
const search = document.querySelector("#tool-search");
const live = document.querySelector("#live");

let tools = [];
let query = "";
let category = "All";

search.addEventListener("input", () => {
  query = search.value;
  render();
  const shown = filtered().length;
  announce(live, shown ? `${shown} tools match.` : "No tools match that search.");
});

function filtered() {
  return tools.filter((tool) => (category === "All" || tool.category === category) && matchesQuery(tool, query));
}

function renderChips() {
  chips.replaceChildren();
  ["All", ...CATEGORIES].forEach((name) => {
    const button = el("button", {
      type: "button",
      class: "chip",
      "aria-pressed": name === category ? "true" : "false",
      text: name,
    });
    button.addEventListener("click", () => {
      category = name;
      renderChips();
      render();
      [...chips.querySelectorAll(".chip")].find((item) => item.textContent === name)?.focus();
      announce(live, name === "All" ? "Showing all categories." : `Showing ${name}.`);
    });
    chips.append(button);
  });
}

function render() {
  const shown = filtered();
  const filtering = category !== "All" || query.trim();
  count.textContent = `${shown.length} tools`;
  if (!shown.length) {
    bench.replaceChildren(el("div", { class: "empty" }, [
      el("h2", { text: "No tools on the bench" }),
      el("p", { text: "Try Materials, Impact, or clear the category filter." }),
      el("button", {
        type: "button",
        class: "clear-search",
        text: "Reset bench",
        onclick: () => {
          query = "";
          search.value = "";
          category = "All";
          renderChips();
          render();
          search.focus();
        },
      }),
    ]));
    return;
  }
  const mosaic = el("div", { class: filtering ? "mosaic is-filtered" : "mosaic" });
  shown.forEach((tool) => {
    const size = filtering ? "size-wide" : (SIZES[tool.id] || "size-unit");
    const open = openAnchor(tool, memory, (result) => {
      if (!result.persisted) announce(live, "Recently used could not be saved in this browser.");
    }, "Open tool");
    open.setAttribute("aria-label", `Open ${tool.name}`);
    const tile = el("article", { class: `tile ${size}` }, [
      el("div", { class: "frame" }, [previewImage(tool)]),
      el("div", { class: "copy" }, [
        el("p", { class: "category", text: tool.category }),
        el("h2", { text: tool.name }),
        el("p", { class: "purpose", text: tool.description }),
        statusMark(tool.status),
        tagList(tool.tags),
        el("div", { class: "foot" }, [
          open,
          favoriteButton(tool, memory, () => render()),
        ]),
      ]),
    ]);
    mosaic.append(tile);
  });
  bench.replaceChildren(mosaic);
}

async function init() {
  try {
    tools = await loadTools();
  } catch {
    count.textContent = "Unavailable";
    bench.append(el("div", { class: "empty" }, [
      el("h2", { text: "Tools could not be loaded" }),
      el("p", { text: "Refresh the page. The bench reads the Hub tool list." }),
    ]));
    return;
  }
  renderChips();
  render();
}

init();
