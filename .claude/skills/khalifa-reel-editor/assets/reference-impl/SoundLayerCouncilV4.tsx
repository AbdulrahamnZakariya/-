import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { EDL, F30 } from "./captions-council-v3";
import { FAIL_AT, DAYS_START, DAYS_END, SEAT_AT, ZERO_AT } from "./scenes-council/v3/Opening";
import { INTRO_LIGHT_AT, BELIEVER_WIN, SKEPTIC_MARKS, INVESTOR_MONEY, JUDGE_DOCS, JUDGE_RULE } from "./scenes-council/v3/Stages";
import { NAME_AT, NAME_STEP } from "./scenes-council/v3/TitleCard";
import { IDEA, IDEA_TYPE_AT, CTA_WORD, CTA_TYPE_AT, CTA_STEP } from "./scenes-council/v3/Screens";

/**
 * Sound V4 — a full redesign after the user's review of V3's pared-back pass
 * ("when there is a counter there is no sound… 4 judges and no click").
 *
 * Rule: every action you can SEE has a sound, locked to its frame — but the
 * sounds live in three tiers so the mix never gets loud or busy:
 *
 *   UI     ticks, keys, clicks     −20…−26 dB   texture; sits under the voice
 *   ACTION pops, lands, strokes    −12…−16 dB   the four judges, cards, marks
 *   HIT    stamp, zero, gavel      −10…−12 dB   one per beat, ON the word
 *
 * Big hits are timed to the measured onset of the word they punctuate (see
 * Opening/Stages constants). Long tails (shimmer, gavel) are trimmed with a
 * fade so they never sit on top of the next words. A real music bed runs
 * underneath: the user's own track, level set by them in CapCut — never
 * gained, ducked or faded here.
 */

const kit = (f: string) => `sfx-council/${f}.wav`;
const KEY = "sfx/key.wav";
const dB = (d: number) => Math.pow(10, d / 20);

type Cue = { at: number; src: string; db: number; len?: number; keep?: boolean };
const c = (at: number, f: string, d: number, len?: number): Cue => ({ at, src: f.startsWith("sfx/") ? f : kit(f), db: d, len });

const at = F30;
const H = at(1.5), R = at(4.66), IN = at(9.46), CL = at(12.8);
const B = at(16.6), SK = at(21.4), IV = at(27.4), JU = at(32.3), CTA = at(35.7);
const TITLES = [at(15.28), at(19.52), at(24.36), at(30.02)];
const NAMES = ["المؤيد", "المشكك", "المستثمر", "الفيصل"];

/* ── cuts: a whoosh into every new graphic ───────────────────── */
const cuts: Cue[] = EDL.slice(1).flatMap((s, i): Cue[] => {
  if (s.layout === "face" || s.layout === "title") return [];
  if (s.g === EDL[i].g) return [];                       // same graphic continuing
  return [c(at(s.a) - 4, "whoosh", -26)];   // user: "too high" at −16
});

/* ── hook: the counter, the fail ─────────────────────────────── */
// the ticks speed up and slow down WITH the counter's easing
const dayAt = (d: number) => {
  // invert the counter's easeInOut-cubic curve from Opening.tsx (frames DAYS_START → DAYS_END, 1 → 365)
  const p = (d - 1) / 364;
  const t = p < 0.5 ? Math.cbrt(p / 4) : 1 - Math.cbrt((1 - p) / 4);
  return DAYS_START + t * (DAYS_END - DAYS_START);
};
// one tick every 24 days — the count runs ~1.8s, so 12-day ticks would blur into a buzz
const counterTicks: Cue[] = Array.from({ length: 15 }, (_, k) => 24 + k * 24)
  .map((d) => Math.round(dayAt(d)))
  .filter((f, i, a) => a.indexOf(f) === i && f >= 0 && f <= DAYS_END)   // local to the hook's clock, on screen only
  .map((f, i) => ({ ...c(H + f, `tick-${i % 12}`, -15), keep: true }));   // user: "a little bit up" from −20

const hook: Cue[] = [
  ...counterTicks,
  { ...c(H + DAYS_END, "ui-tick", -14), keep: true },   // counter settles on 365
  c(H + FAIL_AT, "stamp", -11),                          // "فاشلة"
  c(H + FAIL_AT, "pop", -16),                            // mid-range body so the hit survives phone speakers
  c(H + FAIL_AT + 1, "glitch", -22, 12),                 // the bulb cracks
];

/* ── reveal: four judges drop into their seats, 365 → 0 ──────── */
const reveal: Cue[] = [
  ...[0, 1, 2, 3].map((i) => c(R + SEAT_AT(i) + 7, `pop-${i}`, -13)),
  c(R + 100, "ui-tick", -20),                            // the chip slides in
  c(R + ZERO_AT - 6, "swipe", -17),                      // red pen strikes "365 يوم"
  c(R + ZERO_AT, "impact", -15),                         // "ولا ساعة"
  c(R + ZERO_AT, "pop", -17),
];

