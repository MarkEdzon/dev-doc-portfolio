# dev-doc-portfolio

A markdown-powered docs/portfolio site with no build step. Write `.md` files, drop them in `/docs`, they render in the browser via [Marked.js](https://marked.js.org/) with code highlighting from [highlight.js](https://highlightjs.org/).

## Running it locally

Opening `index.html` directly won't work — `fetch()` is blocked on `file://` URLs by the browser. Serve the folder instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

or if you've got Node:

```bash
npx serve .
```

## Adding a new doc

1. Write your file and drop it in `docs/`.
2. Add one line to `js/manifest.js`:

```js
{ file: "your-file.md", title: "Your Title", group: "projects", tag: null }
```

3. Commit, push. That's the whole workflow.

`group` controls which section it shows up under in the sidebar. `tag` is optional — set it to a short string like `"new"` if you want a small pill next to the filename, or `null` to skip it.

## Why a manifest instead of auto-discovery

GitHub Pages is static hosting — there's no server-side code to list what's inside `/docs`, so the browser has no way to ask "what files are in here?" The manifest is the low-tech fix: one array, one line per file. It's a small tax for zero backend.

## Deploying

1. Push this repo to GitHub.
2. Repo → Settings → Pages → set source to the `main` branch, root folder.
3. Wait a minute, then visit `https://<username>.github.io/dev-doc-portfolio/`.

## Project layout
