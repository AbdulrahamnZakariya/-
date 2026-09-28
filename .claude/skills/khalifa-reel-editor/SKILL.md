---
name: khalifa-reel-editor
description: Ahmed Khalifa's house style for editing his Arabic talking-head reels in Remotion (the my-video project) — split-screen stage graphics over his A-roll, one-line Cairo supers, pixel-character title cards, hard cuts, tiered sound design synced to every on-screen action, Instagram safe zones, and a preview → audit → final render loop. Use this whenever Ahmed hands over a CapCut cut, a .mov/.mp4 of himself talking, or asks to edit/cut/caption/add graphics/add sound effects/make a reel/make it like the reference/"اعمل مونتاج"/render — even if he doesn't say "Remotion" or "skill". Also use it when he asks for an editing or sound audit of one of his videos, or to change supers, transitions, SFX levels, safe zones or the CTA on an existing reel.
---

# Khalifa reel editor

This is the editing style built on the **Claude Council** reel (Sep 2026) through many rounds of Ahmed's feedback. It is a *style*, not a template: each new video gets its own graphics for its own script, but the grammar, the rules, the sound tiers and the review loop stay the same.

The finished reference is `my-video/out/council-v3-final.mp4`, composition `CouncilVideoV3`. A snapshot of its source is in `assets/reference-impl/` — read `references/reference-implementation.md` before writing code; copy and adapt from it rather than starting blank.

## Who you're working with

Ahmed makes Egyptian-Arabic reels about AI tools (mostly Claude) for Instagram. He is direct and fast, gives feedback in short messages, and judges by watching. Things that matter to him, learned the hard way:

- **He cuts the takes himself in CapCut.** If you get raw multi-take footage, don't assemble it — say it's a take session and ask for his cut. Start from his cut.
- **Never alter his recorded voice** — no loudnorm, no gain, no processing. If the mix measures quiet for Instagram (~−21 LUFS vs ~−14), mention it in one line; don't act.
- **He supplies and levels the music himself** (e.g. a CapCut export "already at −35"). Play it at volume 1, full length, no ducking, no fades — even if it measures nearly silent.
- **Never fabricate footage or screenshots.** If a capture is missing, list exactly what's needed; if it's truly impossible, build an obvious brand graphic, not a fake UI capture.
- **When he asks for an audit, report first and change nothing** until he picks what to fix. Number the findings so he can answer "do 5, 6, 7".
- He works in a reference-driven way: when he sends a reference video, *study it frame by frame* (see "Studying a reference") before changing anything.

## Starting from zero

Many people using this skill have a bare Mac. Check before anything else: is there a Remotion project (a `package.json` listing `remotion`) and do `node`, `ffmpeg`, `whisper-cli` exist? If not, set up in this order — explain each step in plain words, because the person may never have used Terminal.

