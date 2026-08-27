---
title: The sixteen commands
description: Every command, and the thing about each that is not obvious.
---

Run `lp <command> --help` for a command's own flags. Every command accepts
`--app`, `--install`, `--json`, `--quiet`, `--yes` and `--no-color`.

## Credentials and linking

| | |
|---|---|
| `lp login [url]` | The device flow. `--status`, `--forget [install]`, `--forget-all`, `--token-stdin`, `--no-browser`. Forgetting **does not revoke** — that is the keys page. |
| `lp link <slug>` | Writes the `[app]` table. Resolves the slug against the install first, so a typo fails here. `--local`, `--install`. |

## Shipping code

| | |
|---|---|
| `lp deploy [dir]` | Bundles and uploads. `--logs`, `--no-watch`, `--watch <id>`, `--json`. |
| `lp create [dir]` | Creates an app and deploys into it. Names the slug **before** claiming it. `--repo`/`--branch`, `--name`, `--execution-mode`, `--link`. |
| `lp redeploy` | Builds again from the app's repository. Uploads nothing; prints the repository and branch first. |
| `lp rollback [id]` | No argument means the newest successful release that is not the one serving — **named before it acts**. Refuses rather than hanging when it cannot ask. |

## Watching

| | |
|---|---|
| `lp status` | What is serving, since when, from what — plus the divergence sentence for as long as it is true. |
| `lp logs` | The runtime log. `--follow`, `--deploy <id>` for a build log, `--source app\|platform`, `--since`. `--source` and `--since` are **refused with `--deploy`**: a build log has no app half to separate from. |
| `lp events` | What has gone **wrong** with this app, newest first — a different question from the log. `--since`, `--severity`, `--kind`, `--limit`. |
| `lp apps` | The estate you can read. `--mine`. |

## Lifecycle

| | |
|---|---|
| `lp restart` / `lp start` | One route serves both; the platform picks the audit action from the prior status. `--wait` polls until it settles — `running` and `sleeping` are exit 0, `crashed` and `failed` are 1. Without `--wait`, exit 0 only means the platform accepted it. |
| `lp stop` | Stops it. |

## Work

| | |
|---|---|
| `lp job list\|run\|runs\|logs\|cancel` | A job runs in its own container with its own memory limit, and every listing says so. `run` **waits by default** and the run's outcome is the exit code. `--no-wait`, `--logs`. A failed run prints its tail unasked. `--param k=v` repeats, splits on the **first** `=` only, and is never parsed. |
| `lp task list\|run\|runs\|logs` | A task is an HTTP request to a path the app published, in the app's own process. `run` waits by default. **`skipped` is exit 1** — a firing that did not happen is not a success. Takes no parameters: a task's belong to its schedule. |

## Files and code

| | |
|---|---|
| `lp store ls\|put\|get\|rm` | Files in a store you hold a grant on. `--as <name>`, `-o <file>`. **The transfer goes direct to the object store**, so an unreachable bucket is exit 4 naming *that* host; a refusal from the install is 3 and a failed transfer is 1. |
| `lp sdk vendor` | The install's own SDK into `.launchpad/sdk-<lang>/`. See [Vendoring it](../../sdk/vendoring/). |

## Two habits worth forming

**`lp events`, not `lp logs`, when something is wrong.** The log is what the app
printed. Events are what the platform recorded going wrong — a crash loop, a
failed build, a refused deploy. They answer different questions.

**`--json` on anything you script.** The human output is allowed to change.
