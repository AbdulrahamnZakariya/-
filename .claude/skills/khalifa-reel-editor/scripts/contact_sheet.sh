#!/usr/bin/env bash
# contact_sheet.sh VIDEO OUTDIR [FPS=2] [COLS=10]
#
# Tiles frames from a render into sheets with Instagram Reels' UI zones tinted red,
# so layout, safe-zone and continuity problems show up at a glance:
#   top    ~220px  (Reels header)
#   bottom ~420px  (username / caption / audio row), y > 1500 on 1080×1920
#   right  ~130px  between y≈980–1500 (like / comment / share column)
# Works at any render scale (zones are proportional). This ffmpeg has no drawtext,
# so sheets carry no timestamps: sheet N, cell k (0-based) = ((N-1)*COLS*2 + k) / FPS seconds.
set -euo pipefail
VIDEO="$1"; OUT="$2"; FPS="${3:-2}"; COLS="${4:-10}"
mkdir -p "$OUT"
ffmpeg -v error -y -i "$VIDEO" -vf "fps=${FPS},\
drawbox=x=0:y=0:w=iw:h=ih*220/1920:color=red@0.3:t=fill,\
drawbox=x=0:y=ih*1500/1920:w=iw:h=ih*420/1920:color=red@0.3:t=fill,\
drawbox=x=iw-iw*130/1080:y=ih*980/1920:w=iw*130/1080:h=ih*520/1920:color=red@0.3:t=fill,\
scale=270:-1,tile=${COLS}x2" "$OUT/sheet_%02d.jpg"
N=$(ls "$OUT"/sheet_*.jpg | wc -l | tr -d ' ')
echo "wrote $N sheets to $OUT — each covers $(echo "$COLS*2/$FPS" | bc -l | xargs printf '%.1f')s"
