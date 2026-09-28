import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont as loadPixel } from "@remotion/google-fonts/PressStart2P";
import { cairo } from "./shared";
import { PixelBot, type Costume } from "./Pixel";
import { SLAM } from "./motion";

const pixelFont = loadPixel("normal", { weights: ["400"] }).fontFamily;

export const TEAL = "#1FCFAE";
export const NAME_AT = 8;     // first letter of the name
export const NAME_STEP = 2;   // frames per letter

/**
 * White full-screen character card — the reference's "#1 The Believer" beat.
 * The number pops, the character bounces in, then the name types out letter
 * by letter (Arabic joins as it's typed, exactly as it would in a text field).
 */
export const TitleCard: React.FC<{ n: number; costume: Costume; name: string }> = ({ n, costume, name }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const num = spring({ frame, fps, config: SLAM, durationInFrames: 10 });
  const bot = spring({ frame: frame - 2, fps, config: { damping: 9, stiffness: 260, mass: 0.6 }, durationInFrames: 16 });
  const typed = Math.max(0, Math.min(name.length, Math.floor((frame - NAME_AT) / NAME_STEP) + 1));
  const caret = typed < name.length || frame % 14 < 7;

  return (
    <AbsoluteFill
      style={{ background: "#FFFFFF", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: "translateY(-60px)" }}>
        <div style={{ fontFamily: pixelFont, fontSize: 64, color: TEAL, transform: `scale(${interpolate(num, [0, 1], [1.8, 1])})`, opacity: Math.min(1, num * 1.5) }}>
          #{n}
        </div>
        <div style={{ height: 330, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 26 }}>
          <div style={{ transform: `translateY(${(1 - bot) * 120}px) scale(${0.4 + 0.6 * bot})`, opacity: Math.min(1, bot * 2) }}>
            <PixelBot costume={costume} px={22} />
          </div>
        </div>
        <div style={{ marginTop: 34, height: 150, display: "flex", alignItems: "center", direction: "rtl" }}>
          <span style={{ fontFamily: cairo, fontWeight: 900, fontSize: 124, color: "#111", letterSpacing: "-0.01em" }}>{name.slice(0, typed)}</span>
          <span style={{ width: 8, height: 110, marginInlineStart: 10, background: "#111", opacity: caret ? 1 : 0 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
