# Council V3 — reference implementation

Live source: `my-video/src/` (composition `CouncilVideoV3`, registered in `src/Root.tsx`, 1192 frames). Snapshot: `assets/reference-impl/` (same relative paths). For a new video, copy these into new files with a new name (`<Topic>VideoV1.tsx`, `captions-<topic>.ts`, …) — never edit another video's files, and never overwrite an existing scene; revisions get a new version.

## File map

| file | role |
|---|---|
| `CouncilVideoV3.tsx` | the composition: A-roll base, one `Layer` per EDL shot, supers, progress bar, sound |
| `captions-council-v3.ts` | `cuesV3` (supers), `EDL` (shots), `shotAt`, `F30`, `DURATION_V3` |
| `CaptionOverlayCouncilV3.tsx` | one-line supers: markup parser, fitting, placement, hide rules |
| `council-v3-transitions.ts` | hard-cut policy + the one opening move (panel drop / face push) |
| `SoundLayerCouncilV4.tsx` | every SFX cue, tiered, synced to exported scene constants; music at volume 1 |
| `scenes-council/v3/Stages.tsx` | `Room`, `Actor`, and the stage scenes (intro cards, believer, skeptic, investor, judge) |
| `scenes-council/v3/Opening.tsx` | hook (counter + bulb → fail) and reveal (judges drop behind a desk, 365 → 0) |
| `scenes-council/v3/Pixel.tsx` | `PixelBot` — original pixel creature drawn from cell lists, 4 costumes |
| `scenes-council/v3/TitleCard.tsx` | white card, `#N` + bouncing character + name typed letter by letter |
| `scenes-council/v3/Screens.tsx` | `ClaudeInput` (prompt typed into a Claude-style box), `CtaWord` |
| `scenes-council/motion.tsx` | springs (`SNAP`, `SLAM`, `SOFT`), `MaskUp`, `Shockwave`, `Sparks`, `useShake` |
| `scenes-maps/shared.tsx` | fonts (`cairo`, `poppins`), brand `C`, `SEAM_Y = 1120`, `StageClip` (pass `square`) |

## The EDL model

```ts
{ a, b, layout: "split" | "face" | "full" | "title", g?: Graphic, anchor?: seconds, scale?: number }
```

- `a`/`b` are seconds; `F30 = s => Math.round(s*30)`. Cut on sentence boundaries from the cues.
- Each graphic runs on **its own clock** starting at `anchor`, so one graphic can span several shots (hook: split 1.5–3.6 then full 3.6–4.66, same `anchor: 1.5`) and stay continuous. Scene timing constants (`FAIL_AT`, `BELIEVER_WIN`, …) are *local to the anchor* — change the anchor and you must retime them.
- `ShotView` = `<Sequence from={anchor} durationInFrames={b-anchor}>` + `Gate` that renders only from `a`. The A-roll is **not** inside any Sequence (a video in a Sequence restarts at 0 and drifts from the voice).
- `shotAt(sec)` must use frame rounding identical to the layers: `f = round(sec*30); F(a) <= f < F(b)`.

## A-roll pose

One `<OffthreadVideo>` full frame. Pose per frame:
- face shot → `scale(shot.scale)` (origin 50% 36%)
- split shot → `translateY(784px)` — this *is* the face band (1080×1920 source, band crop at 30% → rows 336…1136 land at y 1120 → shift 784)
- during the opening move → `translateY(784 × p)` while the panel goes `translateY(−(1−p) × 1120)`, `p` = ease-in-out cubic over 12 frames.

If the source isn't 1080×1920, recompute the band shift (or fall back to a separate band video and accept a hard cut).

## Supers

- Markup in cue text: `*x*` (legacy serif mark, now plain), `+x+` (legacy green, now plain white), `-x-` red (legacy — ask before using). Latin runs are split out and `unicodeBidi: isolate`d so RTL never reorders them.
- Size: `min(60, 760 / (plainLength × 0.53))`, Cairo 900, `WebkitTextStroke` ≈ 5% of size, shadow `0 4px 0 rgba(0,0,0,.55), 0 8px 26px rgba(0,0,0,.75)`.
- Hide on: title layout, `g === "cta"`, `g === "claude"` (product screen), ±0.05s around a cut (except across the opening move — the line rides it via `captionTransform`), and a <0.5s remnant of a line spoken over the previous title card.

## Stage kit

- `Room({ tint, tag, wall, light })` — 1080×1120: wall gradient + faint vertical panels, spotlight cone (`tint`), bulb glow, floor pool, vignette, `#N` tag at y 952 (pixel font, teal). Tint per character: green `#37E28F`, red `#FF4D4D`, gold `#F6C343`, blue-white `#8FA8FF`; neutral white for group shots; warm gold while "working", red on failure.
- `Actor({ costume, x, feet, px, hopAt, enterAt })` — a `PixelBot` standing on the floor, spring entrance, optional one-shot hop.
- Put scene headers at `top: 240` (clears Instagram's top bar); keep content above the `#N` tag and supers.
- Cards/judges row: widths and gaps must be centred on 540 (4×200 + 3×24 = 872 → x = 104, 328, 552, 776). Check centring in a still.

## Sound layer (V4)

- Cue helper `c(atFrame, file, dB, len?)`; `keep: true` exempts a cue from the global `REST_TRIM`.
- Groups: cuts (whoosh only onto a *new* graphic), hook (counter ticks inverted from the counter's easing, settle tick, stamp + mid pop + short glitch on the fail word), reveal (a pop per judge landing, strike swipe, impact on "ولا ساعة"), intro (tick per card arriving, pop per card lighting), typing keys, title pop + key per letter, believer (tick per bar, pop+short shimmer on the word), skeptic (pen swipe per mark + small impact), investor (clink per coin, bigger coin on "فلوس"), judge (pop per verdict landing, gavel with trimmed tail), CTA (key per letter + land pop).
- `len` trims a cue with a 4-frame fade; default sequence length 45 frames.
- Music: `<Audio src={MUSIC} volume={1} />` — his file, untouched.
- Kit: `public/sfx-council/*.wav` (whoosh, swipe, pop, pop-0…3, tick, tick-0…11, ui-tick, coin, shimmer, impact, stamp, gavel, glitch, sub-boom, riser…), `public/sfx/key.wav`. All normalised to ≈ −1 dBFS peak; `impact`/`stamp` are >90% energy below 150 Hz (weak on phones — pair with a mid pop).

## Gotchas that cost time

- Node 22 only; Node 26 hangs Remotion silently.
- Disk fills up (ENOSPC) — Remotion's `node_modules/.cache` and scratch renders; use a slim public dir; clean your own scratch files only.
- `tsc --noEmit` with noUnusedLocals: remove imports you stop using.
- zsh: `for x in "a b"` doesn't word-split; globs in `VAR=` assignments don't expand; a glob with no match is an error (`no matches found`) — use `rm -f` patterns carefully or `setopt nullglob`.
- ffmpeg here has **no drawtext** — label contact sheets by position, not burned-in timestamps.
