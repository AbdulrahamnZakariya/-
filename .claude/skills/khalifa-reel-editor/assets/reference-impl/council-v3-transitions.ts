import { Easing } from "remotion";
import { F30 } from "./captions-council-v3";
import { SEAM_Y } from "./scenes-maps/shared";

/**
 * Council V3 transitions, matched to the reference: every layout change is a
 * HARD CUT — the motion lives inside the graphics, never between shots. (A
 * dissolve read as "ghost"; slides on every cut were "too many transitions".)
 *
 * The one exception, by request: the video opens on the A-roll full screen,
 * and at 1.5s the hook panel drops in from the top and pushes the face down
 * into the band — one continuous move of the same video, no second copy.
 */
export const FULL_TOP = 290;              // where a full-screen room sits (1120 tall)
export const BAND_Y = 784;                // the A-roll moved down into the split band (1080×1920 source, cover, 30%)
export const OPEN_AT = F30(1.5);
export const OPEN_XF = 12;                // 0.4s

/** 0 → 1 across the opening move; null outside it. */
export const openP = (frame: number) =>
  frame >= OPEN_AT && frame < OPEN_AT + OPEN_XF ? Easing.inOut(Easing.cubic)((frame - OPEN_AT) / OPEN_XF) : null;

/** The panel drops from above the frame to its place. */
export const openPanelTransform = (frame: number) => {
  const p = openP(frame);
  return p == null ? "none" : `translateY(${-(1 - p) * SEAM_Y}px)`;
};

/** The face is pushed down with it, into the band. */
export const openFaceY = (frame: number) => {
  const p = openP(frame);
  return p == null ? null : BAND_Y * p;
};

/** The line on screen rides from the full-frame super height (1300) up to the seam (1120). */
export const captionTransform = (frame: number) => {
  const p = openP(frame);
  return p == null ? "none" : `translateY(${180 * (1 - p)}px)`;
};
