---
title: Jobs
description: Starting a different entrypoint of this app, as the app or as a person.
---

```toml
# launchpad.toml
[jobs.reconcile]
command = "python jobs/reconcile.py"
timeout = 900
memory  = 2048
```

```go
run, err := lp.Jobs.Start(ctx, "reconcile", opts)
```
```js
await lp.jobs.start("reconcile", { params });
```
```python
lp.jobs.start("reconcile", params=params)
```
```r
job_start("reconcile")
```

## What it actually does

Runs a command `launchpad.toml` declares, **from the same release**, as an
isolated workload with a memory limit, a deadline and a durable record — **in
both execution modes**.

That last part is the point rather than a side effect: moving twelve minutes and
six gigabytes out of your request-serving process is why this exists, and it
should not depend on how the install happens to run apps.

**It never blocks on the work.** You get a run id back.

## As the app, or as a person

```js
await lp.jobs.start("reconcile", { params });               // as the app
await lp.viewer(req.headers).jobs.start("reconcile", {});   // as the person
```

Two objects, not a flag. A flag would make the anonymous case the default
spelling of the attributed one, so attribution would be lost by omission rather
than by choice.

**`viewer()` throws when there is nobody to act for.** A silent downgrade would
move a run out of somebody's name and into nobody's, which is exactly the thing
an audit trail exists to prevent.

```js
await lp.viewer(req.headers).jobs.mine("reconcile", { limit: 20 });
```

An app can only resolve the runs **it triggered**.

## Parameters are never a command

```js
await lp.jobs.start("reconcile", { params: { region: "emea" } });
```

Parameters are passed to your process as values. They are **never interpolated
into the command**, which is what makes it safe to let a viewer supply one.

## Waiting, and retries

```js
const run = await lp.jobs.start("ingest", {});
await run.wait();
```

`wait()` reports the outcome of the **chain**, not of its first link. If the
platform retried, `done` is false on the superseded run and `refresh()` returns
the newer attempt — so an app polling the run it started is never told `failed`
for work the platform was in the middle of redoing.

Retries are **opt-in, unattended-only, and never silent**.

## Refusals

- An app can only start **its own** jobs.
- **A viewer who started a run sees that run and no other.** A run somebody
  else started is `404` to them, because its existence is theirs.
- **A document app can still run jobs**, and that surprises people. A rendered
  `.Rmd`, `.qmd` or `.ipynb` has no process behind the page, but a job is a
  separate container running a command from the same release, and a document's
  release carries its venv or R library like any other. So `[jobs]` works, and
  inside the job the SDK is fully present — `run` populated, `mounts()`
  answering, storage writable. It is the one way a document app does anything
  after its build. What it still cannot do is see a request.
- **A static app cannot have jobs at all** — a `launchpad.toml` declaring one
  fails the deploy with `manifest_invalid`, before anything is built. There is
  no runtime for a command to mean anything in.
- A full queue is its own error, not a generic failure.
- Jobs unavailable on this install is the install's refusal, verbatim.

## Inside the job

```js
lp.run     // this run's own view of itself; null everywhere else
```

Report progress, read the payload, write output — all through `run`, and never
by handling a credential yourself. Two things about it are worth knowing before
you write the handler:

**A run given no payload is given no input location.** The variable is absent
rather than pointing at an object that was never written, so *"was I given
one?"* is answerable by looking. A run started with parameters alone has no
input — read the parameters.

**Read the payload at the start of the run.** The link the platform minted for
it is presigned and expires; a job that reads its input an hour in gets a
refusal about the link, and the SDKs say so in those words rather than as a
generic failure.

**A job holds no app token, and is told why.** All four SDKs name the reason
rather than failing as though something were broken: a run acts as the run, and
the calls it may make are the run's own.

`command` is run with the release's own interpreter — `python jobs/report.py`
means the Python your app resolved, not whichever one is first on the image's
`PATH`.
