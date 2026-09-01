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
  [286, 338, 0.9, 0], [336, 308, 0.7, 1], [590, 334, 0.85, 0],
  [624, 306, 0.75, 1], [258, 300, 0.65, 0], [660, 300, 0.9, 1],
];
/* 低木のクラスターと重ならない隙間に立たせる。丈も高くしてあるので、
   低木のすぐ隣だと影が重なって見づらい ── 少し離す */
export const ACACIAS: [number, number, number][] = [
  [101, 244, 0.85], [643, 238, 0.7], [460, 226, 0.62],
  [820, 230, 0.5], [205, 250, 0.56],
];
export const PALMS: [number, number, number][] = [
  [262, 250, 0.9], [644, 246, 0.78], [460, 238, 0.66],
];

export function Acacia({ x, y, s, stage }: { x: number; y: number; s: number; stage: number }) {
  // 低木・遠景の緑帯より濃く、はっきり分かる色にする（見上げる木、という描き方）
  const leaf = stage >= 4 ? C.acaciaDeep : "#748563";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="swayt">
      <rect x="-3.5" y="-120" width="7" height="122" fill="#8B7355" />
      <path d="M0 -108 l-24 -20 M0 -108 l25 -22 M0 -118 l-13 -20" stroke="#8B7355" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* 樹冠：円を複数重ねた、もこもこした丸い塊 */}
      <g fill={leaf}>
        <circle cx="0" cy="-140" r="34" />
        <circle cx="-28" cy="-128" r="26" opacity="0.94" />
        <circle cx="30" cy="-130" r="27" opacity="0.92" />
        <circle cx="-16" cy="-158" r="27" opacity="0.96" />
        <circle cx="18" cy="-156" r="25" opacity="0.94" />
        <circle cx="0" cy="-172" r="20" opacity="0.9" />
      </g>
    </g>
  );
}

export function Shrub({ x, y, s, stage }: { x: number; y: number; s: number; stage: number }) {
  const leaf = stage >= 4 ? C.acacia : stage >= 2 ? "#A2B08E" : "#C0B79F";
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
