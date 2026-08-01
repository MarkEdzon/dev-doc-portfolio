# Project One

**Status:** shipped · **Stack:** vanilla JS, Marked.js, GitHub Pages

A short writeup of the thing you actually built. Replace this with real project details — what problem it solved, what was annoying about it, what you'd do differently.

## The problem

Describe the actual problem in a sentence or two. Skip the marketing voice.

## How it works

The core loop fetches a markdown file and renders it client-side:

```js
async function loadDoc(file) {
  const res = await fetch(`docs/${file}`);
  const raw = await res.text();
  docViewEl.innerHTML = marked.parse(raw);
}
```

Nothing clever happening there on purpose — the whole point was keeping it boring enough that it's still easy to touch in a year.

## What I'd change

| Thing | Why |
|---|---|
| Search | Currently title-only, no full-text |
| Images | No optimization pipeline, drop files in as-is |
| Tags | Manual right now, could derive from frontmatter |

## Notes

Use this space for whatever's actually useful to future-you: gotchas, links to the repo, decisions you don't want to re-litigate.
