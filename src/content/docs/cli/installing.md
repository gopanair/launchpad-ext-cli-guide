---
title: Installing lp
description: Getting the binary, and what it is for.
---

`lp` is Launchpad's command-line client: a single Go binary with no runtime and
nothing to install alongside it.

:::note
This guide is the two developer surfaces: `lp`, and the app SDK your code calls
back with. Building an app is the **user guide**; running the install is the
**admin guide**. Both are separate apps, installable from the gallery.
:::

## Install

Download the binary for your platform from the public download repository and
put it on your `PATH`.

That repository holds **binaries and no source**. `lp` is built from the
platform repository as a second Go module, and published outward — so the
download repository is a delivery artifact rather than a mirror of the code.

```bash
lp --version
```

## What it is for

Two jobs, and the first is the reason it exists:

- **`lp deploy` pushes what is on your disk right now** — uncommitted changes
  included, without pushing to a git host first. That is the fast loop while you
  are still working something out.
- Everything else you can do on the app's page, from a terminal: logs, status,
  restarts, jobs, tasks, files, rollbacks.

## What it does not do

**`lp deploy` does not convert your app.** Pushing from your machine to an app
that was created from a git repository does not detach it from that repository
or change how it updates. The two doors lead to the same app.

**It never shells out to git.** A plain folder that is not a repository bundles
and deploys exactly like a checkout does.
