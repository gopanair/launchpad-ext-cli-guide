---
title: The app itself
description: Identity, and asking what an administrator attached.
---

## Who am I

```go
self, err := lp.App.Self(ctx)     // id, slug, mode
```
```js
await lp.app.slug();
```
```python
lp.app.slug()
```
```r
app_info()
```

Useful for building a link back to yourself, and for logging that names the app
rather than the process.

## Where am I mounted

```python
lp.app.base_path()
```
```js
lp.app.basePath();
```
```go
lp.App.BasePath()
```
```r
app_base_path()
```

Your app is served under `/apps/<slug>`, and this is that prefix — what every
link and form action has to carry. It falls back to `BASE_PATH` in the
environment, so it answers the same thing whichever way you got there. See the
[base paths](../../reference/environment/) rule for which half of a response
carries it and which must not.

## Which mode am I in

`self.mode` is **this workload's** mode, from the deployment that started it —
not the app's configured setting, and correct on the first request rather than
after a restart. An app that behaves differently in shared and isolated mode can
read it and be right immediately.

## What did an administrator attach

```go
ok, err := lp.App.Can(ctx, "email")
```
```js
if (await lp.app.can("email")) { … }
```
```python
if lp.app.can("email"): ...
```
```r
caller_can("email")
```

**Ask at startup, not at send time.** `can()` is cheap and cached. An app that
checks when it boots can render "email is not enabled for this app" on a
settings screen — which somebody can act on — instead of failing at 2am in a log
nobody is reading.

## An app has none of a kind until it is attached

**Absent, not off.** A kind an administrator has not attached is not a disabled
capability; it is not there. `can()` answering false means "nobody attached
one", and the fix is a conversation with your administrator, not a retry.

## What the app is not told

- **Which channel, folder or address** an integration points at. Scope is welded
  to the connection and belongs to the administrator.
- **Whether a viewer is an administrator**, from the role alone. The header
  carries no admin bit. An app that needs to know is asking about a *person* —
  that is [`who`](../viewer/).
- **Anybody's group membership.** Groups are the install's, not the app's.

## Failing off-platform

Run your app on your laptop and every platform call fails, **naming the
environment variable that is missing**. That is deliberate: there is no dry-run
mode, because an SDK that printed to a console instead of paging a channel would
be a trap that only springs in production.
