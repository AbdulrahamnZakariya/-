#!/usr/bin/env bash
# slim_public.sh PUBLIC_DIR DEST_DIR path [path ...]
#
# Builds a small public dir of HARD LINKS to only the assets one composition uses,
# then render with:  npx remotion render ... --public-dir="$DEST_DIR"
#
# Why: my-video/public holds >1 GB of other videos' footage; Remotion copies the
# public dir during bundling, and on this 228 GB disk that repeatedly ran it out
# of space (ENOSPC) mid-render. Hard links cost ~0 bytes and stay in sync.
# Paths are relative to PUBLIC_DIR; a directory is linked file by file.
set -euo pipefail
PUB="$1"; DEST="$2"; shift 2
mkdir -p "$DEST"
for p in "$@"; do
  if [ -d "$PUB/$p" ]; then
    mkdir -p "$DEST/$p"
    for f in "$PUB/$p"/*; do ln -f "$f" "$DEST/$p/$(basename "$f")"; done
  else
    mkdir -p "$DEST/$(dirname "$p")"
    ln -f "$PUB/$p" "$DEST/$p"
  fi
done
du -sh "$DEST"
