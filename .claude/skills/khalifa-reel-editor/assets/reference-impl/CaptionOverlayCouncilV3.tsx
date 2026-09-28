import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { cuesV3, shotAt, EDL } from "./captions-council-v3";
import { captionTransform } from "./council-v3-transitions";

const cairo = loadCairo("normal", { weights: ["900"] }).fontFamily;

const WHITE = "#FFFFFF";
const RED = "#FF4D4D";
const CLAUDE_TEXT = "#F4F3EE";

type Run = { t: string; serif?: boolean; color?: string; latin?: boolean };

/** *serif*  +positive+ (plain white — the user asked for no green)  -red-  and Latin runs isolated so bidi never reorders them. */
function parse(text: string): Run[] {
  const out: Run[] = [];
  const re = /(\*[^*]+\*|\+[^+]+\+|-[^-]+-)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(...splitLatin(text.slice(last, m.index!), {}));
    const inner = m[0].slice(1, -1);
    const k = m[0][0];
    out.push(...splitLatin(inner, k === "*" ? { serif: true } : k === "+" ? {} : { color: RED }));
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(...splitLatin(text.slice(last), {}));
  return out;
}

function splitLatin(s: string, base: Omit<Run, "t">): Run[] {
  return s.split(/([A-Za-z][A-Za-z ]*[A-Za-z]|[A-Za-z])/).filter(Boolean).map((t) => {
    const latin = /^[A-Za-z ]+$/.test(t);
    const color = latin && t.trim() === "Claude" ? CLAUDE_TEXT : base.color;
    return { t, ...base, color, latin };
  });
}

const plainLength = (s: string) => s.replace(/[*+-]/g, "").length;

/**
 * V3 supers — the reference's look inside the user's rules: ALWAYS one line,
 * all Cairo (the user asked to keep Cairo rather than the reference's serif
 * mix), and colour only for the red "fails" words — no green (user's call). No box:
 * a hard outline and a deep shadow, as in the reference.
 *
 * Position follows the layout: on the seam in split shots, at the chest in
 * full-frame shots, and hidden on the white title cards, the Claude prompt screen and the CTA.
 */
export const CaptionOverlayCouncilV3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const shot = shotAt(t);
  // no supers on the title cards, the CTA, or the Claude prompt screen (user: they pull the eye off the typing)
  if (shot.layout === "title" || shot.g === "cta" || shot.g === "claude") return null;
  // blink across a cut so a super never straddles two layouts
  if (Math.abs(t - shot.a) < 0.05 && shot.a > 0 && EDL.indexOf(shot) !== 1) return null;   // not across the opening glide — the line rides it

  const cue = cuesV3.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  // a line that was spoken over a title card (the card already shows the name) must not
  // flash back for a split second after it — e.g. "تالت واحد وهو المستثمر" at 25.6–25.9s
  const prev = EDL[EDL.indexOf(shot) - 1];
  if (prev?.layout === "title" && cue.start < shot.a && cue.end - shot.a < 0.5) return null;

  const local = frame - Math.round(Math.max(cue.start, shot.a) * fps);
  const pop = spring({ frame: local, fps, config: { damping: 13, stiffness: 300, mass: 0.4 }, durationInFrames: 7 });

  // 760px max line width: keeps the longest lines clear of Instagram's right-hand buttons (x > ~950)
  const size = Math.min(60, 760 / (plainLength(cue.text) * 0.53));
  const centreY = shot.layout === "split" ? 1120 : 1300;

  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: centreY - 60, height: 120, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", transform: captionTransform(frame) }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.28em",
          direction: "rtl",
          whiteSpace: "nowrap",
          transform: `translateY(${interpolate(pop, [0, 1], [14, 0])}px) scale(${interpolate(pop, [0, 1], [0.86, 1])})`,
        }}
      >
        {parse(cue.text).filter((r) => r.t.trim() !== "").map((r, i) => (
          <span
            key={i}
            style={{
              // Cairo throughout — the user's call; *…* marks no longer change the face
              fontFamily: cairo,
              fontWeight: 900,
              fontSize: size,
              color: r.color ?? WHITE,
              direction: r.latin ? "ltr" : "rtl",
              unicodeBidi: "isolate",
              WebkitTextStroke: `${Math.max(2, size * 0.05)}px rgba(0,0,0,0.9)`,
              paintOrder: "stroke fill",
              textShadow: "0 4px 0 rgba(0,0,0,0.55), 0 8px 26px rgba(0,0,0,0.75)",
              letterSpacing: r.latin ? "-0.01em" : 0,
              whiteSpace: "pre",
            }}
          >
            {r.t.trim()}
          </span>
        ))}
      </div>
    </div>
  );
};
