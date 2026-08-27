---
title: Deploying
description: What gets sent, how the app is chosen, and the ignore rules.
---

```bash
lp deploy
```

## Choosing the app

```toml
# launchpad.toml
[app]
slug = "phase-test"

# a checkout that targets two installs says so, and neither is wrong
[app.installs."https://staging.launchpad.corp"]
slug = "phase-test-stg"
```

`lp link <slug>` writes that table for you, and **resolves the slug against the
install first**, so a typo fails at link time rather than at deploy time.
`--local` writes `.launchpad.toml` and adds it to `.gitignore` instead.

Or pass `--app <slug>`.

## What goes in the bundle

**`.gitignore` decides** — every one in the tree, `!` negations honoured, plus
`.git/info/exclude`. `.launchpadignore` is **additional, never a replacement**.

Git is never shelled out to, because a plain folder that is not a repository has
to bundle too.

**Always dropped:** `.git/`, `.hg/`, `.svn/`, `node_modules/`, `venv/`,
`.venv/`, `__pycache__/`, `*.pyc`, `.DS_Store`.

**Dropped only when the tree root has a `package.json`:** `dist/`, `build/`,
`out/`, `.next/`, `.nuxt/`, `.svelte-kit/`. That is the right bet for a Node
project and the wrong one for a static site — so the always-list **yields to a
`[static] root` pointing inside an excluded path**, and your `dist/` ships.

A bundled `.env*`, `*.pem`, `id_rsa*` or `*.key` gets one dimmed line and is
**not** refused. Read those lines.

## Following it

```bash
lp deploy --logs          # stream the build
lp deploy --no-watch      # fire and return
lp deploy --watch <id>    # rejoin one you left
lp deploy --json          # for a script
```

## Creating rather than updating

```bash
lp create .                       # create an app and deploy this tree into it
lp create --repo <url> --branch x # the same command from the other door
```

`lp create` **names the slug before claiming it** and confirms unless `--yes`,
because it enters the estate's namespace. If the server uniquified the slug, it
says so prominently.

## Redeploying from the repository

```bash
lp redeploy
```

Builds again from the repository the app names, and **uploads nothing**. It
prints the repository and branch first — on an app that has been `lp deploy`ed
to, that is the surprise it exists to make visible.

An app created from an upload is refused here, naming `lp deploy`.
