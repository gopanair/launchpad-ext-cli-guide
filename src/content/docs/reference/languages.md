---
title: Language notes
description: The same model in four spellings, and what differs.
---

One model, four languages. The differences are naming conventions, not
capabilities.

## Go

```go
import lp "launchpad/lp"

lp.App.Self(ctx)
lp.Data.Get(ctx)
lp.Notify.Slack(ctx, "done")
lp.Jobs.Start(ctx, "reconcile", opts)
me, err := lp.ViewerFor(r.Header)
who, err := lp.Who(ctx, r.Header)
c := lp.CallerFor(r.Header)
```

`context.Context` first, `error` last. `lp sdk vendor` writes a `go.work` with a
relative `use` — see [Vendoring it](../../sdk/vendoring/).

## Node

```js
import lp from "@launchpad/sdk";

await lp.app.slug();
await lp.data.update((s) => { s.runs++; });
await lp.notify.email({ to, subject, text });
const me = lp.viewer(req.headers);
const who = await lp.who(req.headers);
const c = lp.caller(req.headers);
```

Promises throughout except `caller`, `task` and `run`, which are local.

## Python

```python
import launchpad as lp

lp.app.slug()
lp.data.update(bump)
lp.notify.slack("done")
lp.jobs.start("reconcile", params=params)
lp.viewer(headers); lp.who(headers); lp.caller(headers)
lp.scratch_dir("uploads"); lp.session_scratch_dir(sid)
```

`snake_case`. Types worth naming are exported: `Identity`, `Caller`, `Viewer`,
`Send`, `JobRun`, `Document`, `VersionConflict`, `QueueFull`, `LaunchpadError`.

## R

```r
app_info(); app_base_path()
app_data_get(); app_data_set(list(period = p))
notify("done")
job_start("reconcile"); job_status(id)
viewer(); caller_role(); caller_can("editor"); verify_role()
mounts(); storage("reports"); store("drop", "backup")
scratch_dir("uploads")
```

Flat function names rather than an object. A **narrower surface** than the other
three — check before designing around a call you saw in the Go docs.

`mounts()`, `storage()` and `store()` are there, so an R app asks where a
resource is mounted rather than parsing the environment variable by hand.
`scratch_dir()` is scratch space and is **not** where storage lives; they are
two different questions with two different answers.

## What is identical everywhere

- The [six roles](../roles/), verified against the same vectors in CI. Two
  implementations of one HMAC exist, and a test runs them against each other.
- [App data](../../sdk/data/): one document, three distinguishable states,
  `update` for a second writer.
- [Notifications](../../sdk/notify/): a send returns a record, never a delivery.
- [Jobs](../../sdk/jobs/): two objects — the app, and the app acting for a
  person.
- **Off-platform, every call fails naming the missing environment variable.**
  No dry-run mode, in any language.
- **Where the app is mounted**: `lp.app.base_path`, `basePath()`, `BasePath`,
  `app_base_path()`, all falling back to `BASE_PATH`.
- **Addressing one of two mounts by folder**: `folder=` in Python, `{ folder }`
  in Node, `StorageIn`/`StoreIn` in Go, a second argument in R.

Two guards keep this list honest rather than aspirational: every
`/api/v1/app/*` path an SDK calls has to be a route the platform serves — in R
the method too — and every key an SDK reads out of the app's own description has
to be a key the platform sends.

## Choosing

Use the language your app is already in. The SDK is not a reason to pick one —
and an app that is R because it is doing statistics should stay R even though
its SDK surface is smaller.
