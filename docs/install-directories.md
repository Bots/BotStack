# Install Directories

Botstack writes only to paths it shows in the install plan.

Default paths:

- `~/.botstack/` — Botstack-managed state and installed tool directories.
- `~/.botstack/tools/<tool>` — default tool installation directories.
- `~/.botstack/state/install-ledger.jsonl` — append-only install state ledger.
- `~/.botstack/state/backups/<run-id>/` — backups created before config mutations.

Harness config paths used by v1 planning:

- `~/.codex/config.toml` — Codex CLI config.
- `~/.codex/AGENTS.md` — Codex agent guidance.
- `~/.config/opencode/opencode.json` — OpenCode config.
- `~/.claude.json` — Claude Code-style user config.
- `~/.aider.conf.yml` — Aider config.
- `~/.continue/config.json` — Continue config.

Real upstream install sources are not finalized yet. Until then, built-in
manifests use safe directory creation, managed config notes, and placeholder
verification commands.