1. **Things only the person can do** (they need their Mac password, which you can't type): ask them to open the Terminal app (⌘+Space → "Terminal") and paste, one at a time —
   `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` (then run the two `echo … >> ~/.zprofile` / `eval` lines Homebrew prints at the end), then
   `brew install node@22 ffmpeg whisper-cpp`.
2. **You can do the rest:**
   - Python packages for the audit scripts: `python3 -m pip install --user numpy scipy pillow`. If pip refuses with "externally-managed-environment", make a venv (`python3 -m venv ~/.reels-venv && ~/.reels-venv/bin/pip install numpy scipy pillow`) and run the scripts with `~/.reels-venv/bin/python`.
   - Whisper model (≈1.5 GB, multilingual — not `medium.en`): `curl -L -o ~/whisper-models/ggml-medium.bin --create-dirs https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin`, then pass `--model` to `word_times.py` or `export WHISPER_MODEL=…`.
   - The project: `scripts/new_project.sh <folder>` — copies `assets/starter/` (style kit in `src/kit/`, sound-effect kit in `public/`, a `StyleCheck` composition), installs Remotion under Node 22, typechecks and renders `out/style-check.mp4`. Show them that file: title card, four glowing cards, clicks. If it plays, setup is done.
3. **Preview while editing:** `npm run studio` (Remotion Studio at http://localhost:3000) or low-res renders.

In a starter project the kit lives in `src/kit/` (`shared`, `motion`, `Pixel`, `TitleCard`, `Stages`, `Opening`, `Screens`); in Ahmed's `my-video` the same files are under `src/scenes-council/` and `src/scenes-maps/`. The reference implementation's imports use the `my-video` paths — remap them when copying into a starter project.

The sound-effect kit (`public/sfx-council/*.wav`, `public/sfx/key.wav`) was synthesized for this style (ffmpeg tone generators), so it's free to ship with every project.

## The pipeline

1. **Intake.** Copy his cut into `my-video/public/` with a clean name (macOS screen-recording names contain U+202F before AM/PM — glob, never retype). Note duration, fps, resolution (`ffprobe`). Everything assumes 1080×1920 @ 30fps.
2. **Transcript + word times.** Run `scripts/word_times.py <video>` (short overlapping whisper windows — whole-file whisper drifts ~1s). Confirm any word you'll hang a big hit on with `--envelope t0:t1`: the real onset is the energy rise after a dip; whisper is usually 0.1–0.2s late.
3. **Script → captions.** Write `cues` (one line each, the words he actually says, lightly condensed). Product names stay Latin (`Claude`, `Shark Tank`, `GitHub`) — never transliterated.
4. **Edit decision list (EDL).** Cut on the sentence. Rotate layouts so no frame holds more than ~3.4s: `split` (stage graphic on top, face band below), `face` (full-frame A-roll, scale 1 or a 1.22 punch-in), `full` (a graphic takes the frame), `title` (white character card). The first ~1.5s is the A-roll full screen, then the split panel drops in.
5. **Graphics per beat** — see "Graphic grammar". Time every visual beat to a *word*, not a line start.
6. **Captions** — see "Supers".
7. **Sound** — see "Sound design".
8. **Low-res preview** → watch it yourself via frames → send it. `npx remotion render src/index.ts <Comp> <scratch>/preview.mp4 --scale=0.4 --crf=24`.
9. **Audit** (`references/audits.md`) → fix → preview again.
10. **Final render** at full res into `out/<name>-final.mp4` — never overwrite an existing file in `out/`; pick a new name. Spot-check frames, then open it in Finder (`mcp__ccd_host__reveal_path`) — he will ask where it is otherwise.

Always run Remotion under Node 22: `export PATH="/opt/homebrew/opt/node@22/bin:$PATH"` (Node 26 hangs silently). If the disk is tight, render with a slim hard-linked public dir: `scripts/slim_public.sh public <scratch>/pub <assets…>` then `--public-dir=<scratch>/pub`.

## Layout rules

- **Split:** stage panel `0…1120`, face band `1120…1920`. The seam is **square** — no rounded corners, no border, no shadow around the face, edge to edge. In the reference impl the band is the *same* A-roll moved down 784px (1080×1920 source, cover, 30%) — one video, never two copies.
- **Face shots:** static crops. A punch-in is a hard cut to scale 1.22 — never a slow creep/Ken Burns.
- **Full graphics** sit on a dark field; a 1120-tall room is placed at `top: 290`.
- **Title cards** are white, full frame, no supers (the name is the text).
- **Safe zones (Instagram Reels, 1080×1920):** top ~220px, bottom ~420px (y > 1500), right ~130px between y≈980–1500. Headers start at y≥240. Supers and the CTA word keep ≥150px from each side. Check every render with `scripts/contact_sheet.sh` and `scripts/caption_margins.py`.

## Transitions

**Hard cuts.** His reference cuts hard between every layout; all the motion lives *inside* the graphics (things drop in, bars grow, names type). Dissolves read as "ghost transitions"; a slide on every cut was "too many transitions". The one exception is the opening: A-roll full screen, then at ~1.5s the stage panel drops in from the top and pushes the face down into the band in one 0.4s ease-in-out move (`council-v3-transitions.ts`). Add other moving transitions only when he asks for one.

## Supers

- **One line, always** — enforced in code: `whiteSpace: nowrap` + a font size fitted to a **760px** max line width (`min(60, 760 / (chars × 0.53))`).
- **Cairo 900, white**, hard black outline + deep shadow, no box. No serif accent font. **No green** anywhere in supers. Red keyword colouring (`-word-`) is legacy — his stated rule is all-white; ask before using red.
- "Claude" takes `#F4F3EE`.
- Position follows the layout: on the seam (y 1120) in split shots, at the chest (y 1300) in full-frame shots.
- **Hidden** on title cards, on the full-screen product/prompt screen (they "distract" from the typing), and during the CTA.
- Don't let a line spoken over a title card flash back for <0.5s after the card.
- Shot lookups must use the **same frame rounding** as the layers (`round(sec×30)` vs `F(a)`), or a super leaks one frame onto a title card.
- Pop in on a short stiff spring (7 frames).

## Graphic grammar

The council look: a dark **spotlit room** (`Room`: wall gradient, spotlight cone tinted per beat, floor pool, vignette, `#N` tag in the pixel font on the seam) with an **original pixel creature in Claude orange** (`PixelBot`, costumes per character) acting out the line. Pixel numerals (Press Start 2P) in teal `#1FCFAE`; labels in Cairo; Latin headers in Poppins 800 with tight tracking.

- **Visualize the line, don't caption it.** "A year on one idea → it fails" = the creature at a laptop under a bulb, a day counter racing to 365, then the light goes red and the bulb cracks on "فاشلة". "Four judges" = four cards that light up one by one.
- **Build processes literally** — typing into a Claude prompt box, verdict cards landing on a bench, coins stacking — not abstract bars standing in for them.
- **Real data only.** Never invent contact details for real businesses; mask what you don't have.
- **One idea at a time** — stagger elements in time, never stack several blocks at once.
- **Motion:** stiff short springs (`SNAP`, `SLAM` in `motion.tsx`), shockwaves/sparks on hits, a one-shot shake on the biggest beat. Nothing drifts.
- **Keep characters consistent** across scenes (same costumes in every appearance) and at similar scale.
- **CTA** is a visual in the last seconds over the A-roll, compact, inside safe zones. If he asks for a follow in the VO, the CTA should show it too.

## Sound design

His verdicts define this: ~130 loud stacked cues = "too high and too much"; 19 cues = "horrible — the counter has no sound, the judges have no click". The answer is **sync, not count**: every action you can *see* gets a sound, locked to its frame, but quiet and tiered:

| tier | what | level (file peak ≈ −1 dBFS) |
|---|---|---|
| UI texture | counter ticks, key clicks, card-arrive ticks, coin clinks | −20…−27 dB |
| actions | judge/card lands, title pop, pen strokes, verdict slaps | −12…−16 dB |
| one hit per beat | stamp, "0 hours" impact, gavel | −10…−12 dB, **on the word** |
| cut whoosh | only when the cut lands on a new graphic | ≈ −26 dB |

Then apply his final trims: after hearing it he wanted the **counter ~5 dB up** and **everything else −10 dB** (`REST_TRIM` in the V4 layer) — start new videos near those final levels.

- A counter ticks along its own easing curve (invert the curve; tick every N units; ~15 ticks per 1.8s count).
- Never stack more than a hit + one mid-range body layer (sub-heavy hits vanish on phone speakers — add a mid "pop" for body).
- Trim long tails (shimmer, gavel) with a 4-frame fade so they don't sit on the next words.
- Verify with `scripts/sfx_audit.py` (subtracts the voice from the render) — you can't listen, so measure.

## Studying a reference

When he sends a reference, find its shot changes (`ffmpeg -vf "select='gt(scene,0.18)',showinfo"`), then look at frames at −0.1s, 0, +0.07, +0.13, +0.2, +0.3s around each change, and sample face shots over a second to tell a zoom from the speaker moving. Report what the reference *actually* does (e.g. "hard cuts everywhere; motion lives inside the graphics; face shots are static punch-ins") before touching the edit.

## References

- `references/reference-implementation.md` — the council V3 architecture: file map, EDL/anchor/Gate model, A-roll pose math, caption markup, stage kit, sound layer layout, gotchas. Read before coding.
- `references/audits.md` — the senior video-editor audit and the senior sound audit: procedure, commands, report format.
- `assets/reference-impl/` — snapshot of the working source (imports are relative to `my-video/src/`).
- `assets/starter/` — a complete, minimal Remotion project for this style (kit + SFX + StyleCheck); `scripts/new_project.sh` installs it.
- `scripts/` — `new_project.sh`, `word_times.py`, `contact_sheet.sh`, `sfx_audit.py`, `caption_margins.py`, `slim_public.sh` (each has usage in its header).
