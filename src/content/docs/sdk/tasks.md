---
title: Scheduled tasks
description: Recognising a firing, and the one log the platform cannot capture for you.
---

A scheduled task is an HTTP request to a path your app published. Your handler
runs in your app's own process, like any other request.

## Recognising one

```js
const task = lp.task(req.headers);
if (task) { /* this is a firing, not a person */ }
```
```go
task := lp.TaskFor(r.Header)
```
```python
lp.task(req.headers)
```

**`null` when the request is not a firing.** An ordinary visit to the same path
gets `null`, so one handler can serve both and behave differently.

## The run's own log

```js
await task?.log("read 1,204 rows");
await task?.log("row 88 malformed", { error: true });
await task?.logLines(["…", "…"]);
```

This is the one thing **the platform cannot capture for you.** Your app's stdout
belongs to the app, not to this run — so a firing's own narrative has to be
pushed, and this is how.

It lands on the run, where somebody looking at *why last night's refresh was
wrong* will actually find it.

## Never load-bearing

**Both SDKs swallow every failure and return false**, and stop pushing after the
first refusal. Logging that could take down the thing it observes is worse than
no logging.

So do not branch on whether a log call succeeded.

## Closed runs

Only a `running` run accepts lines. Otherwise you get **409 `run_finished`**,
naming the timeout.

That refusal is the situation this feature exists for: your handler ran past its
deadline and is still writing. A generic error there would read as a broken SDK
rather than as the fact it is.

## Who fired it

A task firing **on its schedule** carries the role `system`. A **manual** firing
of the same schedule carries the role of whoever pressed the button.

Do not assume a task request means nobody is there.

## Protect the path

It is a path in your app, reachable like any other. `lp.task(headers)` tells you
a request *is* a firing, but you should still give the endpoint a check of its
own — a shared secret from an environment variable is the usual approach.

## Limits

A scheduled task has a **tighter ceiling and a smaller memory envelope than a
job**. If the work is minutes and gigabytes, have the handler start a
[job](../jobs/) and return.
