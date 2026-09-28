import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { loadFont as loadPixel } from "@remotion/google-fonts/PressStart2P";
import { cairo, poppins } from "../../scenes-maps/shared";
import { PixelBot } from "./Pixel";
import { Room, Actor } from "./Stages";
import { TEAL } from "./TitleCard";
import { SNAP, SLAM, Shockwave, Sparks, useShake, MaskUp } from "../motion";

/**
 * Scene 1 V3 + Scene 2 V3 — the opening, rebuilt in the look of the rest of
 * V3 (the user: first 9 seconds didn't match; everything after did). Same
 * spotlit room, same pixel creature, same pixel-font numerals.
 */

const pixelFont = loadPixel("normal", { weights: ["400"] }).fontFamily;
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const RED = "#FF4D4D";

/* ── pixel idea bulb ─────────────────────────────────────────── */

type Cell = [number, number, number, number, string];
const Bulb: React.FC<{ lit: boolean; cracked: boolean; px?: number }> = ({ lit, cracked, px = 12 }) => {
  const Y = lit ? "#FFD84A" : "#3A3D44";
  const HL = lit ? "#FFF8D6" : "#4A4E57";
  const cells: Cell[] = [
    [2, 0, 4, 1, Y], [1, 1, 6, 1, Y], [0, 2, 8, 3, Y], [1, 5, 6, 1, Y], [2, 6, 4, 1, Y],
    [2, 2, 1, 2, HL],
    [2, 7, 4, 1, "#9AA0A6"], [3, 8, 2, 1, "#6B7075"],
    ...(cracked ? ([[4, 1, 1, 1, "#111"], [3, 2, 1, 1, "#111"], [4, 3, 1, 1, "#111"], [5, 4, 1, 1, "#111"]] as Cell[]) : []),
  ];
  return (
    <svg width={8 * px} height={9 * px} viewBox="0 0 8 9" shapeRendering="crispEdges" style={{ display: "block", overflow: "visible" }}>
      {cells.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}
    </svg>
  );
};

/** The judges' desk — same wood as the #4 bench. */
const Desk: React.FC<{ left: number; top: number; width: number; height?: number }> = ({ left, top, width, height = 170 }) => (
  <div style={{ position: "absolute", left, top, width, height, borderRadius: 16, background: "linear-gradient(180deg, #6B4420, #3E2612)", boxShadow: "0 -6px 0 #8B5A2B inset, 0 30px 60px rgba(0,0,0,0.6)" }} />
);

/* ── Scene 1 V3: a year on one idea — then it fails ─────────── */

export const FAIL_AT = 80;    // on the word "فاشلة" — 4.17s (measured from the waveform); the hook's clock starts at 1.5s
export const DAYS_START = -10;   // already counting when the panel drops in at 1.5s
export const DAYS_END = 55;      // 365 at 3.33s, before "وفي الآخر تكتشف"

