import React from "react";
import { OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

// Brand tokens are shared with the rest of the Chronixel videos.
export { C, brandGradient, cairo, poppins, poppinsStyle, cairoStyle, glassPanel, useReveal } from "../scenes-claude/shared";
import { C, brandGradient, poppinsStyle, cairoStyle } from "../scenes-claude/shared";

// ── Layout ────────────────────────────────────────────────────
// Split line: demo panel above, face card below. Supers sit ON the seam.
export const SEAM_Y = 1120;

export type Box = { left: number; top: number; w: number; h: number };

// The default card, and a short wide variant for captures whose subject is a
// single strip of UI (a prompt bar, a chat bubble) — cropping those to the tall
// card would strand them in a field of empty white.
export const CARD: Box = { left: 40, top: 246, w: 1000, h: 648 };
export const BANNER: Box = { left: 40, top: 430, w: 1000, h: 300 };

// Source dimensions of every clip in public/broll-maps.
export const SRC_W = 1870;
export const SRC_H = 1328;

/**
 * A screen-capture clip cropped to a region of interest and drawn at card size.
 *
 * `crop` is [x, y, w, h] in SOURCE pixels. The framing is STATIC by default —
 * no creeping Ken Burns push, which reads as drift rather than intent. When a
 * detail needs pointing at, `snap` re-frames to a tighter crop once, on a hard
 * spring, at the frame the voice gets to it.
 */
export const CropVideo: React.FC<{
  file: string;
  crop: [number, number, number, number];
  durationInFrames: number;
  startFrom?: number;   // trim into the clip, in frames
  box?: Box;
  snap?: { at: number; crop: [number, number, number, number] };
}> = ({ file, crop, startFrom = 0, box = CARD, snap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // One hard re-frame, or nothing at all.
  const t = snap
    ? spring({ frame: frame - snap.at, fps, config: { damping: 20, stiffness: 320, mass: 0.5 }, durationInFrames: 9 })
    : 0;
  const to = snap ? snap.crop : crop;
  const [cx, cy, cw, ch] = [0, 1, 2, 3].map((i) => crop[i] + (to[i] - crop[i]) * t) as [number, number, number, number];

  const k = Math.max(box.w / cw, box.h / ch);
  const centreX = cx + cw / 2;
  const centreY = cy + ch / 2;
  const left = box.w / 2 - centreX * k;
  const top = box.h / 2 - centreY * k;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#fff" }}>
      <OffthreadVideo
        src={staticFile(`broll-maps/${file}`)}
        muted
        startFrom={startFrom}
        style={{
          position: "absolute",
          left,
          top,
          width: SRC_W * k,
          height: SRC_H * k,
          maxWidth: "none",
        }}
      />
    </div>
  );
};

/** The rounded, brand-framed card the capture lives inside. */
export const DemoCard: React.FC<{ children: React.ReactNode; glow?: boolean; box?: Box }> = ({
  children,
  glow = true,
  box = CARD,
}) => (
  <div
    style={{
      position: "absolute",
      left: box.left,
      top: box.top,
      width: box.w,
      height: box.h,
      borderRadius: 34,
      overflow: "hidden",
      border: `2px solid ${glow ? "rgba(232,25,26,0.55)" : "rgba(255,255,255,0.12)"}`,
      boxShadow: glow
        ? "0 0 70px rgba(232,25,26,0.28), 0 26px 70px rgba(0,0,0,0.65)"
        : "0 26px 70px rgba(0,0,0,0.65)",
      backgroundColor: "#fff",
    }}
  >
    {children}
  </div>
);

/**
 * Clips a scene to the top panel. Without this a scene drawn with `inset: 0`
 * fills the whole 1080×1920 frame and paints over the face card below.
 */
export const StageClip: React.FC<{ children: React.ReactNode; square?: boolean }> = ({ children, square }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: 1080,
      height: SEAM_Y,
      overflow: "hidden",
      borderBottomLeftRadius: square ? 0 : 40,
      borderBottomRightRadius: square ? 0 : 40,
    }}
  >
    {children}
  </div>
);

/** The dark stage behind the demo card — grid + red floor glow. */
export const DemoStage: React.FC<{ children?: React.ReactNode; square?: boolean }> = ({ children, square }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: 1080,
      height: SEAM_Y,
      overflow: "hidden",
      borderBottomLeftRadius: square ? 0 : 40,
      borderBottomRightRadius: square ? 0 : 40,
      borderBottom: `1.5px solid ${C.glassBorder}`,
      background: `radial-gradient(120% 80% at 50% 100%, rgba(232,25,26,0.16), rgba(0,0,0,0) 58%), ${C.black}`,
      boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0 79px, ${C.gridLine} 79px 80px), repeating-linear-gradient(90deg, transparent 0 79px, ${C.gridLine} 79px 80px)`,
        maskImage: "radial-gradient(120% 100% at 50% 100%, #000 60%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(120% 100% at 50% 100%, #000 60%, transparent 100%)",
      }}
    />
    {children}
  </div>
);

/** Step chip + Arabic label, sitting above the card. */
export const StepHeader: React.FC<{ num?: string; label: string; delay?: number }> = ({ num, label, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 180, mass: 0.5 }, durationInFrames: 14 });
  const y = interpolate(p, [0, 1], [26, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 96,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        opacity: p,
        transform: `translateY(${y}px)`,
      }}
    >
      {num ? (
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 22,
            background: brandGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 46px rgba(232,25,26,0.5)",
            ...poppinsStyle,
            fontSize: 50,
            color: "#fff",
          }}
        >
          {num}
        </div>
      ) : null}
      <div style={/^[\x00-\x7F]+$/.test(label.replace(/\s/g, "")) ? { ...poppinsStyle, fontSize: 66, color: C.white } : { ...cairoStyle, fontSize: 66, color: C.white }}>
        {/* "Claude" always carries Claude's own brand colour */}
        {label.split(/(Claude)/).map((part, i) =>
          part === "Claude" ? (
            <span key={i} style={{ color: "#D97757", direction: "ltr", unicodeBidi: "isolate", margin: "0 0.12em" }}>{part}</span>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          ),
        )}
      </div>
    </div>
  );
};

/**
 * Names what the viewer is looking at. It sits BELOW the card, never on top of
 * it — a label over the capture covers the thing it is labelling.
 */
export const CardTag: React.FC<{ text: string; delay?: number; box?: Box }> = ({
  text,
  delay = 6,
  box = CARD,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 200, mass: 0.5 }, durationInFrames: 12 });
  const latin = /^[\x00-\x7F]+$/.test(text.replace(/\s/g, ""));

  return (
    <div
      style={{
        position: "absolute",
        top: box.top + box.h + 22,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [18, 0])}px)`,
      }}
    >
      <div
        style={{
          background: brandGradient,
          borderRadius: 16,
          padding: "12px 28px",
          boxShadow: "0 0 44px rgba(232,25,26,0.45)",
          ...(latin ? poppinsStyle : cairoStyle),
          fontSize: 42,
          color: "#fff",
        }}
      >
        {text}
      </div>
    </div>
  );
};
