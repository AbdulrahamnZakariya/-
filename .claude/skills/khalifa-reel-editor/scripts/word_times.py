#!/usr/bin/env python3
"""
Word-level timings for an Arabic voice-over, plus an energy envelope to confirm onsets.

Why this exists: caption LINE starts are not WORD times. Big hits (stamp, gavel,
confetti, "0 hours") must land on the word they punctuate, and on the council
reel they were 0.5–1.2s early because they were timed to line starts.

Whisper's whole-file word times drift (up to ~1s mid-file, with garbled words),
so this transcribes short overlapping windows instead. Whisper still tends to
run ~0.1–0.2s late: confirm any word you hang a big hit on with --envelope and
put the hit on the energy rise right after a dip.

Usage:
  word_times.py VIDEO_OR_AUDIO                      # every word with its start time
  word_times.py VIDEO --find فاشلة,ساعة,فلوس         # only words containing these
  word_times.py VIDEO --envelope 3.5:4.8,33.4:34.3  # 40ms RMS dB, to read onsets
  options: --model PATH  --window 5  --hop 4  --lang ar
"""
import argparse, glob, json, os, subprocess, sys, tempfile
import numpy as np
import scipy.io.wavfile as wavfile

MODEL_GLOBS = [
    os.environ.get("WHISPER_MODEL", ""),
    os.path.expanduser("~/whisper-models/ggml-medium.bin"),
    os.path.expanduser("~/Documents/macbook pro m4 VIPP/viral-6x5-edit/whisper.cpp/ggml-medium.bin"),
    os.path.expanduser("~/Documents/**/ggml-medium.bin"),
    "/tmp/ggml-medium.bin",
]


def find_model(explicit):
    if explicit:
        return explicit
    for g in MODEL_GLOBS:
        if not g:
            continue
        hits = glob.glob(g, recursive=True)
        if hits:
            return hits[0]
    sys.exit("No ggml-medium.bin found (the multilingual one, NOT medium.en). Pass --model PATH.")


def to_wav16k(src, dst):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "16000", dst], check=True)


def words_in_window(wav, t0, dur, model, lang, tmp):
    seg = os.path.join(tmp, "seg.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t0), "-t", str(dur), "-i", wav, seg], check=True)
    prefix = os.path.join(tmp, "seg")
    subprocess.run(["whisper-cli", "-m", model, "-l", lang, "-ml", "1", "-sow", "-f", seg, "-oj", "-of", prefix],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    d = json.load(open(prefix + ".json"))
    return [(s["offsets"]["from"] / 1000 + t0, s["text"].strip()) for s in d["transcription"] if s["text"].strip()]


def envelope(wav, spans, step=0.04):
    r, x = wavfile.read(wav)
    x = x.astype(float) / 32768
    for a, b in spans:
        cells = []
        for t in np.arange(a, b, step):
            s = x[int(t * r):int((t + step) * r)]
            cells.append(f"{t:.2f}:{20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9):.0f}")
        print(f"[{a}-{b}] " + " ".join(cells))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--model")
    ap.add_argument("--lang", default="ar")
    ap.add_argument("--window", type=float, default=5.0)
    ap.add_argument("--hop", type=float, default=4.0)
    ap.add_argument("--find", help="comma-separated substrings to keep")
    ap.add_argument("--envelope", help="comma-separated t0:t1 spans; prints RMS dB every 40ms and exits")
    a = ap.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "voice16.wav")
        to_wav16k(a.src, wav)
        if a.envelope:
            envelope(wav, [tuple(map(float, s.split(":"))) for s in a.envelope.split(",")])
            return
        model = find_model(a.model)
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav],
                                   capture_output=True, text=True).stdout.strip())
        out, t = [], 0.0
        while t < dur:
            ws = words_in_window(wav, t, a.window, model, a.lang, tmp)
            last = t + a.window >= dur
            # keep a word from this window only if it starts inside the hop (the overlap belongs to the next window)
            out += [(s, w) for s, w in ws if s < t + a.hop or last]
            t += a.hop
        keep = [k for k in (a.find.split(",") if a.find else []) if k]
        for s, w in out:
            if not keep or any(k in w for k in keep):
                print(f"{s:6.2f}  {w}")


if __name__ == "__main__":
    main()
