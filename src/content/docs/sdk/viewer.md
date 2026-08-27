---
title: Who is asking
description: caller, who and viewer — three questions that are not the same question.
---

Three entry points, and choosing between them is most of getting this right.

| Call | The question | Round trip | Anonymous |
|---|---|---|---|
| `caller(headers)` | **What may they do?** | No | `anonymous` |
| `who(headers)` | **Who are they?** | Yes | `null` |
| `viewer(headers)` | **Act as them** | Yes | throws |

## `caller` — what they may do

```js
const c = lp.caller(req.headers);
if (!c.atLeast(lp.ROLE_EDITOR)) return res.status(403).end();
```
```go
c := lp.CallerFor(r.Header)
```
```python
lp.caller(req.headers)
```
```r
caller_role(); caller_can("editor")
```

**No round trip.** The role arrives signed on the request and is verified
locally against a key in your environment.

**It never fails.** Off-platform, or on a request that did not come through the
gateway, the role is `unknown` and every `atLeast` is false. That is the safe
direction: absent, unverifiable and expired are one word, and that word refuses.

This is the one to reach for in a request handler. See
[The six roles](../../reference/roles/).

## `who` — who they are

```js
const who = await lp.who(req.headers);
if (who?.role === "owner" || who?.isAdmin) renderAdminTab();
```

Returns an identity, or **`null` for an anonymous visitor** — because that is an
answer, not a failure.

It fails for exactly one thing: **an app an administrator has not enabled viewer
identity on.** That is a configuration gap to close, not a runtime state to
branch on. `204` and `403` never collapse into each other.

Cached for 60 seconds keyed on the blob; pass `refresh` to bypass.

## `viewer` — act as them

```js
const me = lp.viewer(req.headers);
await me.jobs.start("reconcile", {});
```

**Throws when there is nobody to act for.** That is deliberate: a silent
downgrade would move a run out of a person's name and into nobody's, and you
would only find out when you needed the audit trail.

## Your app enforces its own rules

The platform tells your app what the caller may do. **Your app enforces nothing
on the platform's behalf, and the platform enforces nothing inside your app.**

If you have an admin screen, protect it yourself.

## Never assume

- **Never trust an unverified header.** Anything that can reach your app can
  send one. `caller()` verifies; reading the raw header does not.
- **A role is not an identity.** Two people with the same role are
  indistinguishable, and nothing in the role tells you a human is there at all.
- **A Launchpad administrator with no grant reads as `viewer`.** The header
  carries no admin bit. If you need to know, ask `who`.
- **Nobody-in-particular is assertable**, and it is a narrowing that one
  resolver refuses by name — an app cannot claim a run was started by somebody
  it was not.
