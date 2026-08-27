# Launchpad CLI and SDK guide

The reference for `lp`, the command-line client, and the app SDK your code calls the platform back with (Go, Node, Python and R). It deploys onto a
Launchpad install as an extension from the Gallery, on the reserved slug
`_cli-guide`.

## What this is

An [Astro](https://astro.build) + [Starlight](https://starlight.astro.build)
site, styled with Launchpad's own palette and type so it reads as part of the
product. Search is [Pagefind](https://pagefind.app) — the index is built into
`dist/` as static files, so it works on an install with no route off the
network and behind Launchpad's own sign-in. A hosted search index would do
neither.

## Working on it

```bash
npm install
npm run dev      # http://localhost:4321/apps/_cli-guide/
npm run build    # writes dist/
```

Prose lives in `src/content/docs/`. The sidebar is in `astro.config.mjs` — a
new page needs an entry there, and Starlight fails the build if one names a
slug that does not exist.

## Two things not to break

**`dist/` is committed.** Launchpad does not build this repo; it serves the
folder. Rebuild and commit `dist/` in the same commit as a prose change, or the
change does not ship.

**`base` is `/apps/_cli-guide`.** A static app is served under `/apps/{slug}/`,
and a root-absolute URL without that prefix asks the platform for the file and
gets a 404. The slug is in Launchpad's reserved `_` namespace, so no ordinary
app can take it and this value cannot go stale behind a rename.

## The theme

`src/styles/launchpad.css` carries the platform's tokens, lifted from
`web/src/index.css` in the Launchpad repo rather than colour-matched. The admin
guide carries a byte-identical copy — a reader moving between the two guides
and the product itself should not notice three designs.

## Releasing

Extensions are cloned at a **tag**. Tag a release and point the catalog entry at
it; never re-point a tag that has already been published, because installs
resolve the ref at deploy time and a moved tag changes what they get with no
version change to show for it.
