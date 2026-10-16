---
title: Notifications
description: Sending as the app, and what a send actually promises.
---

```go
toft.Notify.Slack(ctx, "Ingest finished: 1,204 rows")
toft.Notify.SlackFile(ctx, f, toft.SlackFileOptions{Title: "Weekly reconciliation"})
toft.Notify.Email(ctx, toft.EmailMessage{To: to, Subject: subject, Text: body})
```
```js
await toft.notify.slack("Ingest finished: 1,204 rows");
await toft.notify.email({ to, subject, text });
```
```python
toft.notify.slack("Ingest finished: 1,204 rows")
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
const send = await toft.notify.slack("done");
const status = await toft.notify.status(send.id);
```

**No status is ever a lie.** If it says it sent, it sent.

## Ask first

```js
if (!(await toft.app.can("slack"))) {
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

## From a job

The same calls work inside a [job](../jobs/), in all four languages. A job holds
no app token, so the SDK sends with the run's own credential, which the platform
accepts for sending through the app's integrations **and nothing else** — the
same gates, the same record, the same integrations an administrator attached to
the app. That is how a batch app with no web server mails its nightly report.

Send before the job's command exits: once the run has finished, its credential
is refused.

## Nothing here reads

Integrations are outbound only. You cannot use one to read a channel, list
files, or fetch a message. There is no inbound half.

## Residue outlives you

Three kinds leave residue on the far side — a message, a file — and its record
outlives both the ledger's retention and the app itself. **Detaching reaches
nothing already written.** Detach is not deletion.
