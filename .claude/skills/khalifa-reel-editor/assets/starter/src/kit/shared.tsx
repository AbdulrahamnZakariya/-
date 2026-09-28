import React from "react";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

/** Fonts: Cairo for every Arabic word, Poppins for Latin headers. */
export const cairo = loadCairo("normal", { weights: ["700", "900"] }).fontFamily;
export const poppins = loadPoppins("normal", { weights: ["600", "800"] }).fontFamily;

/** Brand: red × black × white. Supers are white; "Claude" takes CLAUDE_TEXT. */
export const C = {
  red: "#E8191A",
  black: "#0D0D0D",
  white: "#FFFFFF",
  muted: "rgba(245,245,245,0.45)",
};
export const CLAUDE_TEXT = "#F4F3EE";

/** Split layout: stage panel 0…1120, face band 1120…1920. */
export const SEAM_Y = 1120;

/** Clips a stage to the top panel. The seam is square — never rounded. */
export const StageClip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: SEAM_Y, overflow: "hidden" }}>{children}</div>
);
