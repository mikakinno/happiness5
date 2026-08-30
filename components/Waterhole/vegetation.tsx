import { C } from "./palette";

export function FarHerd() {
  return (
    <g className="farmove" opacity="0.3" fill={C.hazeFar}>
      {[140, 172, 205, 240, 268, 300, 596, 628, 655].map((x, i) => (
        <g key={i} transform={`translate(${x} 214) scale(${0.32 + (i % 3) * 0.05})`}>
          <ellipse cx="0" cy="-8" rx="13" ry="7" /><rect x="-9" y="-4" width="3" height="8" /><rect x="5" y="-4" width="3" height="8" /><ellipse cx="13" cy="-13" rx="5" ry="4" />
        </g>
      ))}
    </g>
  );
}

export const SHRUBS: [number, number, number][] = [
  [138, 288, 1.0], [318, 268, 0.72], [598, 272, 0.8], [782, 290, 0.95],
  [232, 306, 1.1], [688, 300, 1.0], [64, 268, 0.8],
  [406, 254, 0.6], [512, 252, 0.62], [858, 262, 0.72],
  [178, 340, 1.2], [742, 336, 1.15], [292, 246, 0.55],
];
export const REEDS: [number, number, number, number][] = [
  [268, 322, 1.0, 0], [300, 330, 0.85, 1], [612, 326, 0.95, 0],
  [648, 318, 0.8, 1], [238, 312, 0.75, 0], [676, 334, 1.05, 1],
];

export function Acacia({ x, y, s, stage }: { x: number; y: number; s: number; stage: number }) {
  const leaf = stage >= 6 ? C.acaciaDeep : stage >= 5 ? C.acacia : "#A2B08E";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="swayt">
      <rect x="-2.5" y="-46" width="5" height="48" fill="#8B7355" />
      <path d="M0 -44 l-16 -12 M0 -44 l17 -14 M0 -50 l-9 -12" stroke="#8B7355" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="-62" rx="42" ry="13" fill={leaf} />
      <ellipse cx="-16" cy="-56" rx="24" ry="9" fill={leaf} opacity="0.9" />
      <ellipse cx="18" cy="-57" rx="26" ry="9" fill={leaf} opacity="0.85" />
    </g>
  );
}

export function Shrub({ x, y, s, stage }: { x: number; y: number; s: number; stage: number }) {
  const leaf = stage >= 5 ? C.acaciaDeep : C.acacia;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="swayt">
      <path d="M-1 0 v-9 M-1 -5 l-5 -4 M-1 -6 l5 -5" stroke="#8B7355" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="-14" rx="11" ry="8" fill={leaf} />
      <ellipse cx="-7" cy="-10" rx="7" ry="5.5" fill={leaf} opacity="0.9" />
      <ellipse cx="7" cy="-11" rx="7.5" ry="5.5" fill={leaf} opacity="0.85" />
      {stage >= 6 && <circle cx="5" cy="-18" r="1.8" fill="#E9E3C8" />}
    </g>
  );
}

export function Palm({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="swayt">
      <path d="M0 0 q -3 -30 2 -54" stroke="#9C7A57" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g stroke={C.acaciaDeep} strokeWidth="3.4" fill="none" strokeLinecap="round">
        <path d="M2 -54 q -16 -6 -26 4" /><path d="M2 -54 q 16 -8 27 2" />
        <path d="M2 -54 q -12 -16 -22 -18" /><path d="M2 -54 q 13 -15 24 -16" />
        <path d="M2 -54 q -2 -14 -6 -20" /><path d="M2 -54 q 4 -13 9 -18" />
      </g>
      <circle cx="-2" cy="-49" r="2" fill="#C08B4A" /><circle cx="4" cy="-48" r="2" fill="#C08B4A" />
    </g>
  );
}

export function Reed({ x, y, s, flip }: { x: number; y: number; s: number; flip: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} className="swayt">
      <g stroke={C.acaciaDeep} strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M0 0 q 2 -12 1 -22" /><path d="M0 0 q -4 -11 -7 -18" /><path d="M0 0 q 7 -10 11 -16" />
      </g>
      <ellipse cx="1" cy="-24" rx="1.8" ry="4" fill="#B79E7A" />
      <ellipse cx="-8" cy="-20" rx="1.6" ry="3.4" fill="#B79E7A" />
    </g>
  );
}
