import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TitleCard, NAME_AT, NAME_STEP } from "./kit/TitleCard";
import { IntroStage, INTRO_LIGHT_AT } from "./kit/Stages";
import { StageClip, SEAM_Y, cairo } from "./kit/shared";

/**
 * A 5-second check that the whole kit works on a fresh machine — no footage
 * needed: a white title card typing a name (Cairo + pixel font + key clicks),
 * then the spotlit room with four cards lighting up (a click on each), with a
 * one-line super on the seam. If this renders with sound, the setup is done.
 */
export const STYLE_CHECK_FRAMES = 150;
const NAME = "المؤيد";
const dB = (d: number) => Math.pow(10, d / 20);

const Sfx: React.FC<{ at: number; src: string; db: number }> = ({ at, src, db }) => (
  <Sequence from={at} durationInFrames={40}>
    <Audio src={staticFile(src)} volume={dB(db)} />
  </Sequence>
);

export const StyleCheck: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence durationInFrames={45}>
      <TitleCard n={1} costume="believer" name={NAME} />
    </Sequence>
    <Sequence from={45}>
      <StageClip><IntroStage /></StageClip>
      <div style={{ position: "absolute", left: 0, right: 0, top: SEAM_Y + 40, textAlign: "center", fontFamily: cairo, fontWeight: 900, fontSize: 58, color: "#fff", direction: "rtl", WebkitTextStroke: "3px rgba(0,0,0,0.9)", paintOrder: "stroke fill" }}>
        الستايل شغال
      </div>
    </Sequence>

    <Sfx at={0} src="sfx-council/pop.wav" db={-23} />
    {Array.from({ length: NAME.length }, (_, i) => <Sfx key={`k${i}`} at={NAME_AT + i * NAME_STEP} src="sfx/key.wav" db={-31} />)}
    <Sfx at={41} src="sfx-council/whoosh.wav" db={-26} />
    {[0, 1, 2, 3].map((i) => <Sfx key={`c${i}`} at={45 + 4 + i * 5 + 3} src={`sfx-council/tick-${i * 3}.wav`} db={-32} />)}
    {[0, 1, 2, 3].map((i) => <Sfx key={`p${i}`} at={45 + INTRO_LIGHT_AT(i)} src={`sfx-council/pop-${i}.wav`} db={-22} />)}
  </AbsoluteFill>
);
