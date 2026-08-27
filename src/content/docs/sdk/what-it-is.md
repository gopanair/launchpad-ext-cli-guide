---
title: What the SDK is
description: One import, one entry point, and the five rules that hold in every language.
---

The app SDK is how your code calls the platform back: to send a notification, to
start a job, to read the document it owns, to find out who is looking at the
page.

Four languages — **Go, Node, Python and R** — with one model behind all of them.

```go
import lp "launchpad/lp"
```
```js
import lp from "@launchpad/sdk";
```
```python
import launchpad as lp
```

## Five rules that hold everywhere

**The credential stays with the platform.** Your app never holds the Slack bot
token or the relay password, never names the channel it posts to, and never
chooses the address its mail comes from. The app supplies the message; Launchpad
supplies the identity. An administrator attaching an integration is a row they
add, and detaching it is a row they delete — not a token to rotate across every
app.

**Ask before you send.** `can()` is cheap and cached. An app that checks at
startup can tell somebody "email is not enabled for this app" on a screen,
instead of leaving it to be discovered at 2am in a log.

**Nothing blocks on delivery.** A send returns once the platform has accepted
and *recorded* it. Delivery happens after. The record — not the message — is
what a workflow may rely on, and you can read it back.

**Off-platform it fails rather than pretending.** Every call that needs the
platform names the environment variable that is missing. There is deliberately
**no dry-run mode**: an SDK that printed to a console instead of paging a channel
would be a trap that only springs in production. Develop against a real install.

**Background work is a different entrypoint of this same app.** `jobs.start`
runs a command `launchpad.toml` declares, from the same release, as an isolated
workload with a memory limit and a deadline — in *both* execution modes, because
moving twelve minutes and six gigabytes out of the app's own process is the
point rather than a side effect.

## Two objects, and choosing between them is the decision

`lp.jobs` is **the app acting as itself**.
`lp.viewer(headers).jobs` is **the app acting for the person looking at the
page**.

That is two objects rather than a flag on one, because a flag would make the
anonymous case the default spelling of the attributed one — and attribution
would then be lost by omission rather than by choice.

## The surface

```
app        who am I, and what did an administrator attach
data       this app's one JSON document
storage    durable files, resolved by name
scratch    ephemeral space, per app, no network
notify     slack, email, and the rest — as this app, not as you
jobs       start a different entrypoint of this app
viewer     act for the person looking
who        who is looking; null for anonymous
caller     what they may do, verified locally with no round trip
task       inside a scheduled firing; null on an ordinary visit
run        inside a job; null everywhere else
```
