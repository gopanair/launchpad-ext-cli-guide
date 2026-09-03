---
title: Vendoring it
description: lp sdk vendor, and why the SDK comes from the install rather than a registry.
---

```bash
lp sdk vendor
```

Writes the install's own SDK into `.launchpad/sdk-<lang>/`.

## Why not a registry

Because the SDK has to match the install. An SDK newer than the platform would
call routes that are not there; an older one would refuse a role word the
install has started sending.

Taking it from the install you are deploying to makes that impossible to get
wrong, and it works on a network with no route to a public registry.

## The flags

| | |
|---|---|
| `--lang` | Detected from the tree when absent. A tree that is **two things at once is refused**, naming the flag, exit 2. |
| `--dir` | Somewhere other than `.launchpad/`. |

**A language the install does not carry is exit 2**, from the server's
`sdk_language_unknown`. The set of languages is the *install's*, so `lp` never
keeps its own copy of it and cannot go stale.

## Per language

**Go** also gets a `go.work` — a relative `use`, no require line, and a `go`
directive that is the higher of your app's own and the floor the install
reported.

An **existing `go.work` is left alone**, and the `go work use` line is printed
for you to add. Overwriting a file you wrote would be the wrong trade.

**Python and Node** get the install line printed for the copy that landed — a
directory nobody installs changes nothing, so the command tells you what to run:

```bash
pip install -e .launchpad/sdk-python
npm install ./.launchpad/sdk-node
```

**R** lands the package directory for `renv` to pick up.

## Which copy is this

`lp sdk vendor` prints a **build id** for the copy it just wrote — twelve hex
characters derived from the SDK's own bytes, not a version somebody declared and
might forget to change.

```
Wrote the python SDK (launchpad 0.3.0) to .launchpad/sdk-python — 14 files
  Build 9ed4b6bdfa26 — the deploy log names the copy your app was built with;
  they should match.
```

`GET /api/v1/sdk/{lang}` reports the same field, and **both build logs print
it**. That is what makes the comparison possible at all: on an isolated install
the copy you vendored comes from the platform and the copy your app is built
with comes from the runner image, and a version number cannot tell those apart —
which is exactly how a fix ships, gets vendored, and is not in the deployed app.

**A runner image whose SDK is not the platform's says so in the build log, and
the deploy still succeeds.** The warning names both copies. It is your
administrator's cue to rebuild the image, not a reason to stop your deploy.

## Committing it

Commit `.launchpad/` if you want reproducible builds without a vendor step in
CI. Re-run `lp sdk vendor` after the install is upgraded, and read the diff —
it is the most direct notice you get that the platform's surface moved.
