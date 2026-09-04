---
title: Environment variables
description: What Launchpad puts in your app's environment, and what it never does.
---

## What every app gets

| | |
|---|---|
| `PORT` | The port to bind. **Always use it**; never a port of your own. |
| `BASE_PATH` | Your mount point, `/apps/your-slug`. Carry it in any absolute URL you hand the browser. |

Bind `127.0.0.1` in shared mode. The proxy strips the prefix before forwarding,
so your server is mounted at the root — but the *browser* still needs the
prefix.

A `Location` you send that is an absolute path is given the prefix on the way
out; a relative one — `new/`, `?page=2`, `.` — is passed through untouched, and
a cookie `Path` already under the prefix is left alone.

## What the SDK reads

| | |
|---|---|
| `LAUNCHPAD_API_URL` | Where to call the platform back. |
| `LAUNCHPAD_APP_ID`, `LAUNCHPAD_APP_SLUG` | This app's identity. |
| `LAUNCHPAD_APP_TOKEN` | The app's own credential. |
| `LAUNCHPAD_ROLE_KEY` | Verifies the signed role, locally. |
| `LAUNCHPAD_SCRATCH_DIR` | Where `scratch_dir` lives. |
| `LAUNCHPAD_STORAGE` | Resolves `storage("name")`. |

## Inside a job

| | |
|---|---|
| `LAUNCHPAD_RUN_ID` | This run. |
| `LAUNCHPAD_JOB_TOKEN` | The run's credential — **exchanged, never extended**. |
| `LAUNCHPAD_PARAMS` | The parameters, as values. |
| `LAUNCHPAD_TRIGGER`, `LAUNCHPAD_TRIGGER_ROLE` | What started it, and as whom. |
| `LAUNCHPAD_INPUT_URI`, `LAUNCHPAD_OUTPUT_URI` | Where the run reads and writes. |

## Your own

Set on the app's Settings tab, encrypted at rest, handed to the process at
**start**.

**A change takes effect on the next start.** Editing a variable does not restart
a running app.

## The rule that surprises people

**Your app never inherits the platform's environment.** Not
`os.Environ()`, not a passthrough, not a subset.

Your app gets the variables Launchpad chose to give it plus the ones you set,
and nothing else. A variable that works on your laptop because it was already in
your shell will not be there.

## What never reaches an app

- **No encryption key.** An app cannot decrypt anything, including its own
  variables' ciphertext.
- **No collector credential.** `OTEL_EXPORTER_OTLP_HEADERS` is never logged,
  never returned by an API, and never inherited by a child.
- **No git credential.** A connected git host is held by the platform.

## Rendered documents

A notebook or R Markdown document **executes at build time with your app's
environment**, and what it prints goes into a published page. If you print a
connection string, the connection string is on the page. The build names which
variables were available, so this is not a surprise.