/* ── the council: four cards arrive, then light up one by one ── */
const intro: Cue[] = [
  c(IN + 2, "ui-tick", -20),                             // "Claude Council" rises
  ...[0, 1, 2, 3].map((i) => c(IN + 4 + i * 5 + 3, `tick-${i * 3}`, -22)),
  ...[0, 1, 2, 3].map((i) => c(IN + INTRO_LIGHT_AT(i), `pop-${i}`, -12)),
];

/* ── the idea typed into Claude ─────────────────────────────── */
const typing: Cue[] = Array.from({ length: Math.ceil(IDEA.length / 2) }, (_, i) => c(CL + IDEA_TYPE_AT + i * 2, KEY, -22));

/* ── the four character cards ───────────────────────────────── */
const titles: Cue[] = TITLES.flatMap((t, n) => [
  c(t, "pop", -13),
  ...Array.from({ length: NAMES[n].length }, (_, i) => c(t + NAME_AT + i * NAME_STEP, KEY, -21)),
]);

/* ── #1 the believer: bars climb, then "هتنجح" ──────────────── */
const believer: Cue[] = [
  ...Array.from({ length: 7 }, (_, i) => c(B + 2 + i * 3 + 4, `tick-${i + 4}`, -23 + i)),   // each bar lands, a touch louder as they grow
  c(B + BELIEVER_WIN, "pop", -14),
  c(B + BELIEVER_WIN, "shimmer", -19, 14),
];

/* ── #2 the skeptic: the doc lands, three red strokes ───────── */
const skeptic: Cue[] = [
  c(SK + 3, "pop", -20),
  c(SK + SKEPTIC_MARKS[0], "swipe", -17),
  c(SK + SKEPTIC_MARKS[1], "swipe", -16),
  c(SK + SKEPTIC_MARKS[2], "swipe", -14),
  c(SK + SKEPTIC_MARKS[2] + 2, "impact", -17),
];

/* ── #3 the investor: coins stack one by one, then "فلوس" ───── */
const investor: Cue[] = [
  ...Array.from({ length: 14 }, (_, k) => c(IV + 2 + k * 3 + 3, "coin", -27, 8)),
  c(IV + INVESTOR_MONEY, "coin", -13),
  c(IV + INVESTOR_MONEY + 2, "shimmer", -21, 14),
];

/* ── #4 the judge: three verdicts slap down, then the gavel ─── */
const judge: Cue[] = [
  ...JUDGE_DOCS.map((d, i) => c(JU + d + 7, `pop-${i}`, -14)),
  c(JU + JUDGE_RULE + 2, "gavel", -12, 12),              // tail trimmed so it clears "ويقولك"
  c(JU + JUDGE_RULE + 2, "sub-boom", -22, 12),
];

/* ── CTA: the word typed, then it lands ─────────────────────── */
const ctaDone = CTA + CTA_TYPE_AT + (CTA_WORD.length - 1) * CTA_STEP + 3;
const cta: Cue[] = [
  ...CTA_WORD.split("").map((ch, i) => ({ ch, f: CTA + CTA_TYPE_AT + i * CTA_STEP })).filter((x) => x.ch !== " ").map((x) => c(x.f, KEY, -20)),
  c(ctaDone, "pop", -13),
];

const CUES = [...cuts, ...hook, ...reveal, ...intro, ...typing, ...titles, ...believer, ...skeptic, ...investor, ...judge, ...cta];

/* ── the bed: the user's own mix (CapCut, already set to −35) — played untouched, full length ── */
const MUSIC = "music-council-0927.wav";

// user (2026-09-27): "the rest of the sound effects… lower it by −10" — everything except the counter
const REST_TRIM = -10;

const CueAudio: React.FC<{ cue: Cue }> = ({ cue }) => {
  const v = dB(cue.db + (cue.keep ? 0 : REST_TRIM));
  const len = cue.len;
  return (
    <Audio
      src={staticFile(cue.src)}
      volume={len ? (f) => v * interpolate(f, [len - 4, len], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : v}
    />
  );
};

export const SoundLayerCouncilV4: React.FC = () => (
  <>
    {CUES.map((cue, i) => (
      <Sequence
        key={i}
        from={Math.max(0, Math.round(cue.at))}
        durationInFrames={cue.len ?? 45}
      >
        <CueAudio cue={cue} />
      </Sequence>
    ))}
    <Audio src={staticFile(MUSIC)} volume={1} />
  </>
);
