---
title: Deploying
description: What gets sent, how the app is chosen, and the ignore rules.
---

```bash
toft deploy
```

## Choosing the app

```toml
# toft.toml
[app]
slug = "phase-test"

# a checkout that targets two installs says so, and neither is wrong
[app.installs."https://staging.toft.corp"]
slug = "phase-test-stg"
```

`toft link <slug>` writes that table for you, and **resolves the slug against the
install first**, so a typo fails at link time rather than at deploy time.
`--local` writes `.toft.toml` and adds it to `.gitignore` instead.

Or pass `--app <slug>`.

## What goes in the bundle

**`.gitignore` decides** — every one in the tree, `!` negations honoured, plus
`.git/info/exclude`. `.toftignore` is **additional, never a replacement**.

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
toft deploy --logs          # stream the build
toft deploy --no-watch      # fire and return
toft deploy --watch <id>    # rejoin one you left
toft deploy --json          # for a script
```

**`--watch` on a build that has already failed still tells you why**, not just
that it is over — which is what makes it safe to run from a script a few seconds
behind the deploy.

## When it fails, in full

A failed deploy carries a **reason key**, the **whole message**, and the detail
the reason names — a tail of the build log, or the dependency findings. All
three are in the `--json` result object, so a program has something to act on
rather than a paragraph to match against.

| Reason | Where the answer is |
|---|---|
| `source_unavailable` · `source_blocked` | The URL, the credential, or your administrator's source policy |
| `dependency_blocked` | `toft deps` — the packages, the advisories, the fixed versions |
| `unsupported_framework` · `manifest_invalid` · `runtime_version` | The declaration, or `toft.toml` |
| `build_failed` | The **build** log |
| `publish_failed` | The artifact store |
| `start_failed` · `not_ready` | The **app** log, for the second one |
| `internal_error` | Retry, then tell somebody |

**A deploy also says what it ignored.** Warnings are printed and carried in the
`--json` result — a `[tasks]` table in `toft.toml` produces one, because
tasks are not declared in the manifest.

**A locked app is exit 2**, and the refusal names whether an administrator or the
dependency sweep locked it.

**A pnpm or Yarn lockfile is passed over, not refused.** The install reads
`package-lock.json` only. An app locking with `pnpm-lock.yaml` or `yarn.lock`
deploys, resolves its versions fresh, and the build log names the lockfile it
did not read — so the versions installed can differ from the ones you pinned.

## A program with no web server

```toml
# toft.toml
[batch]
language = "python"   # only when the tree has more than one language's project file

[jobs.nightly-extract]
command  = "python extract.py"
schedule = "0 3 * * *"
```

An empty `[batch]` table makes the app a **batch app**: the deploy installs its
dependencies — Node, Python, Go or R — starts nothing, and the app's work is its
jobs. It is never guessed from the tree, because a batch program and a web app
look the same from outside.

The deploy ends by saying *batch app — runs jobs, serves no pages* where it
would print the address, and the app settles as `ready` rather than `running`.
There is nothing to open, restart or stop; see [Jobs](../../sdk/jobs/).
`[batch]` beside `[static]` is refused.

## Creating rather than updating

```bash
toft create .                       # create an app and deploy this tree into it
toft create --repo <url> --branch x # the same command from the other door
```

`toft create` **names the slug before claiming it** and confirms unless `--yes`,
because it enters the estate's namespace. If the server uniquified the slug, it
says so prominently.

## Redeploying from the repository

```bash
toft redeploy
```

Builds again from the repository the app names, and **uploads nothing**. It
prints the repository and branch first — on an app that has been `toft deploy`ed
to, that is the surprise it exists to make visible.

An app created from an upload is refused here, naming `toft deploy`.

## Publishing from RStudio instead

R developers can keep the **Publish** button. In RStudio, add an account of the
*Posit Connect* kind and give it the install's address. The sign-in goes
through the same approval page as `toft login`, and what it creates is an
ordinary personal key named *RStudio (rsconnect)*, listed with your other keys
and revoked the same way. `rsconnect::deployApp()` then creates the app,
uploads and deploys it, and shows the build log.

What Connect has and Toft does not — content settings, access lists,
vanity URLs, schedules — is not imitated. A name already taken is refused rather
than given a suffix, because rsconnect finds its content again by name. For
anything scripted, use `toft`.
