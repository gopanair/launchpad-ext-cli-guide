---
title: CI and automation
description: Running lp where nobody is watching.
---

## Unattended is detected, not remembered

`lp` detects a non-interactive terminal rather than remembering a flag you set
once. It will not prompt, and anything that needed a confirmation is **refused
with exit 2** rather than hanging.

That is the right default for CI: a job that hangs on a prompt burns a runner
until it times out, and a job that auto-confirmed would be worse.

Pass `--yes` for the confirmations you mean to give.

## The credential

Use a **deploy key** (`lpd_`), not your personal key. It belongs to nobody, so
it does not stop working when somebody leaves, and what it can do is a strict
subset of what a personal key can do.

```yaml
env:
  LAUNCHPAD_URL:   https://launchpad.corp
  LAUNCHPAD_TOKEN: ${{ secrets.LAUNCHPAD_DEPLOY_KEY }}
```

Both, or neither. An environment token is used only when the install came from
`LAUNCHPAD_URL` too — every other combination is exit 2 naming both halves.

On a runner with a mounted secret, prefer `LAUNCHPAD_TOKEN_FILE`: the path is
not sensitive, while an environment variable is readable through `/proc` and
inherited by every child process.

## A deploy pipeline

```bash
set -euo pipefail

lp deploy --logs --app my-app          # 1 if the build fails
lp restart --wait --app my-app         # 1 if it does not come up
lp job run migrate --app my-app --yes  # 1 if the migration fails
```

Three real gates, no output parsing. Add `--json` if you want to record
anything.

## Scanning the estate

A deploy key may read the scan-target list — the only route under `/admin`
either key scope reaches. An `lp_` app key may not, because an app key is a
grant on one app and the estate is not one app.

Send `X-Launchpad-Scan: 1` on scan traffic. It **grants nothing**; it only stops
the request counting as evidence somebody wanted the app, so scanning does not
make quiet apps look busy.

## What not to do

**Do not put a token in a flag.** There is no `--token`, deliberately.

**Do not treat exit 1 as retryable.** The platform did the thing and it failed.
Retrying builds the same broken commit again.

**Do not re-point a published tag.** Extensions and anything else resolved by
ref are resolved **at deploy time**, so a moved tag changes what installs get
with no version change to show for it.
