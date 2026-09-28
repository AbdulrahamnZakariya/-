#!/usr/bin/env python3
"""
Measure how close on-screen text gets to the edges of a full-resolution still.

Why: Instagram's like/comment/share column covers the right ~130px between
y≈980–1500. Long supers and the CTA word sit exactly in that band, and "looks
fine in the preview" is not proof. Render a still (npx remotion still … --frame=N)
and measure.

Usage:
  caption_margins.py STILL.png Y0 Y1 [--kind white|red|green|any]
  e.g. caption_margins.py f1068.png 1085 1160        # the seam super in a split shot
       caption_margins.py f1160.png 1225 1345 --kind green   # a coloured CTA word

Keep text inside x ≈ 150…930 on a 1080-wide frame (≥150px each side).
Crops at x<1000 so bright set lights on the right edge of the footage don't count.
"""
import argparse
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("png")
ap.add_argument("y0", type=int)
ap.add_argument("y1", type=int)
ap.add_argument("--kind", default="any", choices=["white", "red", "green", "any"])
a = ap.parse_args()

im = np.asarray(Image.open(a.png).convert("RGB")).astype(int)
W = im.shape[1]
band = im[a.y0:a.y1, : min(W, 1000)]
white = band.min(axis=2) > 235
red = (band[:, :, 0] > 220) & (band[:, :, 1] < 90)
green = (band[:, :, 1] > 190) & (band[:, :, 0] < 120) & (band[:, :, 2] > 100)
mask = {"white": white, "red": red, "green": green, "any": white | red | green}[a.kind]
cols = np.where(mask.sum(axis=0) > 3)[0]
if not len(cols):
    print("no text found in that band — check Y0/Y1 or --kind")
else:
    l, r = int(cols.min()), int(cols.max())
    ok = l >= 150 and W - r >= 150
    print(f"text x {l}–{r}  |  left margin {l}px, right margin {W - r}px  →  {'OK' if ok else 'TOO CLOSE (want ≥150px)'}")
