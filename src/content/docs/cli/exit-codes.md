---
title: Exit codes
description: The contract, and the distinctions that matter in a pipeline.
---

```
0  it worked
1  the platform did the thing and it failed
2  usage or configuration
3  not authenticated, or refused
4  could not reach the install
```

Documented and tested. They are a contract, not an implementation detail.

## The distinctions that matter

**1 and 3 are different failures.** A build that ran and failed is `1`. A
credential the install rejected is `3`. Retrying `3` forever will not help.

**4 is not 3.** An install you could not reach at all is a network problem;
retry it. A refusal is an answer; do not.

**2 is yours.** Usage or configuration — a missing `[app]` table, a token
without its URL, a flag combination that is refused. It will not fix itself.

Three things land on `2` that a caller might expect on `1` or `3`, all for the
same reason — nothing was attempted, so nothing ran and failed:

- **A locked app.** `lp deploy` against one is `2`, and the refusal names who
  locked it: an administrator, or the dependency sweep.
- **A name that does not resolve.** `lp job run <unknown>`,
  `lp task run <unknown>`, `lp link` in a directory already linked.
- **A path matching no route.** `lp api GET nosuchroute` is `2` naming the path,
  with `code: route_not_found` — a typo, not a credential problem.

## A run's outcome is the exit code

`lp job run` and `lp task run` **wait by default**, and the run's outcome
becomes the process's exit code.

```bash
lp job run nightly-report --param region=emea   # non-zero if the job failed
```

That is the point: a failing nightly job fails your pipeline without you parsing
any output.

**`skipped` is exit 1 for a task.** A firing that did not happen is not a
success, and collapsing it into 0 would make a broken schedule invisible.

**The exit code is the run's in every rendering, `--json` included.** The
document prints on stdout *and* the process exits non-zero. A caller reading the
document does not have to also decide what it means.

## `--wait` on a restart

`lp restart --wait` polls until the status settles.

- `running`, `sleeping` → 0
- `crashed`, `failed` → 1

**Without `--wait`, exit 0 means the platform accepted the request** — which is
all a `202` asserts. It does not mean the app came up.

## Nothing client-side decides expiry

`lp` never decides your credential has expired. The install answers `401
key_expired`, and that is exit 3.
