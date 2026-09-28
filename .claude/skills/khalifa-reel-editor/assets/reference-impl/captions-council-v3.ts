/**
 * CLAUDE COUNCIL V3 — rebuilt in the style of the reference edit.
 *
 * Captions use a tiny markup so the style lives in the data:
 *   *text*   → Amiri (naskh serif) — the reference's serif accent
 *   +text+   → green (positive)
 *   -text-   → red (negative)
 * "Claude" always takes #F4F3EE. Every cue fits ONE line.
 */
export interface Cue { start: number; end: number; text: string }

export const cuesV3: Cue[] = [
  { start: 0.0, end: 1.1, text: "*تخيل* تقعد تشتغل" },
  { start: 1.1, end: 2.6, text: "على فكرة مشروع *لمدة سنة*" },
  { start: 2.6, end: 3.6, text: "وفي الآخر تكتشف" },
  { start: 3.6, end: 4.66, text: "إنها فكرة -فاشلة-" },

  { start: 4.66, end: 6.0, text: "بس فيه طريقة على Claude" },
  { start: 6.0, end: 7.7, text: "تعمل بيها لجنة +Shark Tank+" },
  { start: 7.7, end: 9.46, text: "من غير ما تقضي *ولا ساعة*" },

  { start: 9.46, end: 10.5, text: "ودي مهارة *اسمها*" },
  { start: 10.5, end: 11.6, text: "Claude Council" },
  { start: 11.6, end: 12.8, text: "فيها +أربع حكام+" },
  { start: 12.8, end: 14.1, text: "بتديهم *الفكرة بتاعتك*" },
  { start: 14.1, end: 15.28, text: "وكل واحد *ليه دور*" },

  { start: 15.28, end: 16.0, text: "أول حكم" },
  { start: 16.0, end: 17.4, text: "وهو اللي *معاك* في فكرتك" },
  { start: 17.4, end: 18.6, text: "بيثبتلك إنها +هتنجح+" },
  { start: 18.6, end: 19.52, text: "*وهتنجح ليه*" },

  { start: 19.52, end: 20.3, text: "تاني واحد" },
  { start: 20.3, end: 21.4, text: "وهو اللي -بيشكك-" },
  { start: 21.4, end: 22.4, text: "ومهمته *يثبتلك*" },
  { start: 22.4, end: 23.4, text: "إن فكرتك -هتفشل-" },
  { start: 23.4, end: 24.36, text: "*وهتفشل ليه*" },

  { start: 24.36, end: 25.9, text: "تالت واحد وهو المستثمر" },
  { start: 25.9, end: 27.4, text: "وده ما يهموش *فكرة مشروعك*" },
  { start: 27.4, end: 28.56, text: "عايز يعرف حاجة واحدة بس" },
  { start: 28.56, end: 30.02, text: "ده هيعمل +فلوس+ ولا لأ" },

  { start: 30.02, end: 31.5, text: "رابع واحد وهو الفيصل" },
  { start: 31.5, end: 32.3, text: "ومهمته *يشوف*" },
  { start: 32.3, end: 33.6, text: "قراءة +التلات حكام+" },
  { start: 33.6, end: 35.7, text: "ويقولك الفكرة +هتنجح+ ولا -تفشل-" },
];

const F = (s: number) => Math.round(s * 30);

/**
 * Edit decision list. Like the reference, it cuts on the sentence and rotates
 * between three layouts, so no single frame holds for more than ~3 seconds:
 *
 *   split  — stage graphic on top, face band below, supers on the seam
 *   face   — full-frame A-roll (scale 1 or a punched-in 1.22), supers at chest
 *   full   — a graphic takes the whole frame; supers at chest
 *   title  — white character card; no supers (the name IS the text)
 *
 * `g` names the graphic; `anchor` is the second its own clock starts from,
 * so a graphic can be split across shots and stay continuous.
 */
export type Layout = "split" | "face" | "full" | "title";
export type Graphic = "hook" | "reveal" | "intro" | "claude" | "believer" | "skeptic" | "investor" | "judge" | "t1" | "t2" | "t3" | "t4" | "cta";
export interface Shot { a: number; b: number; layout: Layout; g?: Graphic; anchor?: number; scale?: number }

export const EDL: Shot[] = [
  { a: 0.0, b: 1.5, layout: "face", scale: 1 },                // user: the first 1.5s are the A-roll…
  { a: 1.5, b: 3.6, layout: "split", g: "hook", anchor: 1.5 },  // …then the panel drops in and pushes the face into the band
  { a: 3.6, b: 4.66, layout: "full", g: "hook", anchor: 1.5 },
  { a: 4.66, b: 6.0, layout: "face", scale: 1 },
  { a: 6.0, b: 9.46, layout: "split", g: "reveal", anchor: 4.66 },
  { a: 9.46, b: 12.8, layout: "split", g: "intro", anchor: 9.46 },
  { a: 12.8, b: 14.1, layout: "full", g: "claude", anchor: 12.8 },
  { a: 14.1, b: 15.28, layout: "face", scale: 1.22 },
  { a: 15.28, b: 16.6, layout: "title", g: "t1", anchor: 15.28 },
  { a: 16.6, b: 19.52, layout: "split", g: "believer", anchor: 16.6 },
  { a: 19.52, b: 20.6, layout: "title", g: "t2", anchor: 19.52 },
  { a: 20.6, b: 21.4, layout: "face", scale: 1 },
  { a: 21.4, b: 24.36, layout: "split", g: "skeptic", anchor: 21.4 },
  { a: 24.36, b: 25.6, layout: "title", g: "t3", anchor: 24.36 },
  { a: 25.6, b: 27.4, layout: "face", scale: 1.22 },
  { a: 27.4, b: 30.02, layout: "split", g: "investor", anchor: 27.4 },
  { a: 30.02, b: 31.3, layout: "title", g: "t4", anchor: 30.02 },
  { a: 31.3, b: 32.3, layout: "face", scale: 1 },
  { a: 32.3, b: 35.7, layout: "split", g: "judge", anchor: 32.3 },
  { a: 35.7, b: 39.7333, layout: "face", g: "cta", anchor: 35.7, scale: 1 },
].map((s) => s as Shot);

export const shotAt = (sec: number) => {
  const f = Math.round(sec * 30);
  return EDL.find((s) => f >= F(s.a) && f < F(s.b)) ?? EDL[EDL.length - 1];
};
export const F30 = F;
export const DURATION_V3 = 1192;
