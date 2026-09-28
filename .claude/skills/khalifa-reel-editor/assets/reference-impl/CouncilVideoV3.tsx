import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { EDL, DURATION_V3, F30, shotAt, type Shot } from "./captions-council-v3";
import { BAND_Y, FULL_TOP, openFaceY, openPanelTransform } from "./council-v3-transitions";
import { CaptionOverlayCouncilV3 } from "./CaptionOverlayCouncilV3";
import { SoundLayerCouncilV4 } from "./SoundLayerCouncilV4";
import { C, StageClip } from "./scenes-maps/shared";
import { HookStage, RevealStage, FAIL_AT } from "./scenes-council/v3/Opening";
import { IntroStage, BelieverStage, SkepticStage, InvestorStage, JudgeStage } from "./scenes-council/v3/Stages";
import { TitleCard } from "./scenes-council/v3/TitleCard";
import { ClaudeInput, CtaWord } from "./scenes-council/v3/Screens";

const FACE = "council-video.mov";

/**
 * CLAUDE COUNCIL V3 — the reference's structure on the user's cut.
 *
 * One A-roll track underneath carries the voice for the whole piece. On top of
 * it, the edit decision list decides frame by frame which layout is showing:
 * split, full-frame face, a full-screen graphic, or a white title card. Each
 * graphic runs on its own clock (its `anchor`), so one graphic can be split
 * across two shots and still be continuous.
 */

/** Renders children only once the local clock reaches `from`. */
const Gate: React.FC<{ from: number; children: React.ReactNode }> = ({ from, children }) => {
  const f = useCurrentFrame();
  return f >= from ? <>{children}</> : null;
};

/** The A-roll's pose: face shots full frame at their crop (a punch-in is a hard cut), split shots moved down into the band. */
const faceTransform = (frame: number) => {
  const glideY = openFaceY(frame);
  if (glideY != null) return `translateY(${glideY}px)`;
  const s = shotAt(frame / 30);
  if (s.layout === "split") return `translateY(${BAND_Y}px)`;
  return `scale(${s.layout === "face" ? s.scale ?? 1 : 1})`;
};

/** A graphic, mounted on its own clock but only visible inside its shot. */
const ShotView: React.FC<{ shot: Shot; idx: number; children: React.ReactNode }> = ({ shot, idx, children }) => {
  const anchor = F30(shot.anchor ?? shot.a);
  return (
    <Sequence from={anchor} durationInFrames={F30(shot.b) - anchor}>
      <Gate from={F30(shot.a) - anchor}>
        {idx === 1 ? <OpeningGlide anchor={anchor}>{children}</OpeningGlide> : children}
      </Gate>
    </Sequence>
  );
};

/** Only the split right after the full-screen opening moves — see council-v3-transitions. */
const OpeningGlide: React.FC<{ anchor: number; children: React.ReactNode }> = ({ anchor, children }) => {
  const frame = useCurrentFrame() + anchor;   // back to the global clock
  return <AbsoluteFill style={{ transform: openPanelTransform(frame) }}>{children}</AbsoluteFill>;
};

const graphic = (g: Shot["g"]) => {
  switch (g) {
    case "hook": return <HookStage />;
    case "reveal": return <RevealStage />;
    case "intro": return <IntroStage />;
    case "believer": return <BelieverStage />;
    case "skeptic": return <SkepticStage />;
    case "investor": return <InvestorStage />;
    case "judge": return <JudgeStage />;
    default: return null;
  }
};

/** Red creeping in at the corners — only once the idea has failed. */
const FailVignette: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(f, [FAIL_AT, FAIL_AT + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), background: "radial-gradient(90% 70% at 50% 45%, transparent 45%, rgba(232,25,26,0.55) 100%)" }} />;
};

const Layer: React.FC<{ shot: Shot; idx: number }> = ({ shot, idx }) => {
  if (shot.layout === "split") {
    return (
      <ShotView shot={shot} idx={idx}>
        <StageClip square>{graphic(shot.g)}</StageClip>
      </ShotView>
    );
  }
  if (shot.layout === "full" && shot.g === "hook") {
    // the fail, full screen: the same room centred on a matching dark field, red creeping in at the corners
    return (
      <ShotView shot={shot} idx={idx}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, #12151B 0%, #0B0D11 100%)" }}>
          <div style={{ position: "absolute", left: 0, top: FULL_TOP, width: 1080, height: 1120 }}>
            <HookStage />
          </div>
          <FailVignette />
        </AbsoluteFill>
      </ShotView>
    );
  }
  if (shot.layout === "full" && shot.g === "claude") {
    return <ShotView shot={shot} idx={idx}><ClaudeInput /></ShotView>;
  }
  if (shot.layout === "title") {
    const n = Number(shot.g?.slice(1));
    const cfg = [
      { costume: "believer" as const, name: "المؤيد" },
      { costume: "skeptic" as const, name: "المشكك" },
      { costume: "investor" as const, name: "المستثمر" },
      { costume: "judge" as const, name: "الفيصل" },
    ][n - 1];
    return <ShotView shot={shot} idx={idx}><TitleCard n={n} costume={cfg.costume} name={cfg.name} /></ShotView>;
  }
  if (shot.g === "cta") {
    return <ShotView shot={shot} idx={idx}><CtaWord /></ShotView>;
  }
  return null;
};

export const CouncilVideoV3: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* the A-roll: carries the voice for the whole piece */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {/* one A-roll for every layout: in split shots it is moved down into the band, so a layout change is a move, never a swap */}
        <OffthreadVideo src={staticFile(FACE)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: faceTransform(frame), transformOrigin: "50% 36%" }} />
      </AbsoluteFill>

      {EDL.map((s, i) => <Layer key={i} shot={s} idx={i} />)}

      <CaptionOverlayCouncilV3 />

      <div style={{ position: "absolute", top: 0, left: 0, height: 6, background: C.red, boxShadow: "0 0 18px rgba(232,25,26,0.8)", width: `${interpolate(frame, [0, DURATION_V3], [0, 100], { extrapolateRight: "clamp" })}%` }} />

      <SoundLayerCouncilV4 />
    </AbsoluteFill>
  );
};
