#!/usr/bin/env python3
"""
Measure what the SFX + music actually do in a render, by subtracting the untouched
voice (the A-roll's own audio) from the rendered mix.

Why: the file levels you set in code are not what the viewer hears — a whoosh at
"−16 dB" can sit 20 dB under speech and vanish, a stamp can land 5 dB over the
voice. And you can't listen. This gives per-moment numbers, and a before/after
when you change levels.

Usage:
  sfx_audit.py MIX.mp4 VOICE_SOURCE.mov --sections "1.6:3.3:counter,4.1:4.6:fail,33.6:34.1:gavel"
  sfx_audit.py MIX.mp4 VOICE.mov --sections "..." --before OLD_MIX.mp4

Reading it: "res" is music+SFX RMS in that span, "voice" the voice RMS. Around
−10…−16 dB under the voice = clearly audible texture; within ±3 dB = a hit;
over the voice = it will feel loud. A render's residual never reaches silence
(AAC error), so compare spans, don't read absolutes too literally.
"""
import argparse, os, subprocess, tempfile
import numpy as np
import scipy.io.wavfile as wavfile

R = 48000


def load(src, tmp, name):
    p = os.path.join(tmp, name + ".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", str(R), p], check=True)
    _, x = wavfile.read(p)
    return x.astype(float) / 32768


def residual(mix, voice):
    n = min(len(mix), len(voice))
    mix, voice = mix[:n], voice[:n]
    # align: AAC adds a priming delay (usually 1024–2048 samples)
    a0 = min(5 * R, max(0, n - 2 * R))
    best, bv = 0, -1e18
    for lag in range(-3000, 3001, 16):
        seg = mix[a0 + lag:a0 + lag + R]
        if len(seg) < R:
            continue
        c = float((seg * voice[a0:a0 + R]).sum())
        if c > bv:
            bv, best = c, lag
    for lag in range(best - 16, best + 17):
        c = float((mix[a0 + lag:a0 + lag + R] * voice[a0:a0 + R]).sum())
        if c > bv:
            bv, best = c, lag
    return np.roll(mix, -best) - voice, voice


def db(x):
    return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9) if len(x) else -120.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mix")
    ap.add_argument("voice")
    ap.add_argument("--sections", required=True, help='"t0:t1:label,..."')
    ap.add_argument("--before", help="an earlier render to compare against")
    a = ap.parse_args()
    secs = []
    for s in a.sections.split(","):
        t0, t1, *lab = s.split(":")
        secs.append((float(t0), float(t1), ":".join(lab) or f"{t0}-{t1}"))
    with tempfile.TemporaryDirectory() as tmp:
        voice = load(a.voice, tmp, "voice")
        res, v = residual(load(a.mix, tmp, "mix"), voice)
        old = residual(load(a.before, tmp, "old"), voice)[0] if a.before else None
        hdr = f"{'moment':16s} {'voice':>7s} {'res':>7s} {'res−voice':>10s}" + (f" {'before':>8s} {'change':>7s}" if old is not None else "")
        print(hdr)
        for t0, t1, lab in secs:
            i, j = int(t0 * R), int(t1 * R)
            line = f"{lab:16s} {db(v[i:j]):7.1f} {db(res[i:j]):7.1f} {db(res[i:j]) - db(v[i:j]):+10.1f}"
            if old is not None:
                line += f" {db(old[i:j]):8.1f} {db(res[i:j]) - db(old[i:j]):+7.1f}"
            print(line)


if __name__ == "__main__":
    main()
