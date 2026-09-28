import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { loadFont as loadPixel } from "@remotion/google-fonts/PressStart2P";
import { cairo, poppins } from "./shared";
import { PixelBot, type Costume } from "./Pixel";
import { TEAL } from "./TitleCard";
import { SNAP, SLAM, Shockwave, Sparks, useShake, MaskUp } from "./motion";

const pixelFont = loadPixel("normal", { weights: ["400"] }).fontFamily;
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const W = 1080, H = 1120;

/* ── the room ────────────────────────────────────────────────── */

/**
 * A dark spotlit room — the stage every character performs on. The light is
 * tinted per character; the "#N" tag sits on the seam, where the reference
 * puts it, just above the supers.
 */
export const Room: React.FC<{ tint: string; tag?: string; wall?: string; children?: React.ReactNode; light?: number }> = ({ tint, tag, wall = "#12151B", children, light = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tagP = spring({ frame: frame - 4, fps, config: SNAP, durationInFrames: 10 });
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, overflow: "hidden", background: `linear-gradient(180deg, ${wall} 0%, #0B0D11 100%)` }}>
      {/* back wall panels */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 120px)" }} />
      {/* spotlight cone */}
      <div
        style={{
          position: "absolute",
          left: W / 2 - 420,
          top: -40,
          width: 840,
          height: 980,
          background: `linear-gradient(180deg, ${tint}55 0%, ${tint}1A 55%, transparent 100%)`,
          clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
          opacity: light,
          filter: "blur(6px)",
        }}
      />
      <div style={{ position: "absolute", left: W / 2 - 70, top: -40, width: 140, height: 80, borderRadius: "50%", background: "#FFF6E0", filter: "blur(10px)", opacity: 0.9 * light }} />
      {/* floor pool of light */}
      <div style={{ position: "absolute", left: W / 2 - 360, top: 760, width: 720, height: 170, borderRadius: "50%", background: `radial-gradient(closest-side, ${tint}55, transparent)`, opacity: light }} />
      {children}
      {/* vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.7) 100%)", pointerEvents: "none" }} />
      {tag ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 952, display: "flex", justifyContent: "center", opacity: tagP, transform: `scale(${interpolate(tagP, [0, 1], [1.5, 1])})` }}>
          <span style={{ fontFamily: pixelFont, fontSize: 40, color: TEAL, textShadow: "0 4px 0 rgba(0,0,0,0.6)" }}>{tag}</span>
        </div>
      ) : null}
    </div>
  );
};

/** The character standing on the floor at (x, feet). `hop` = one-shot jump. */
export const Actor: React.FC<{ costume: Costume; x?: number; feet?: number; px?: number; hopAt?: number; enterAt?: number }> = ({ costume, x = W / 2, feet = 860, px = 16, hopAt, enterAt = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - enterAt, fps, config: { damping: 11, stiffness: 240, mass: 0.6 }, durationInFrames: 14 });
  const hop = hopAt == null ? 0 : Math.sin(Math.PI * interpolate(frame, [hopAt, hopAt + 12], [0, 1], clamp)) * 46;
  return (
    <div style={{ position: "absolute", left: x, top: feet, transform: `translate(-50%, -100%) translateY(${(1 - enter) * 80 - hop}px)`, opacity: Math.min(1, enter * 2) }}>
      <PixelBot costume={costume} px={px} />
    </div>
  );
};

/* ── Claude Council: the four, introduced ────────────────────── */

const CARD_COLORS = ["#37E28F", "#FF4D4D", "#F6C343", "#F4F3EE"];
const COSTUMES: Costume[] = ["believer", "skeptic", "investor", "judge"];
export const INTRO_LIGHT_AT = (i: number) => 64 + i * 5;   // "فيها أربع حكام" — 11.60s