export const HookStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const failed = frame >= FAIL_AT;
  const days = Math.round(interpolate(frame, [DAYS_START, DAYS_END], [1, 365], { ...clamp, easing: Easing.inOut(Easing.cubic) }));
  const head = spring({ frame: frame + 12, fps, config: SNAP, durationInFrames: 12 });   // already in on frame 0
  const bulbIn = spring({ frame: frame + 12, fps, config: SLAM, durationInFrames: 10 });   // lit on frame 0 — the first frame is the thumbnail
  const slump = spring({ frame: frame - FAIL_AT, fps, config: SLAM, durationInFrames: 10 });
  const shake = useShake([{ at: FAIL_AT + 1, amp: 12, dur: 10 }]);
  const type = failed ? 0 : Math.abs(Math.sin(frame * 0.9)) * 5;

  return (
    <Room tint={failed ? RED : "#F6C343"} wall={failed ? "#1A0F12" : "#12151B"}>
      <div style={{ position: "absolute", inset: 0, transform: shake }}>
        {/* the day counter */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 240, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 26, direction: "rtl", opacity: head, transform: `translateY(${(1 - head) * 30}px)` }}>
          <span style={{ fontFamily: pixelFont, fontSize: 110, color: failed ? RED : TEAL, textShadow: "0 6px 0 rgba(0,0,0,0.6)", direction: "ltr" }}>{days}</span>
          <span style={{ fontFamily: cairo, fontWeight: 900, fontSize: 72, color: "#F4F3EE" }}>يوم</span>
        </div>

        {/* the idea, above his head */}
        <div style={{ position: "absolute", left: 540 - 64, top: 382, opacity: bulbIn, transform: `scale(${interpolate(bulbIn, [0, 1], [0.4, 1])}) translateY(${failed ? slump * 16 : Math.sin(frame * 0.12) * 5}px)` }}>
          {!failed ? <div style={{ position: "absolute", left: -90, top: -84, width: 308, height: 308, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,216,74,0.45), transparent)" }} /> : null}
          <Bulb lit={!failed} cracked={failed} px={16} />
        </div>

        {/* the creature at work — slumps on the fail */}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${slump * 26 - type}px)` }}>
          <Actor costume="none" x={540} feet={766} px={22} />
        </div>

        {/* screen glow on his face, then the laptop back */}
        <div style={{ position: "absolute", left: 340, top: 566, width: 400, height: 220, borderRadius: "50%", background: `radial-gradient(closest-side, ${failed ? "rgba(255,77,77,0.35)" : "rgba(31,207,174,0.35)"}, transparent)` }} />
        <div style={{ position: "absolute", left: 400, top: 678, width: 280, height: 80, borderRadius: "12px 12px 0 0", background: "linear-gradient(180deg, #3B3F47, #262930)", border: "2px solid #50555E", borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#D97757", opacity: 0.9 }} />
        </div>
        <Desk left={160} top={756} width={760} height={200} />
      </div>

      <Shockwave at={FAIL_AT + 1} x={540} y={456} color={RED} size={300} dur={14} width={6} />
      <Sparks at={FAIL_AT} x={540} y={446} color="#FFD84A" n={12} dist={150} dur={14} />
    </Room>
  );
};

/* ── Scene 2 V3: the council, in zero hours ─────────────────── */

export const SEAT_AT = (i: number) => 46 + i * 6;   // "لجنة Shark Tank" — 6.0s–7.7s
export const ZERO_AT = 128;                         // on "ولا ساعة" — 8.93s

export const RevealStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strike = interpolate(frame, [ZERO_AT - 6, ZERO_AT], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const chipIn = spring({ frame: frame - 100, fps, config: SNAP, durationInFrames: 12 });
  const zero = spring({ frame: frame - ZERO_AT, fps, config: SLAM, durationInFrames: 12 });
  const shake = useShake([{ at: ZERO_AT + 1, amp: 8, dur: 9 }]);

  return (
    <Room tint="#FFFFFF" light={0.75}>
      <div style={{ position: "absolute", inset: 0, transform: shake }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 240, display: "flex", justifyContent: "center", gap: 20, fontFamily: poppins, fontWeight: 800, fontSize: 66, letterSpacing: "-0.04em", direction: "ltr" }}>
          <MaskUp at={40}><span style={{ color: "#F4F3EE" }}>Claude</span></MaskUp>
          <MaskUp at={43}><span style={{ color: "rgba(245,245,245,0.45)" }}>×</span></MaskUp>
          <MaskUp at={46}><span style={{ color: "#fff" }}>Shark Tank</span></MaskUp>
        </div>

        {/* four empty-handed judges drop into their seats — they light up in the next scene */}
        {[0, 1, 2, 3].map((i) => {
          const x = [848, 643, 438, 233][i];
          const p = spring({ frame: frame - SEAT_AT(i), fps, config: SLAM, durationInFrames: 12 });
          if (frame < SEAT_AT(i)) return null;
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: x, top: 710, transform: `translate(-50%, -100%) translateY(${(1 - p) * -420}px)`, filter: "grayscale(0.8) brightness(0.8)" }}>
                <PixelBot costume="none" px={13} />
              </div>
              <Shockwave at={SEAT_AT(i) + 8} x={x} y={684} color="#FFFFFF" size={150} dur={10} width={3} />
            </React.Fragment>
          );
        })}
        <Desk left={100} top={678} width={880} height={170} />

        {/* 365 days → 0 hours */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", alignItems: "center", gap: 44, direction: "rtl", opacity: chipIn, transform: `translateY(${(1 - chipIn) * 40}px)` }}>
          <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 16, opacity: interpolate(strike, [0, 1], [1, 0.5]) }}>
            <span style={{ fontFamily: pixelFont, fontSize: 48, color: "#F4F3EE", direction: "ltr" }}>365</span>
            <span style={{ fontFamily: cairo, fontWeight: 900, fontSize: 40, color: "#F4F3EE" }}>يوم</span>
            <div style={{ position: "absolute", left: -10, top: "55%", height: 7, width: `calc(${strike * 100}% + 20px)`, background: RED, borderRadius: 4 }} />
          </div>
          {frame >= ZERO_AT ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, opacity: Math.min(1, zero * 1.6), transform: `scale(${interpolate(zero, [0, 1], [1.9, 1])})` }}>
              <span style={{ fontFamily: pixelFont, fontSize: 84, color: TEAL, textShadow: "0 6px 0 rgba(0,0,0,0.6)", direction: "ltr" }}>0</span>
              <span style={{ fontFamily: cairo, fontWeight: 900, fontSize: 60, color: "#FFFFFF" }}>ساعة</span>
            </div>
          ) : null}
        </div>
      </div>
      <Shockwave at={ZERO_AT + 1} x={430} y={928} color={TEAL} size={300} dur={14} width={6} />
    </Room>
  );
};
