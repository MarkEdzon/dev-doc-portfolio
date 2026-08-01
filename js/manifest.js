// GitHub Pages is static hosting, not a real server - it has no directory
// listing endpoint, so fetch("docs/") will just 404. easiest fix is to keep
// a manual index of what's in /docs. add a line here every time you drop
// a new file in. yes it's mildly annoying, no it's not worth pulling in
// a build step to avoid.
//
// group: sidebar section header
// tag: optional, shows a small pill next to the filename (e.g. "new")

const DOCS_MANIFEST = [
  { file: "about-me.md",     title: "About Me",            group: "profile", tag: null },
  { file: "project-one.md",  title: "Project One",         group: "projects", tag: "new" },
  { file: "devlog-2026-08.md", title: "Devlog — Aug 2026", group: "devlogs", tag: null },
];
