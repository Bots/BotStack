# Botstack

Botstack is a guided installer for a trusted AI agent harness base stack.

It helps local-agent builders install and verify tools like GStack, Serena MCP,
GBrain, and Graphify without hand-wiring every config file from scratch.

## Current Status

This repo is in the foundation phase. The implemented CLI can:

- load versioned built-in plugin manifests
- validate manifest shape at runtime
- build a dry-run install plan
- generate reference docs from manifests
- execute simple filesystem/config operations against a selected home directory
- write a local install ledger

Real upstream installers are intentionally not wired yet. The current manifests
create tool directories and record safe harness notes so the installer contracts
can be tested first.

## Quickstart

Inspect the base plan without writing files:

```sh
node bin/botstack install --plan --stack base --harness codex
```

Inspect the all-tools plan:

```sh
node bin/botstack install --plan --stack everything --harness codex --harness opencode
```

Generate manifest-derived reference docs:

```sh
npm run docs:generate
```

Run tests:

```sh
npm test
```

## Safety Model

Botstack should show writes before applying them. `--plan` must not write files.
When execution is enabled, Botstack records step state in:

```text
~/.botstack/state/install-ledger.jsonl
```

Config writes use typed operations such as managed blocks, JSON merge, and TOML
managed blocks instead of arbitrary string edits.
