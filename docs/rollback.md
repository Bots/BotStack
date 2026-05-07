# Rollback

Botstack records install state in:

```text
~/.botstack/state/install-ledger.jsonl
```

Config mutation operations create backups under:

```text
~/.botstack/state/backups/<run-id>/
```

Current rollback status:

- Backups are created before managed config writes when the target file exists.
- The ledger records planned, applied, verified, failed, and skipped states.
- If a tool step fails, BotStack skips that tool's remaining steps so it does not write harness config for a tool that did not install.
- Automatic uninstall is not implemented yet.

Before public release, rollback should become an explicit command:

```sh
botstack uninstall
```

or:

```sh
botstack rollback <run-id>
```
