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

[jobs.nightly-report]
command       = "python -m reports.nightly"
schedule      = "0 6 * * *"        # optional; omit for a job you start yourself
timezone      = "Europe/London"    # optional; the schedule is UTC without it
expect_within = "26h"              # optional; owners are told if it goes this long without succeeding
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

Runs a command `launchpad.toml` declares, **from the same release**, as a
process of its own with a memory limit, a deadline and a durable record —
**whatever mode your app runs in**.

That last part is the point rather than a side effect: moving twelve minutes and
six gigabytes out of your request-serving process is why this exists, and it
should not depend on how the install happens to run apps.

**Where it runs is the install's choice.** On an install with a cluster, every
run gets a container. On one without, it runs on the install's own machine,
under your app's account, in a process group and a working directory of its
own. `lp job runs` marks a run that ran there. The one difference worth
designing for: on the install's own machine the memory limit is **checked by
sampling**, so a sudden spike can pass it before the run is stopped. A job that
genuinely needs gigabytes belongs on an install with a cluster.

**It never blocks on the work.** You get a run id back.

## Schedules, time zones and silence

A `schedule` is five cron fields, read in **UTC** unless `timezone` names a
zone. A zoned schedule is applied on the wall clock: `0 6 * * *` in
`Europe/London` fires at 06:00 London time all year, **once** per scheduled
time, through both daylight saving changes. Use the `timezone` key — a zone
typed into `schedule` beside it is refused.

`expect_within` is how long the job may go **without a success** before its
owners are told — `"26h"`, `"7d"`, anywhere from one hour to 31 days. A job that
fails already sends a notice; this catches the one that quietly stops running.
It is reported once, and the job's next success clears it. A job somebody
switched off is never overdue, and the window starts again when it is switched
back on.

Like the command, both live in the repository: the next deploy puts back
whatever the file says.

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

## The instant a run is for

```python
lp.run.scheduled_for        # datetime, or None
```
```js
lp.run.scheduledFor         // Date, or null; scheduledForText keeps the zone offset
```
```go
at, ok := lp.CurrentRun().ScheduledFor()
```
```r
scheduled_for()             # POSIXct in UTC, or NULL; attr(x, "text") keeps the offset
```

**A scheduled run knows which tick it is.** The 03:00 run is the 03:00 run even
if it waited behind a full queue and started at 03:40, and the value is written
in the schedule's own zone. A retry carries its original's.

**A manual run has one only if somebody names it** — `lp job run --for`, or the
*Run for* action on the app's Automation tab. It is **never defaulted to now**, so a
re-run of Tuesday's work on Thursday processes Tuesday, and a job that finds no
instant can decide for itself what that means. An app starting its own job does
not pass one: an app starting itself is acting now.

A run your app started or listed carries the same instant as an RFC 3339 string,
`""` when there is none — `run.scheduled_for` in Python, `run.ScheduledFor` in
Go, and `run.scheduledFor` in Node. Note that in Node the same name is a string
on a run you hold and a `Date` on `lp.run` inside the job.

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
  separate process running a command from the same release, and a document's
  release carries its venv or R library like any other. So `[jobs]` works, and
  inside the job the SDK is fully present — `run` populated, `mounts()`
  answering, storage writable. It is the one way a document app does anything
  after its build. What it still cannot do is see a request.
- **A batch app is nothing but jobs.** A `[batch]` table in `launchpad.toml`
  deploys a program with no web server — Node, Python, Go or R — and starts
  nothing; its work is its `[jobs]`. Restart, start and stop answer
  `no_service`, and it cannot have scheduled tasks. See
  [Deploying](../../cli/deploying/).
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

**Recording a result does not end the run.** `run.set_result(...)` in Python,
`run.setResult(...)` in Node and `run.SetResult(ctx, ...)` in Go store the run's structured result and the job carries on
— a send or a log line after it still counts. The run ends when your command
exits, and its exit code decides how. So a job that records a result and then
fails is a failed run, as it should be.

**A job can send, and do nothing else as the app.** `lp.notify` — Slack, email,
any integration an administrator attached to the app — works inside a job, in
all four languages, through the run's own credential. It passes the same gates
as a send from the app, and is recorded the same way. That is how a batch app
mails its nightly report.

Everything else on the app surface is refused from a job with `job_send_only`:
the app's data document, viewer identity, and starting another job. A job holds
no app token, and the refusal names the reason rather than reading as something
broken. Carry anything else out of the run with `set_result` or
an output file, and let the app fold it in. Once the run has finished its
credential is refused, so send before your command exits.

`command` is run with the release's own interpreter — `python jobs/report.py`
means the Python your app resolved, not whichever one is first on the image's
`PATH`.
