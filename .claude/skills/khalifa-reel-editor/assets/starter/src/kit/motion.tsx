import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";

/**
 * Motion system for the Claude Council edit.
 *
 * One vocabulary, used everywhere, so the piece moves like one designer made
 * it rather than each element improvising its own entrance:
 *
 *   SNAP   UI furniture arriving — quick, a hair of overshoot
 *   SLAM   an impact — comes in oversized and hits its mark hard
 *   SOFT   secondary / supporting motion
 *
 * Plus the pieces that make a hit feel like a hit: masked text reveals,
 * rolling counters, a one-pass light sheen, camera shake, shockwave rings,
 * sparks, comets travelling along a path, and whip transitions with blur.
 *
 * Nothing here loops or drifts. Every move is one-shot and motivated.
 */

export const SNAP = { damping: 15, stiffness: 320, mass: 0.45 };
export const SLAM = { damping: 11, stiffness: 380, mass: 0.6 };
export const SOFT = { damping: 20, stiffness: 180, mass: 0.6 };

export const useSpring = (at: number, cfg = SNAP, dur = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: cfg, durationInFrames: dur });
};

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** Text rising out from behind a mask line — the headline reveal. */
export const MaskUp: React.FC<{ at: number; children: React.ReactNode; dist?: number; style?: React.CSSProperties }> = ({
  at,
  children,
  dist = 1.05,
  style,
}) => {
  const p = useSpring(at, SNAP, 13);
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.08em", ...style }}>
      <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * dist * 100}%)` }}>{children}</span>
    </span>
  );
};

/** Word-by-word masked reveal, in reading order (RTL for Arabic). */
export const MaskWords: React.FC<{ at: number; text: string; step?: number; style?: React.CSSProperties; rtl?: boolean }> = ({
  at,
  text,
  step = 3,
  style,
  rtl = true,
}) => (
  <span style={{ display: "inline-flex", flexWrap: "nowrap", gap: "0.26em", direction: rtl ? "rtl" : "ltr", ...style }}>
    {text.split(" ").map((w, i) => (
      <MaskUp key={i} at={at + i * step}>
        {w}
      </MaskUp>
    ))}
  </span>
);

/**
 * Rolling counter. Each digit is a column that scrolls to its target, the
 * lower-order digits spinning further — an odometer, not a text swap.
 */
export const Odometer: React.FC<{
  value: number;
  at: number;
  dur?: number;
  format?: (n: number) => string;
  style?: React.CSSProperties;
}> = ({ value, at, dur = 22, format = (n) => String(n), style }) => {
  const frame = useCurrentFrame();
  const target = format(value);
  const t = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const chars = target.split("");
  const digitsTotal = chars.filter((c) => /\d/.test(c)).length;
  let di = 0;

  return (
    <span style={{ display: "inline-flex", direction: "ltr", ...style }}>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i}>{c}</span>;
        const d = Number(c);
        const order = digitsTotal - 1 - di++;           // 0 = units
        const spins = order === 0 ? 2 : order === 1 ? 1 : 0;
        const pos = t * (d + spins * 10);                // fractional position in the strip
        const shown = pos % 10;
        return (
          <span key={i} style={{ display: "inline-block", height: "1em", lineHeight: 1, overflow: "hidden", position: "relative", width: "0.62em", textAlign: "center" }}>
            <span style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${-shown}em)` }}>
              {Array.from({ length: 11 }).map((_, n) => (
                <span key={n} style={{ display: "block", height: "1em", lineHeight: 1 }}>{n % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

/** A single diagonal light pass across a glass surface on arrival. */
export const Sheen: React.FC<{ at: number; dur?: number; radius?: number }> = ({ at, dur = 16, radius = 24 }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + dur) return null;
  const x = interpolate(frame, [at, at + dur], [-60, 160], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: radius, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: "-50%",
          bottom: "-50%",
          left: `${x}%`,
          width: "22%",
          transform: "rotate(18deg)",
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%)",
        }}
      />
    </div>
  );
};

