import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { cairo, poppins } from "./shared";
import { SNAP, SLAM, Shockwave, Sparks } from "./motion";

export const IDEA = "تطبيق توصيل أكل صحي في القاهرة";
export const IDEA_TYPE_AT = 4;

/**
 * Full-screen Claude input with the idea being typed — the reference's
 * "give all four the same idea" moment. A built illustration of the input in
 * Claude's own dark palette, not a screenshot.
 */
export const ClaudeInput: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: SNAP, durationInFrames: 10 });
  const typed = Math.max(0, Math.min(IDEA.length, frame - IDEA_TYPE_AT + 1));
  const caret = frame % 14 < 7;
  return (
    <AbsoluteFill style={{ background: "#262624" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: inP }}>
        {/* Claude's spark */}
        <svg width={60} height={60} viewBox="-12 -12 24 24">
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x={-1.2} y={-11} width={2.4} height={8} rx={1.2} fill="#D97757" transform={`rotate(${i * 36})`} />
          ))}
        </svg>
        <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 68, color: "#F4F3EE", letterSpacing: "-0.01em" }}>Claude</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 830,
          height: 150,
          borderRadius: 26,
          background: "#30302E",
          border: "1.5px solid #454541",
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
          opacity: inP,
          transform: `translateY(${(1 - inP) * 30}px)`,
          display: "flex",
          alignItems: "flex-start",
          padding: "28px 30px",
          direction: "rtl",
        }}
      >
        <span style={{ fontFamily: cairo, fontWeight: 700, fontSize: 44, color: "#F4F3EE" }}>{IDEA.slice(0, typed)}</span>
        <span style={{ width: 4, height: 50, background: "#F4F3EE", marginInlineStart: 4, opacity: caret ? 1 : 0 }} />
        <div style={{ position: "absolute", left: 22, bottom: 20, width: 56, height: 56, borderRadius: 14, background: "#D97757", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: poppins, fontWeight: 800, fontSize: 30, color: "#fff" }}>↑</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CTA_WORD = "Shark Tank";
export const CTA_TYPE_AT = 12;
export const CTA_STEP = 3;

/**
 * CTA in the reference's form — the comment word, big, on screen at chest
 * height over the A-roll — kept inside Instagram's safe zone (nothing below
 * y≈1450, nothing in the right-hand column).
 */
export const CtaWord: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = spring({ frame, fps, config: SNAP, durationInFrames: 11 });
  const typed = Math.max(0, Math.min(CTA_WORD.length, Math.floor((frame - CTA_TYPE_AT) / CTA_STEP) + 1));
  const done = CTA_TYPE_AT + (CTA_WORD.length - 1) * CTA_STEP + 3;
  const land = spring({ frame: frame - done, fps, config: SLAM, durationInFrames: 10 });
  const tail = spring({ frame: frame - done - 8, fps, config: SNAP, durationInFrames: 10 });
  const stroke = { WebkitTextStroke: "3px rgba(0,0,0,0.9)", paintOrder: "stroke fill" as const, textShadow: "0 5px 0 rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.7)" };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 52%, rgba(0,0,0,0.45) 64%, rgba(0,0,0,0.45) 76%, rgba(0,0,0,0) 86%)", opacity: head }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", opacity: head, transform: `translateY(${(1 - head) * 20}px)` }}>
        <span style={{ fontFamily: cairo, fontWeight: 900, fontSize: 46, color: "#FFFFFF", direction: "rtl", ...stroke }}>اكتب في التعليقات</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1218, display: "flex", justifyContent: "center", direction: "ltr" }}>
        <span style={{ fontFamily: poppins, fontWeight: 800, fontSize: 100, color: "#37E28F", letterSpacing: "-0.035em", transform: `scale(${1 + (1 - land) * 0.12 * (frame >= done ? 1 : 0)})`, display: "inline-block", ...stroke }}>
          “{CTA_WORD.slice(0, typed)}{typed === CTA_WORD.length ? "”" : ""}
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1372, textAlign: "center", opacity: tail, transform: `translateY(${(1 - tail) * 16}px)` }}>
        <span style={{ fontFamily: cairo, fontWeight: 900, fontSize: 40, color: "#FFFFFF", direction: "rtl", ...stroke }}>وهبعتلك الشرح خطوة بخطوة</span>
      </div>
      <Shockwave at={done + 1} x={540} y={1290} color="#37E28F" size={300} dur={16} width={6} />
      <Sparks at={done + 1} x={540} y={1290} color="#9BF5C7" n={14} dist={260} dur={16} />
    </AbsoluteFill>
  );
};
