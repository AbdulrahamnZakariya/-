import React from "react";

/**
 * An original pixel creature in Claude orange, drawn on a grid in code — the
 * same idea as the reference's mascot, not a copy of its art. Four costumes,
 * one per judge. Everything is a list of [x, y, w, h, colour] cells.
 */

export const CLAUDE_ORANGE = "#D97757";
const O = CLAUDE_ORANGE;
const D = "#8F3F24";   // orange shadow
const K = "#15110F";   // eyes / outlines
const W = "#FFFFFF";
const G = "#F6C343";   // gold
const Gd = "#B8871C";  // gold shadow

type Cell = [number, number, number, number, string];

// base body — 16 wide × 13 tall, grid origin top-left
const BODY: Cell[] = [
  [2, 3, 12, 7, O],   // body
  [2, 3, 12, 1, "#E8957A"], // top highlight — gives the block some volume
  [2, 9, 12, 1, D],   // underside shade
  [0, 5, 2, 2, O],    // left arm
  [14, 5, 2, 2, O],   // right arm
  [3, 10, 1, 2, O], [5, 10, 1, 2, O], [10, 10, 1, 2, O], [12, 10, 1, 2, O], // legs
];
const EYES: Cell[] = [[5, 5, 1, 2, K], [10, 5, 1, 2, K]];

export type Costume = "none" | "believer" | "skeptic" | "investor" | "judge";

const COSTUME: Record<Costume, { cells: Cell[]; eyes?: Cell[] }> = {
  none: { cells: [] },
  // halo + wings
  believer: {
    cells: [
      [5, -1, 6, 1, G], [4, 0, 1, 1, G], [11, 0, 1, 1, G], [5, 1, 6, 1, Gd],
      // wings, grown out of the arms
      [-3, 2, 2, 1, W], [-5, 3, 5, 1, W], [-6, 4, 6, 2, W], [-5, 6, 4, 1, W], [-4, 7, 2, 1, W],
      [17, 2, 2, 1, W], [16, 3, 5, 1, W], [16, 4, 6, 2, W], [17, 6, 4, 1, W], [18, 7, 2, 1, W],
    ],
  },
  // question mark + magnifier, one eye narrowed
  skeptic: {
    cells: [
      [13, -3, 3, 1, K], [16, -2, 1, 2, K], [15, 0, 1, 1, K], [14, 1, 1, 1, K], [14, 3, 1, 1, K],
      [-3, 5, 4, 1, K], [-4, 6, 1, 3, K], [1, 6, 1, 3, K], [-3, 9, 4, 1, K], [-3, 6, 4, 3, "#BFE3F2"],
      [2, 10, 1, 1, K], [3, 11, 1, 1, K],
    ],
    eyes: [[4, 5, 3, 1, K], [10, 5, 1, 2, K]],
  },
  // shades + coin stack + up arrow
  investor: {
    cells: [
      [4, 5, 3, 2, K], [9, 5, 3, 2, K], [7, 5, 2, 1, K],
      [17, 7, 4, 1, G], [17, 8, 4, 1, Gd], [17, 9, 4, 1, G], [17, 10, 4, 1, Gd], [17, 11, 4, 1, G],
      // a proper rising arrow: shaft, then head
      [16, 5, 1, 1, "#37E28F"], [17, 4, 1, 1, "#37E28F"], [18, 3, 1, 1, "#37E28F"], [19, 2, 1, 1, "#37E28F"], [20, 1, 1, 1, "#37E28F"],
      [18, 0, 4, 1, "#37E28F"], [21, 1, 1, 3, "#37E28F"],
    ],
    eyes: [],
  },
  // curled wig + raised gavel
  judge: {
    cells: [
      [3, 0, 10, 3, W], [1, 2, 2, 5, W], [13, 2, 2, 5, W], [1, 7, 2, 1, "#DDDDDD"], [13, 7, 2, 1, "#DDDDDD"],
      [2, 1, 1, 1, "#DDDDDD"], [13, 1, 1, 1, "#DDDDDD"],
      [17, -2, 5, 3, "#8B5A2B"], [19, 1, 1, 5, "#6B4420"], [16, -2, 1, 3, "#6B4420"], [22, -2, 1, 3, "#6B4420"],
    ],
  },
};

/**
 * @param px   size of one grid cell in px
 * @param bob  0..1 vertical bounce phase (one-shot; the caller drives it)
 */
export const PixelBot: React.FC<{ costume?: Costume; px?: number; style?: React.CSSProperties }> = ({ costume = "none", px = 14, style }) => {
  const c = COSTUME[costume];
  const cells = [...BODY, ...c.cells, ...(c.eyes ?? EYES)];
  // bounds, so accessories that stick out never get clipped
  const minX = Math.min(...cells.map((q) => q[0]));
  const minY = Math.min(...cells.map((q) => q[1]));
  const maxX = Math.max(...cells.map((q) => q[0] + q[2]));
  const maxY = Math.max(...cells.map((q) => q[1] + q[3]));
  return (
    <svg
      width={(maxX - minX) * px}
      height={(maxY - minY) * px}
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      shapeRendering="crispEdges"
      style={{ display: "block", overflow: "visible", ...style }}
    >
      {cells.map(([x, y, w, h, col], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={col} />
      ))}
    </svg>
  );
};