/** Decaying camera shake — a hit, not a drift. Returns a CSS transform. */
export const useShake = (hits: { at: number; amp: number; dur?: number }[]) => {
  const frame = useCurrentFrame();
  let x = 0, y = 0, r = 0;
  for (const h of hits) {
    const d = h.dur ?? 10;
    const l = frame - h.at;
    if (l < 0 || l > d) continue;
    const decay = Math.pow(1 - l / d, 2);
    x += Math.sin(l * 2.9) * h.amp * decay;
    y += Math.cos(l * 3.7) * h.amp * 0.7 * decay;
    r += Math.sin(l * 2.3) * h.amp * 0.05 * decay;
  }
  return `translate(${x}px, ${y}px) rotate(${r}deg)`;
};

/** An expanding ring from a point — the visible shape of an impact. */
export const Shockwave: React.FC<{ at: number; x: number; y: number; color: string; size?: number; dur?: number; width?: number }> = ({
  at,
  x,
  y,
  color,
  size = 260,
  dur = 16,
  width = 5,
}) => {
  const frame = useCurrentFrame();
  const l = frame - at;
  if (l < 0 || l > dur) return null;
  const t = interpolate(l, [0, dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const r = size * (0.2 + 0.8 * t);
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: `${width * (1 - t) + 1}px solid ${color}`,
        opacity: 1 - t,
        pointerEvents: "none",
      }}
    />
  );
};

/** A short burst of sparks from a point. Deterministic, so every render matches. */
export const Sparks: React.FC<{ at: number; x: number; y: number; color: string; n?: number; dist?: number; dur?: number }> = ({
  at,
  x,
  y,
  color,
  n = 10,
  dist = 150,
  dur = 18,
}) => {
  const frame = useCurrentFrame();
  const l = frame - at;
  if (l < 0 || l > dur) return null;
  const t = interpolate(l, [0, dur], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 3) * 0.37;
        const d = dist * (0.55 + ((i * 37) % 10) / 22) * t;
        const len = 18 * (1 - t) + 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * d - len / 2,
              top: y + Math.sin(a) * d - 2,
              width: len,
              height: 4,
              borderRadius: 2,
              background: color,
              opacity: 1 - t,
              transform: `rotate(${a}rad)`,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};

/** A glowing dot travelling from A to B with a tail. */
export const Comet: React.FC<{ at: number; dur: number; from: [number, number]; to: [number, number]; color: string }> = ({
  at,
  dur,
  from,
  to,
  color,
}) => {
  const frame = useCurrentFrame();
  const l = frame - at;
  if (l < 0 || l > dur + 4) return null;
  const pos = (k: number) => {
    const t = interpolate(l - k, [0, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
  };
  return (
    <>
      {[0, 1, 2, 3, 4].map((k) => {
        const [px, py] = pos(k * 1.2);
        const s = 18 - k * 3;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: px - s / 2,
              top: py - s / 2,
              width: s,
              height: s,
              borderRadius: "50%",
              background: color,
              opacity: (1 - k * 0.2) * (l > dur ? 1 - (l - dur) / 4 : 1),
              boxShadow: k === 0 ? `0 0 22px ${color}, 0 0 40px ${color}` : "none",
            }}
          />
        );
      })}
    </>
  );
};

/**
 * Whip transition for a block: in from `inFrom` at `at`, out to `outTo` from
 * `outAt`. Blur and a horizontal stretch while it's moving fast stand in for
 * motion blur. Direction is in px; RTL edits move content leftward.
 */
export const useWhip = (at: number, outAt: number | null, inFrom = 140, outTo = -160) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pin = spring({ frame: frame - at, fps, config: SNAP, durationInFrames: 11 });
  const pout = outAt == null ? 0 : interpolate(frame, [outAt, outAt + 7], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const x = (1 - pin) * inFrom + pout * outTo;
  const speed = Math.abs((1 - pin) * inFrom) / Math.abs(inFrom) + pout;
  const blur = Math.min(10, speed * 12);
  return {
    opacity: pin * (1 - pout),
    transform: `translateX(${x}px) scaleX(${1 + Math.min(0.12, speed * 0.14)})`,
    filter: blur > 0.3 ? `blur(${blur}px)` : "none",
  } as React.CSSProperties;
};

/** Interpolate between two hex colours — for borders that change owner. */
export const mixColor = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.max(0, Math.min(1, t))));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
