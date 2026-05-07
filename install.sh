#!/usr/bin/env sh
set -eu

BOTSTACK_REPO="${BOTSTACK_REPO:-https://github.com/Bots/BotStack.git}"
BOTSTACK_DIR="${BOTSTACK_DIR:-$HOME/.botstack/botstack}"

if ! command -v node >/dev/null 2>&1; then
  echo "botstack: Node.js 20+ is required." >&2
  exit 1
fi

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "botstack: Node.js 20+ is required, found $(node --version)." >&2
  exit 1
fi

mkdir -p "$(dirname "$BOTSTACK_DIR")"

if [ -d "$BOTSTACK_DIR/.git" ]; then
  echo "botstack: updating $BOTSTACK_DIR"
  git -C "$BOTSTACK_DIR" pull --ff-only
else
  if ! command -v git >/dev/null 2>&1; then
    echo "botstack: git is required for the early development installer." >&2
    exit 1
  fi
  echo "botstack: cloning $BOTSTACK_REPO to $BOTSTACK_DIR"
  git clone "$BOTSTACK_REPO" "$BOTSTACK_DIR"
fi

chmod +x "$BOTSTACK_DIR/bin/botstack"

echo
echo "botstack installed at $BOTSTACK_DIR"
echo "No tools were installed yet."
echo
echo "Next:"
echo "  $BOTSTACK_DIR/bin/botstack install --plan --stack base --harness codex"
echo "  $BOTSTACK_DIR/bin/botstack install --install --stack base --harness codex"