export const IntroStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Room tint="#FFFFFF" light={0.8}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 240, display: "flex", justifyContent: "center", gap: 18, fontFamily: poppins, fontWeight: 800, fontSize: 70, letterSpacing: "-0.04em", direction: "ltr" }}>
        <MaskUp at={2}><span style={{ color: "#F4F3EE" }}>Claude</span></MaskUp>
        <MaskUp at={5}><span style={{ color: "#fff" }}>Council</span></MaskUp>
      </div>
      {/* four cards, right → left in reading order */}
      {[0, 1, 2, 3].map((i) => {
        const x = [776, 552, 328, 104][i];   // 4 × 200 + 3 × 24 = 872 wide, centred on 540
        const inP = spring({ frame: frame - (4 + i * 5), fps, config: SNAP, durationInFrames: 12 });
        const lit = spring({ frame: frame - INTRO_LIGHT_AT(i), fps, config: SLAM, durationInFrames: 10 });
        const c = CARD_COLORS[i];
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: x,
                top: 420,
                width: 200,
                height: 290,
                borderRadius: 22,
                background: `linear-gradient(180deg, ${c}${lit > 0.5 ? "33" : "10"} 0%, rgba(16,16,18,0.95) 70%)`,
                border: `3px solid ${c}${lit > 0.5 ? "" : "44"}`,
                boxShadow: lit > 0.5 ? `0 0 ${46 * lit}px ${c}88` : "0 16px 36px rgba(0,0,0,0.6)",
                opacity: inP,
                transform: `translateY(${(1 - inP) * 60}px) scale(${1 + 0.06 * lit * (1 - lit) * 4})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                filter: lit > 0.5 ? "none" : "grayscale(0.85) brightness(0.55)",
              }}
            >
              <PixelBot costume={COSTUMES[i]} px={8} />
            </div>
            <Shockwave at={INTRO_LIGHT_AT(i) + 1} x={x + 100} y={565} color={c} size={170} dur={12} width={4} />
          </React.Fragment>
        );
      })}
    </Room>
  );
};

/* ── #1 The Believer: growth + confetti ──────────────────────── */

export const BELIEVER_WIN = 54;   // on the word "هتنجح" — 18.40s

export const BelieverStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heights = [120, 170, 150, 230, 290, 360, 450];
  return (
    <Room tint="#37E28F" tag="#1">
      {/* growth chart behind the character */}
      {heights.map((h, i) => {
        const p = spring({ frame: frame - (2 + i * 3), fps, config: SNAP, durationInFrames: 12 });
        return (
          <div key={i} style={{ position: "absolute", left: 250 + i * 86, top: 700 - h * p, width: 56, height: h * p, borderRadius: 8, background: "linear-gradient(180deg, #5CF0A8, #1E9E60)", boxShadow: "0 0 24px rgba(55,226,143,0.4)", opacity: 0.9 }} />
        );
      })}
      <Actor costume="believer" hopAt={BELIEVER_WIN} />
      {/* confetti on "هتنجح" */}
      {frame >= BELIEVER_WIN
        ? Array.from({ length: 46 }).map((_, i) => {
            const l = frame - BELIEVER_WIN;
            const seed = (i * 7919) % 1000 / 1000;
            const x = 80 + ((i * 131) % 920);
            const y = -40 + l * (10 + seed * 9) - (seed > 0.5 ? 0 : 60);
            const col = ["#37E28F", "#FFFFFF", "#F6C343", "#9BF5C7"][i % 4];
            return <div key={i} style={{ position: "absolute", left: x, top: y, width: 12, height: 20, background: col, transform: `rotate(${l * (6 + seed * 14)}deg)`, opacity: interpolate(l, [0, 50], [1, 0], clamp) }} />;
          })
        : null}
      <Shockwave at={BELIEVER_WIN} x={W / 2} y={760} color="#37E28F" size={320} dur={16} width={6} />
    </Room>
  );
};

/* ── #2 The Skeptic: the idea, marked up in red ─────────────── */

export const SKEPTIC_MARKS = [36, 46, 65];   // "فكرتك" 22.6s, "هتفشل" 22.93s, "وهتفشل" 23.57s

export const SkepticStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const doc = spring({ frame, fps, config: SNAP, durationInFrames: 12 });
  const draw = (at: number, len = 10) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const shake = useShake([{ at: SKEPTIC_MARKS[2] + 2, amp: 8, dur: 9 }]);
  return (
    <Room tint="#FF4D4D" tag="#2" wall="#161218">
      <div style={{ position: "absolute", inset: 0, transform: shake }}>
        {/* the document under the light */}
        <div style={{ position: "absolute", left: 360, top: 250, width: 360, height: 470, borderRadius: 10, background: "#F7F4EC", boxShadow: "0 30px 60px rgba(0,0,0,0.6)", transform: `translateY(${(1 - doc) * 60}px) rotate(-3deg)`, opacity: doc, padding: 30 }}>
          <div style={{ fontFamily: cairo, fontWeight: 900, fontSize: 30, color: "#222", direction: "rtl" }}>فكرة المشروع</div>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ marginTop: 18, height: 12, width: `${[92, 78, 88, 64, 84, 70, 58][i]}%`, marginInlineStart: "auto", borderRadius: 6, background: "#C9C4B8" }} />
          ))}
          {/* red marks, hand-drawn */}
          <svg width={360} height={470} style={{ position: "absolute", left: 0, top: 0 }}>
            <path d="M40 118 L320 112" stroke="#E0312F" strokeWidth={7} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(SKEPTIC_MARKS[0])} />
            <ellipse cx={200} cy={236} rx={150} ry={34} stroke="#E0312F" strokeWidth={6} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(SKEPTIC_MARKS[1], 12)} transform="rotate(-4 200 236)" />
            <path d="M60 300 L300 440 M300 300 L60 440" stroke="#E0312F" strokeWidth={10} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(SKEPTIC_MARKS[2], 9)} />
          </svg>
        </div>
      </div>
      <Actor costume="skeptic" x={200} feet={880} px={12} enterAt={6} />
      <Shockwave at={SKEPTIC_MARKS[2] + 3} x={540} y={620} color="#FF4D4D" size={260} dur={14} width={6} />
    </Room>
  );
};

/* ── #3 The Investor: does it make money ─────────────────────── */

export const INVESTOR_MONEY = 56;   // on the word "فلوس" — 29.27s

export const InvestorStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fill = interpolate(frame, [8, INVESTOR_MONEY + 8], [0, 0.86], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const coin = (i: number) => spring({ frame: frame - (2 + i * 3), fps, config: SLAM, durationInFrames: 9 });
  const line = interpolate(frame, [6, INVESTOR_MONEY], [0, 1], clamp);
  return (
    <Room tint="#F6C343" tag="#3" wall="#17150E">
      {/* rising line behind */}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <polyline points="120,720 280,640 400,670 540,520 680,560 820,380 960,300" fill="none" stroke="#F6C343" strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} opacity={0.55} />
      </svg>
      {/* coin stacks */}
      {[0, 1].map((s) =>
        Array.from({ length: 7 }).map((_, i) => {
          const k = s * 7 + i;
          const p = coin(k);
          return (
            <div key={k} style={{ position: "absolute", left: s === 0 ? 170 : 330, top: 850 - i * 22, width: 110, height: 24, borderRadius: "50%", background: i % 2 ? "#B8871C" : "#F6C343", border: "2px solid #7A5A10", opacity: p, transform: `translateY(${(1 - p) * -200}px)` }} />
          );
        }),
      )}
      {/* the money gauge */}
      <div style={{ position: "absolute", left: 830, top: 360, width: 90, height: 500, borderRadius: 45, background: "rgba(255,255,255,0.08)", border: "3px solid rgba(246,195,67,0.6)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${fill * 100}%`, background: "linear-gradient(180deg, #FFE08A, #D49A1C)", boxShadow: "0 0 30px rgba(246,195,67,0.7)" }} />
      </div>
      <Actor costume="investor" x={600} feet={870} px={14} hopAt={INVESTOR_MONEY} />
      {/* coins rain on "فلوس" */}
      {frame >= INVESTOR_MONEY
        ? Array.from({ length: 22 }).map((_, i) => {
            const l = frame - INVESTOR_MONEY;
            const seed = ((i * 3571) % 997) / 997;
            const x = 90 + ((i * 173) % 880);
            const y = -60 + l * (14 + seed * 10) - seed * 120;
            return <div key={i} style={{ position: "absolute", left: x, top: y, width: 34, height: 34, borderRadius: "50%", background: "#F6C343", border: "3px solid #9C7414", transform: `scaleX(${Math.abs(Math.cos(l * 0.35 + i))})`, opacity: interpolate(l, [0, 40], [1, 0], clamp) }} />;
          })
        : null}
      <Sparks at={INVESTOR_MONEY} x={875} y={400} color="#FFE08A" n={12} dist={160} dur={16} />
    </Room>
  );
};

