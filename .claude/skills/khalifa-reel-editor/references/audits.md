# Audits

Two audits Ahmed asks for by role: "act as a senior video editor and audit the whole video" and "act as a senior sound/VFX designer with 10 years' experience and audit the sound". In both: **measure, then report; change nothing until he picks.** Number every finding so he can reply with numbers.

## Senior video-editor audit

1. **Sheets.** `scripts/contact_sheet.sh <render> <dir> 2 10` — a frame every 0.5s with Reels UI zones tinted. Read every sheet.
2. **End/black frames.** `ffprobe -count_frames …` for frame count; `ffmpeg -vf blackdetect=d=0.05:pix_th=0.1`; voice energy over the last 4s (does the video hang on silence?). An empty last tile in a sheet is padding, not a black frame — confirm before reporting.
3. **What he says vs what's on screen.** Re-run `scripts/word_times.py` per section (or whisper in 3–6s windows) and diff against the cues: wrong words, dropped asks (e.g. a spoken "follow me" with no on-screen follow), repeated lines after title cards.
4. **Readability windows.** Anything typed/animated must finish ≥0.5s before its cut (a prompt that completes 3 frames before the cut is unreadable).
5. **Margins.** Render full-res stills of the widest super and the CTA (`npx remotion still … --frame=N`) and run `scripts/caption_margins.py`. Want ≥150px each side in the y 980–1500 band.
6. **First frame** (autoplay + thumbnail): is it strong, or an empty room mid-animation?
7. **Continuity:** characters keep costumes and scale between scenes; nothing collides (seal/tag/super stacks, shockwaves over text); headers clear the top zone.

**Report format**

```
## Video audit — <name> (<duration>)
Overall: one or two sentences.
### Must fix
1. **<what> (<timecode>).** Evidence. Suggested fix.
### Should fix
### Nitpicks
### Checked and fine
- short bullets
Tell me which numbers to fix.
```

## Senior sound audit

Measure — you can't listen.

1. **Per-cue model:** for every cue, file peak/RMS × gain vs the voice RMS in ±150ms at that moment; flag *on speech* vs *in a gap*. Hits in natural pauses read clean; hits on words mask them.
2. **Word sync:** find the onset of each word a big hit punctuates (`word_times.py --envelope`). Report hits that land on the wrong word (e.g. a stamp 0.5s early on "إنها" instead of "فاشلة").
3. **Spectrum:** share of energy <150 Hz (vanishes on phone speakers), centroid ~5–6 kHz (fights Arabic sibilants س/ش), tail length over following speech.
4. **Music bed:** measure the file (`volumedetect`) and its level under the voice — but remember he levels music himself; report, don't "fix".
5. **Render check:** `scripts/sfx_audit.py <render> <A-roll> --sections …` (with `--before` for A/B). Loudness `ebur128` integrated and peak (`astats`) — never clip; don't normalise his voice.

Report as numbered problems (most important first), "what's right", then "want me to apply 1–N?".
