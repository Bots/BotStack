# Getting Started With Botstack

This guide assumes you are comfortable copying commands into a terminal, but you
do not need to know how Botstack works internally.

## 1. Check Requirements

Botstack works on Mac and Linux.

Check that Node.js is installed:

```sh
node --version
```

You need Node.js 20 or newer.

Check that Git is installed:

```sh
git --version
```

## 2. Install Botstack

Run:

```sh
curl -fsSL https://raw.githubusercontent.com/Bots/BotStack/main/install.sh | sh
```

This only installs Botstack itself. It does not install the tool stack yet.

Now enter the Botstack folder:

```sh
cd ~/.botstack/botstack
```

## 3. List Available Tools

Run:

```sh
node bin/botstack tools
```

This shows:

- tool names
- what each tool does
- which setup it belongs to
- which AI coding apps it supports

## 4. Pick Your AI Coding App

Use one of these names when you run Botstack:

| App | Botstack name |
| --- | --- |
| Codex CLI | `codex` |
| OpenCode | `opencode` |
| Claude Code | `claude` |
| Aider | `aider` |
| Continue | `continue` |

## 5. Preview First

Preview the basic setup for Codex CLI:

```sh
node bin/botstack install --plan --stack base --harness codex
```

Preview the basic setup for OpenCode:

```sh
node bin/botstack install --plan --stack base --harness opencode
```

Important: `--plan` means Botstack only shows what it would do. It does not
change files.

## 6. Install After Reviewing

If the preview looks right, remove `--plan` and add `--yes`.

For Codex CLI:

```sh
node bin/botstack install --yes --stack base --harness codex
```

For OpenCode:

```sh
node bin/botstack install --yes --stack base --harness opencode
```

Botstack will run the install commands shown in the preview.

For the base stack, that currently includes:

- GStack
- Serena MCP
- GBrain

For the everything stack, it also includes:

- Graphify

## 7. If Something Fails

Read the final report printed by Botstack.

Botstack records what happened here:

```text
~/.botstack/state/install-ledger.jsonl
```

Backups of changed config files go here:

```text
~/.botstack/state/backups/
```

## Plain-English Glossary

- **Harness**: the AI coding app Botstack configures, such as Codex CLI or OpenCode.
- **Stack**: a group of tools. `base` is the normal starter set. `everything` includes optional tools too.
- **Plan**: a preview of what Botstack would do.
- **Ledger**: a log file that records what Botstack tried, what worked, and what failed.
