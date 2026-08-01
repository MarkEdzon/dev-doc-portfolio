// app.js
// no framework, no bundler. fetch the .md, hand it to marked, drop the
// html in. the "spa" feel comes from just swapping #doc-view's innerHTML
// and pushing a hash, nothing fancier than that.

const fileTreeEl   = document.getElementById("file-tree");
const docViewEl    = document.getElementById("doc-view");
const emptySearchEl = document.getElementById("empty-search");
const searchInputEl = document.getElementById("search-input");
const docCountEl   = document.getElementById("doc-count");
const docMetaEl    = document.getElementById("doc-meta");
const metaPathEl   = document.getElementById("meta-path");
const metaWordsEl  = document.getElementById("meta-words");
const metaReadEl   = document.getElementById("meta-read");
const themeToggleEl = document.getElementById("theme-toggle");

let activeFile = null;
let welcomeHTML = null; // stashed so we can restore it when search is cleared

// marked config - github-flavored, and hand code blocks to highlight.js
marked.setOptions({
  gfm: true,
  breaks: false,
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});

init();

function init() {
  welcomeHTML = docViewEl.innerHTML;
  buildSidebar();
  setupSearch();
  setupThemeToggle();

  // deep link support: dev-doc-portfolio/#project-one.md
  const requested = decodeURIComponent(location.hash.replace("#", ""));
  const match = DOCS_MANIFEST.find((d) => d.file === requested);
  if (match) loadDoc(match);

  window.addEventListener("hashchange", () => {
    const f = decodeURIComponent(location.hash.replace("#", ""));
    const m = DOCS_MANIFEST.find((d) => d.file === f);
    if (m) loadDoc(m);
  });
}

function buildSidebar() {
  fileTreeEl.innerHTML = "";

  const groups = groupBy(DOCS_MANIFEST, "group");

  Object.keys(groups).forEach((groupName) => {
    const wrap = document.createElement("div");
    wrap.className = "tree-group";

    const label = document.createElement("div");
    label.className = "tree-group-label";
    label.textContent = groupName;
    wrap.appendChild(label);

    groups[groupName].forEach((doc) => {
      wrap.appendChild(renderTreeItem(doc));
    });

    fileTreeEl.appendChild(wrap);
  });

  docCountEl.textContent = `${DOCS_MANIFEST.length} file${DOCS_MANIFEST.length === 1 ? "" : "s"}`;
}

function renderTreeItem(doc) {
  const item = document.createElement("div");
  item.className = "tree-item";
  item.dataset.file = doc.file;
  item.setAttribute("role", "button");
  item.tabIndex = 0;

  item.innerHTML = `
    <span class="file-icon">·md</span>
    <span class="file-title">${escapeHTML(doc.title)}</span>
    ${doc.tag ? `<span class="tag">${escapeHTML(doc.tag)}</span>` : ""}
  `;

  item.addEventListener("click", () => loadDoc(doc));
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      loadDoc(doc);
    }
  });

  return item;
}

async function loadDoc(doc) {
  activeFile = doc.file;
  location.hash = doc.file;
  highlightActiveTreeItem(doc.file);

  docViewEl.innerHTML = `<p style="color: var(--text-faint); font-family: var(--font-mono); font-size: 13px;">fetching ${doc.file}...</p>`;

  try {
    const res = await fetch(`docs/${doc.file}`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const raw = await res.text();

    docViewEl.innerHTML = marked.parse(raw);
    updateMeta(doc, raw);
    docViewEl.scrollIntoView({ behavior: "instant", block: "start" });
    window.scrollTo(0, 0);
  } catch (err) {
    docViewEl.innerHTML = `
      <div style="font-family: var(--font-mono); font-size: 13.5px; color: var(--text-dim);">
        <p style="color: var(--amber);">couldn't load ${escapeHTML(doc.file)}</p>
        <p>${escapeHTML(err.message)}</p>
        <p style="color: var(--text-faint); margin-top: 12px;">
          if you're testing this locally by double-clicking index.html, that's the problem -
          browsers block fetch() on file:// urls. run a tiny local server instead, e.g.
          <code>python3 -m http.server</code>, then open localhost.
        </p>
      </div>`;
    docMetaEl.classList.add("hidden");
  }
}

function updateMeta(doc, raw) {
  const words = raw.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));

  metaPathEl.textContent = `docs/${doc.file}`;
  metaWordsEl.textContent = `${words} words`;
  metaReadEl.textContent = `${minutes} min read`;
  docMetaEl.classList.remove("hidden");
}

function highlightActiveTreeItem(file) {
  document.querySelectorAll(".tree-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.file === file);
  });
}

// ---- search --------------------------------------------------------------
// keeps it simple: filters the sidebar by title match only. wiring up a
// full-text index across every doc is overkill for a personal site with
// a handful of files - revisit if this ever grows past ~30 docs.

function setupSearch() {
  searchInputEl.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    let anyVisible = false;

    document.querySelectorAll(".tree-item").forEach((el) => {
      const title = el.querySelector(".file-title").textContent.toLowerCase();
      const visible = title.includes(q);
      el.style.display = visible ? "" : "none";
      if (visible) anyVisible = true;
    });

    document.querySelectorAll(".tree-group").forEach((group) => {
      const hasVisible = [...group.querySelectorAll(".tree-item")].some(
        (i) => i.style.display !== "none"
      );
      group.style.display = hasVisible ? "" : "none";
    });

    if (q && !anyVisible) {
      docViewEl.classList.add("hidden");
      emptySearchEl.classList.remove("hidden");
    } else {
      docViewEl.classList.remove("hidden");
      emptySearchEl.classList.add("hidden");
    }
  });
}

// ---- theme -----------------------------------------------------------

function setupThemeToggle() {
  const saved = localStorage.getItem("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);

  themeToggleEl.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    if (next === "dark") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
    localStorage.setItem("theme", next);
  });
}

// ---- helpers -----------------------------------------------------------

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