/* ── #4 The Judge: reads the three, then rules ───────────────── */

export const JUDGE_DOCS = [8, 18, 28];   // across "آراء التلات حكام" — 32.6s–33.2s
export const JUDGE_RULE = 39;            // "ويقولك…" — 33.60s

export const JudgeStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shake = useShake([{ at: JUDGE_RULE + 1, amp: 14, dur: 12 }]);
  const seal = spring({ frame: frame - JUDGE_RULE - 2, fps, config: SLAM, durationInFrames: 12 });
  const docs = [
    { c: "#37E28F", t: "هتنجح", x: 690 },
    { c: "#FF4D4D", t: "هتفشل", x: 480 },
    { c: "#F6C343", t: "فيها فلوس", x: 270 },
  ];
  return (
    <Room tint="#8FA8FF" tag="#4" wall="#101628">
      <div style={{ position: "absolute", inset: 0, transform: shake }}>
        <Actor costume="judge" x={540} feet={640} px={15} />
        {/* the bench */}
        <div style={{ position: "absolute", left: 90, top: 600, width: 900, height: 190, borderRadius: 16, background: "linear-gradient(180deg, #6B4420, #3E2612)", boxShadow: "0 -6px 0 #8B5A2B inset, 0 30px 60px rgba(0,0,0,0.6)" }} />
        {/* the three verdicts land on the bench */}
        {docs.map((d, i) => {
          const at = JUDGE_DOCS[i];
          const t = interpolate(frame, [at, at + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
          if (frame < at) return null;
          return (
            <div key={i} style={{ position: "absolute", left: d.x, top: 560 + (1 - t) * -520, width: 150, height: 104, borderRadius: 12, background: "#F7F4EC", border: `4px solid ${d.c}`, transform: `rotate(${(i - 1) * 5 + (1 - t) * 30}deg)`, boxShadow: "0 16px 30px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: cairo, fontWeight: 900, fontSize: 30, color: d.c === "#F6C343" ? "#9C7414" : d.c, direction: "rtl" }}>{d.t}</span>
            </div>
          );
        })}
        {/* the ruling: a seal slammed onto the bench */}
        {frame >= JUDGE_RULE + 2 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, direction: "rtl", opacity: Math.min(1, seal * 1.6), transform: `scale(${interpolate(seal, [0, 1], [1.9, 1])})` }}>
            <div style={{ width: 132, height: 132, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #FF6B5B, #B01E1A)", border: "5px solid #7E1210", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 50px rgba(224,49,47,0.6)", direction: "ltr" }}>
              <span style={{ fontFamily: poppins, fontWeight: 800, fontSize: 50, color: "#FFF", letterSpacing: "-0.04em" }}>7<span style={{ fontSize: 24, opacity: 0.8 }}>/10</span></span>
            </div>
            <span style={{ fontFamily: cairo, fontWeight: 900, fontSize: 62, color: "#FFFFFF", textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>تنجح بشرط</span>
          </div>
        ) : null}
      </div>
      <Shockwave at={JUDGE_RULE + 3} x={540} y={855} color="#FFFFFF" size={420} dur={18} width={8} />
      <Sparks at={JUDGE_RULE + 3} x={540} y={855} color="#FFD7A0" n={16} dist={300} dur={16} />
    </Room>
  );
};
