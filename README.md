# Botstack

Botstack is a guided setup tool for people who use AI coding agents.

It helps you install a useful starter kit of agent tools, such as GStack,
Serena MCP, GBrain, and Graphify, without setting up each one by hand.

Think of it like this:

- You pick the AI coding app you use, such as Codex CLI or OpenCode.
- Botstack shows what it wants to install and which files it may change.
- You preview the plan first.
- Nothing changes until you run the install command without `--plan`.

## Current Status

Botstack is still early.

Right now it can safely show plans, create tool folders, run install commands
for bundled tools, write managed config notes, generate docs, and record what
happened in an install log.

The installer is still early. Always run with `--plan` first.

## What You Need

Before using Botstack, you need:

- A Mac or Linux computer.
- Node.js 20 or newer.
- Git, if you use the one-line installer below.
- At least one AI coding agent app, such as Codex CLI, OpenCode, or Claude Code.

Check Node:

```sh
node --version
```

If the number starts with `20`, `21`, `22`, `23`, `24`, or higher, you are good.

## Easiest Setup

For the step-by-step version, read [docs/getting-started.md](docs/getting-started.md).

Run this:

```sh
curl -fsSL https://raw.githubusercontent.com/Bots/BotStack/main/install.sh | sh
```

This installs Botstack itself into:

```text
~/.botstack/botstack
```

It does **not** install GStack, Serena, GBrain, or Graphify during this bootstrap.
It only installs Botstack. You install the tool stack in a later step after
previewing the plan.

After that, go into the Botstack folder:

```sh
cd ~/.botstack/botstack
```

## Use Botstack Safely

### 1. See what Botstack knows about

```sh
node bin/botstack tools
```

This lists the tools Botstack can plan for and which AI coding apps they support.

### 2. Preview the basic setup

If you use Codex CLI:

```sh
node bin/botstack install --plan --stack base --harness codex
```

If you use OpenCode:

```sh
node bin/botstack install --plan --stack base --harness opencode
```

The word `--plan` means “show me what would happen, but do not change files.”

### 3. Preview everything

```sh
node bin/botstack install --plan --stack everything --harness codex
```

Use this when you want to see every bundled tool, including optional ones.

### 4. Install after you review the plan

Only run this after the preview looks right:

```sh
node bin/botstack install --yes --stack base --harness codex
```

For OpenCode:

```sh
node bin/botstack install --yes --stack base --harness opencode
```

The word `--yes` means “go ahead and make the changes shown in the plan.”

## Which Harness Name Should I Use?

A harness is the AI coding app you want Botstack to configure.

Use one of these names:

| If you use | Type this |
| --- | --- |
| Codex CLI | `codex` |
| OpenCode | `opencode` |
| Claude Code | `claude` |
| Aider | `aider` |
| Continue | `continue` |

Not every tool supports every app yet. Run this to check:

```sh
node bin/botstack tools
```

## What Files Can Botstack Touch?

Botstack prints the files before it changes them.

Common paths include:

- `~/.botstack/` for Botstack state and tool folders.
- `~/.codex/config.toml` for Codex CLI settings.
- `~/.codex/AGENTS.md` for Codex agent guidance.
- `~/.config/opencode/opencode.json` for OpenCode settings.
- `~/.claude.json` for Claude Code-style settings.

More detail: [docs/install-directories.md](docs/install-directories.md)

## Undo and Logs

Botstack records install steps here:

```text
~/.botstack/state/install-ledger.jsonl
```

When Botstack changes an existing config file, it creates a backup under:

```text
~/.botstack/state/backups/
```

Automatic uninstall is not finished yet. For now, use `--plan` first and review
the file list carefully before running the real install command.

## Developer Commands

If you are working on Botstack itself:

Generate manifest-derived reference docs:

```sh
npm run docs:generate
```

Run tests:

```sh
npm test
```

## Safety Model

Botstack should show writes before applying them.

`--plan` must not write files.

When execution is enabled, Botstack records step state in:

```text
~/.botstack/state/install-ledger.jsonl
```

Config writes use typed operations such as managed blocks, JSON merge, and TOML
managed blocks instead of arbitrary string edits.
