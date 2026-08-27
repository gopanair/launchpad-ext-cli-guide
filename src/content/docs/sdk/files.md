---
title: Files and scratch space
description: Ephemeral scratch, durable stores, and the session-scoped corner between them.
---

Two different things, and picking the wrong one is the usual mistake.

## Scratch — ephemeral, local, no network

```go
dir := lp.ScratchDir("uploads")
```
```js
lp.scratchDir("uploads");
```
```python
lp.scratch_dir("uploads")
```
```r
scratch_dir("uploads")
```

Per app. Fast. **Goes away.** For an upload you are about to process, a
temporary render, an intermediate file in a pipeline.

Never put anything there you would mind losing on a restart.

## A session's corner of it

```go
lp.SessionScratchDir(sessionID)
lp.NewSessionID()          // for a viewer who signed in nowhere
```
```js
lp.sessionScratchDir(sessionId);
lp.newSessionId();
```

One browser login's own corner of scratch, hashed from the session id so two
people working at once do not collide. `newSessionId()` covers the visitor who
is not signed in to anything.

## Storage — durable, named

```go
path := lp.Storage("reports")             // a mapped volume, by name
err := lp.Store("reports").Put(path, name)  // a file into an object store
```
```js
lp.storage("reports").path;
await lp.store("reports").put(file);
```

Resolved **by name**, not by path. Your app says `"reports"` and the platform
resolves it to whatever the administrator mapped — so the same code works in
shared and isolated mode, and on a different install.

## The rules that will bite you

**A mapping is an app's and a grant is a person's, and neither implies the
other.** Your app having `"reports"` mapped does not mean you can browse it in
the UI, and you holding a grant does not give your app anything.

**Absent, not off.** If no storage is configured, `storage()` fails naming what
is missing. It does not return an empty directory that silently swallows files.

**The URL is never more generous than the mount.** A signed URL cannot reach
outside what was mounted, and a level is *which* mount you got rather than a
permission you asked for.

**A file is added, never replaced**, through an integration attachment: the
folder is the attachment's and the name is yours, and a name that is really a
path is refused rather than sanitised.

## Databases

A `.sqlite` or `.duckdb` file on a mapped volume is opened **directly at the
path**. There is no SDK call for it, and there does not need to be.
