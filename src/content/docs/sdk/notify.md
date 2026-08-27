---
title: Notifications
description: Sending as the app, and what a send actually promises.
---

```go
lp.Notify.Slack(ctx, "Ingest finished: 1,204 rows")
lp.Notify.SlackFile(ctx, f, lp.SlackFileOptions{Title: "Weekly reconciliation"})
lp.Notify.Email(ctx, lp.EmailMessage{To: to, Subject: subject, Text: body})
```
```js
await lp.notify.slack("Ingest finished: 1,204 rows");
await lp.notify.email({ to, subject, text });
```
```python
lp.notify.slack("Ingest finished: 1,204 rows")
```
```r
notify("Ingest finished: 1,204 rows")
```

## As this app, not as you

The message is yours; the identity is the platform's. Your app does not hold the
bot token, does not name the channel, and does not choose the From address.

**An app never speaks in the platform's voice.** A message from your app is
attributed to your app.

## What a send promises

**It returns once the platform has accepted and recorded it.** Delivery happens
after, and the call does not wait for it.

So the returned `Send` names a **record**, and that record — not the message —
is what a workflow may rely on:

```js
const send = await lp.notify.slack("done");
const status = await lp.notify.status(send.id);
```

**No status is ever a lie.** If it says it sent, it sent.

## Ask first

```js
if (!(await lp.app.can("slack"))) {
  return renderSetupHint();
}
```

An app has none of a kind until an administrator attaches one. Checking at
startup turns a 2am mystery into a sentence on a settings screen.

## Four gates

Every send passes the same four gates, with distinct codes, **re-checked before
the transport**. A capability that was there when you checked and is gone by the
time you send is refused rather than sent anyway.

## Failure

**A chosen destination that stops working fails. It never falls back.** Routing
resolves in one place, and a broken destination is an error you can see rather
than a message that quietly went somewhere else.

## Nothing here reads

Integrations are outbound only. You cannot use one to read a channel, list
files, or fetch a message. There is no inbound half.

## Residue outlives you

Three kinds leave residue on the far side — a message, a file — and its record
outlives both the ledger's retention and the app itself. **Detaching reaches
nothing already written.** Detach is not deletion.
