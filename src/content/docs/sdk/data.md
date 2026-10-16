---
title: App data
description: The one JSON document, its three states, and writing it safely.
---

Every app has **one JSON document**, 256 KiB. No keys, no collections, no
listing, no queries.

```go
doc, err := toft.Data.Get(ctx)
err = toft.Data.Set(ctx, settings)
err = toft.Data.Update(ctx, bump)
```
```js
await toft.data.get();
await toft.data.set({ period });
await toft.data.update((s) => { s.runs++; });
```
```python
toft.data.get(); toft.data.set({"period": p}); toft.data.update(bump)
```
```r
app_data_get(); app_data_set(list(period = p))
```

## A write hands back what it wrote

`set` and `update` return the **document**, not an empty handle — so you do not
have to read it back to find out what was saved, and the version you now hold is
the one you just wrote.

```python
saved = toft.data.set({"period": p}).data
```

## The bytes are yours

Stored as text and **never read** by the platform. There is no schema, no
indexing, and nothing that will reject a document for its shape.

## Three states stay tellable apart

- **Never written** — nothing has ever been stored.
- **Cleared** — there was something and it was removed.
- **`{}`** — an empty object the app deliberately wrote.

These are three different answers. Code that folds "never written" into "empty"
does the wrong thing the first time somebody clears it.

## `update` is the one to reach for

`set` is last-write-wins. `update` reads, applies your function, and writes with
the version it read as a precondition — retrying if somebody got there first.

**The version is always there; the precondition is opt-in.** Two request
handlers both incrementing a counter with `set` will lose writes. With `update`
they will not.

```js
await toft.data.update((s) => { s.runs = (s.runs ?? 0) + 1; });
```

A conflict that cannot be resolved surfaces as a version-conflict error rather
than as silent data loss.

## What it is not for

A database. There are no queries, so anything you want to *search* does not
belong here — and it is one document for the whole app, so nothing per-user
does either.

It survives restart, redeploy and rollback. It is the right place for a saved
filter, a last-run timestamp, or configuration somebody edited in your UI.
