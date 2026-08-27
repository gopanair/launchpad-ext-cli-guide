---
title: The six roles
description: The words on the wire, what each means, and how the signature works.
---

Every request Launchpad forwards carries a role: **what the caller may do**, not
who they are.

## Seven constants. Six arrive on the wire.

| Word | Who |
|---|---|
| `anonymous` | A visitor not signed in to Launchpad. Only a public app sees it. |
| `viewer` | May look. |
| `editor` | May change. |
| `owner` | Owns this deployment. |
| `system` | Launchpad acting on its own — a scheduled task firing on its schedule. |
| `app` | An app credential: an app key at the gateway, or an app-started job's callback. |
| `unknown` | **Never arrives.** Every failure resolves here. |

`unknown` is no header, no key, a bad signature, a blob for another app, or an
expired one. **It is never privileged**, and every `atLeast` against it is false.

## A manual firing is not `system`

A scheduled task firing on its schedule is `system`. The **same** schedule fired
by hand carries the role of whoever pressed the button. Do not treat a task
request as proof that nobody is there.

## An administrator reads as `viewer`

A Launchpad administrator with no grant on your app reads as `viewer`. **The
header carries no admin bit.**

That is deliberate: an app asking "is this person an administrator" is asking
about a *person*, which is what [`who`](../../sdk/viewer/) is for.

## How it is signed

Per app, per start, **derived and never stored**. Your app verifies it against
`LAUNCHPAD_ROLE_KEY` with no round trip.

It is signed rather than stripped because stripping answers the visitor and not
the neighbour on loopback — in shared mode, another process on the box can reach
your port.

**A version this SDK does not know is refused rather than parsed leniently.**
The fields are positional, and a future format misread as this one is how a
verifier comes to answer confidently about the wrong thing.

## Comparing

```js
if (!c.atLeast(lp.ROLE_EDITOR)) return res.status(403).end();
```

`atLeast` walks `viewer < editor < owner`. `anonymous`, `system`, `app` and
`unknown` are not on that ladder — **a rung is no longer a human**, and nothing
here can tell you one is there.

An app key may carry one of two roles as a stored grant, **bounded by the gate's
answer and never by the ladder's** — narrowed, never widened.

## Why it is not behind the identity switch

`who` is off unless an administrator enables viewer identity. The **role is
not**, and it may not be off by default: a role is not an identity, and an app
that cannot tell an editor from a visitor cannot be written safely at all.
