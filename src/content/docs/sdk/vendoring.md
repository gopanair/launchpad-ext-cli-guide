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

## Committing it

Commit `.launchpad/` if you want reproducible builds without a vendor step in
CI. Re-run `lp sdk vendor` after the install is upgraded, and read the diff —
it is the most direct notice you get that the platform's surface moved.
