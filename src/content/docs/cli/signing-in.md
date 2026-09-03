---
title: Signing in
description: The device flow, where the credential lives, and the rule that pairs it with an address.
---

```bash
lp login https://launchpad.your-company.com
```

A browser opens, you approve the device, and `lp` stores a personal key.

## Where it is kept

`credentials.toml` under your config directory — `~/.config/launchpad/` on Linux
and macOS, `%AppData%\launchpad\` on Windows — mode `0600` inside a `0700`
directory.

It holds **nothing but credentials**. Settings live in `config.toml` beside it,
so the file people are meant to edit and the file with a secret in it never
become one file.

```toml
default = "https://launchpad.corp"

[installs."https://launchpad.corp"]
alias = "prod"
token = "lpu_…"
user  = "ada@corp.com"
expires_at = 2026-11-19T09:30:00Z
```

## The credential is never a flag

There is no `--token`. A secret on a command line lands in shell history and in
the process table, where anything on the machine can read it.

| How | For |
|---|---|
| `lp login` | Normal use. |
| `LAUNCHPAD_TOKEN` | CI. **Must** be paired with `LAUNCHPAD_URL`. |
| `LAUNCHPAD_TOKEN_FILE` | A mounted secret — the path is not sensitive, the variable is. |
| `--token-stdin` | Piped in, for a CI machine whose key a human minted. |

:::caution
**A credential and an address are one statement.** An environment token is used
when, and only when, the install was resolved from `LAUNCHPAD_URL` too. Every
other combination is exit 2, naming both halves — including the stored default.

`--install staging` on a machine holding a production token is exactly the
accident that rule exists to catch: `--install` names an install, not a
credential, so it does not complete the pair.

Setting both `LAUNCHPAD_TOKEN` and `LAUNCHPAD_TOKEN_FILE` is a **refusal, not a
precedence rule**.
:::

## A key has a scope

A personal key is **`read` or `full`**, chosen when it is created and never
edited. Full does everything you can do; read reaches every `GET` you are
allowed and is refused every other method.

**`lp login` always creates a full-scope key** — there is no `--scope`. So a
read-scoped credential in a pipeline got there deliberately: somebody minted one
in the browser and handed it over with `--token-stdin`.

When one is refused a write you get the install's own sentence plus a line
saying what happened, because otherwise a pipeline log reads as a permission
failure rather than as the credential doing exactly what it was created to do. A
read-scoped key is **replaced, not widened**.

Two things a scope is not:

- **Not safe to leak.** A read-scoped key still reads everything you can read.
- **Not a fence around your apps.** A scope bounds Launchpad's own API. It says
  nothing about what a deployed app does with a request — a read-scoped key can
  `POST` through the apps gateway to an app that accepts one.

## Expiry

`expires_at` is what the install said when it minted the key. **Absent means
unknown, never "never"** — a `--token-stdin` login stores none.

Within fourteen days you get one dimmed line on stderr, once per invocation and
**never on stdout**, so it cannot corrupt a pipe.

**Nothing client-side decides a credential has expired.** The install answers
`401`, and that is exit 3.

## Forgetting

`lp login --status` says who and where. `--forget [install]` and `--forget-all`
drop stored credentials.

**They do not revoke the keys.** That is the keys page on the install, and the
command says so.

## http://

`lp login` refuses `http://` outside loopback before it makes any request. Every
other command says one dimmed line instead, because a stored `http://` install
is somebody's dev setup rather than a mistake.
