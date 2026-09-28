#!/usr/bin/env bash
# new_project.sh TARGET_DIR
#
# Builds a ready-to-edit Remotion project for this style from zero:
#   copies assets/starter (style kit + sound-effect kit + a StyleCheck video),
#   installs Remotion under Node 22, typechecks, and renders out/style-check.mp4.
# If that file plays with graphics and clicks, the machine is ready.
#
# Needs (the script tells you what's missing): Node 22, ffmpeg.
set -euo pipefail
TARGET="${1:?usage: new_project.sh TARGET_DIR}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"

# Node 22 — Remotion hangs silently on newer Node (26), so prefer Homebrew's node@22
for d in /opt/homebrew/opt/node@22/bin /usr/local/opt/node@22/bin; do [ -x "$d/node" ] && export PATH="$d:$PATH"; done
if ! command -v node >/dev/null; then
  echo "✗ Node.js is not installed. Run in Terminal:  brew install node@22"; exit 1; fi
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if [ "$NODE_MAJOR" != "22" ]; then
  echo "✗ Node $NODE_MAJOR found, but this needs Node 22. Run in Terminal:  brew install node@22"; exit 1; fi
command -v ffmpeg >/dev/null || { echo "✗ ffmpeg missing. Run in Terminal:  brew install ffmpeg"; exit 1; }

if [ -e "$TARGET/package.json" ]; then echo "✗ $TARGET already has a project — pick a new folder"; exit 1; fi
mkdir -p "$TARGET"
cp -R "$HERE/assets/starter/." "$TARGET/"
cd "$TARGET"
echo "→ installing Remotion (first time takes a few minutes)…"
npm install --no-audit --no-fund --loglevel=error
echo "→ typechecking…"
npx tsc --noEmit
echo "→ rendering the style check…"
npx remotion render src/index.ts StyleCheck out/style-check.mp4 --log=error
echo "✓ ready: $(pwd)/out/style-check.mp4 — open it; you should see a title card, four glowing cards, and hear clicks."
