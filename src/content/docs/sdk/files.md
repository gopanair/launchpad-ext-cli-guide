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
```r
storage("reports")$path
store_put(store("reports"), path, name)   # a file into an object store
```

**In R, `store_put()` is the write.** `file.copy()` onto a store mount produces a
zero-byte object: a store has no append, and a copy is not one write.

Resolved **by name**, not by path. Your app says `"reports"` and the platform
resolves it to whatever the administrator mapped — so the same code works in
shared and isolated mode, and on a different install.

## When one name is two mounts

A mapping's identity is `(resource, app, folder)`, so an administrator can
attach one resource **twice**: the root read-only, and a folder at `write`, at
two paths in one workload. That is the shape the feature exists for — a corpus
you read and a drop you write — and both arrive under the same name.

The folder is what tells them apart:

```python
lp.storage("drop", folder="backup").path
lp.store("drop", folder="backup")
```
```js
lp.storage("drop", { folder: "backup" });
```
```go
lp.StorageIn("drop", "backup")     // Go has no keyword arguments
lp.StoreIn("drop", "backup")
```
```r
storage("drop", "backup")
```

**A name matching two mounts, with no folder named, raises** — listing what is
mounted and at what level — rather than picking one. Returning the first would
answer by the alphabetical order of paths somebody else chose, which is a silent
answer to a question the caller did not know they were asking.

Omitting the folder means *do not care*, which is the ordinary case and is only
ambiguous when there genuinely is more than one. An empty folder names the root
explicitly.

Every key the platform puts in the storage description is a key every SDK reads,
in both directions, and a test holds that — so a mount you can see on the app's
page is a mount you can address from code.

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
