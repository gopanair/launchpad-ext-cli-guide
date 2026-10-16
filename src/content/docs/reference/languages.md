---
title: Language notes
description: The same model in four spellings, and what differs.
---

One model, four languages. The differences are naming conventions, not
capabilities.

## Go

```go
import "toft"

toft.App.Self(ctx)
toft.Data.Get(ctx)
toft.Notify.Slack(ctx, "done")
toft.Jobs.Start(ctx, "reconcile", opts)
me, err := toft.ViewerFor(r.Header)
who, err := toft.Who(ctx, r.Header)
c := toft.CallerFor(r.Header)
```

`context.Context` first, `error` last. `toft sdk vendor` writes a `go.work` with a
relative `use` — see [Vendoring it](../../sdk/vendoring/).

## Node

```js
import toft from "@larchway/toft";

await toft.app.slug();
await toft.data.update((s) => { s.runs++; });
await toft.notify.email({ to, subject, text });
const me = toft.viewer(req.headers);
const who = await toft.who(req.headers);
const c = toft.caller(req.headers);
```

Promises throughout except `caller`, `task` and `run`, which are local.

## Python

```python
import toft

toft.app.slug()
toft.data.update(bump)
toft.notify.slack("done")
toft.jobs.start("reconcile", params=params)
toft.viewer(headers); toft.who(headers); toft.caller(headers)
toft.scratch_dir("uploads"); toft.session_scratch_dir(sid)
```

`snake_case`. Types worth naming are exported: `Identity`, `Caller`, `Viewer`,
`Send`, `JobRun`, `Document`, `VersionConflict`, `QueueFull`, `ToftError`.

## R

```r
app_info(); app_base_path()
app_data_get(); app_data_set(list(period = p))
notify("done")
job_start("reconcile"); job_status(id); scheduled_for()
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
  person. Inside a job, the instant the run is for — `run.scheduled_for`,
  `run.scheduledFor`, `run.ScheduledFor()`, `scheduled_for()` — and sending
  notifications works the same way it does from the app.
- **Off-platform, every call fails naming the missing environment variable.**
  No dry-run mode, in any language.
- **Where the app is mounted**: `toft.app.base_path`, `basePath()`, `BasePath`,
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
