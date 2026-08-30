/* ============================================================
   生き物のイラスト（すべて右向き・足元が原点）
   ============================================================ */
import type { ReactElement } from "react";

const EYE = "#3A342B";
const leg = (x: number, w: number, h: number, f: string) => (
  <rect key={x} x={x} y="-4" width={w} height={h} rx={w / 2} fill={f} />
);

type ShapeFn = () => ReactElement;

export const SHAPES: Record<string, ShapeFn> = {
  elephant: () => { const f = "#AEB3B8", d = "#98A0A6"; return (<g>
    <ellipse cx="0" cy="-21" rx="26" ry="18" fill={f} />
    <path d="M-24 -30 q -15 3 -13 18 q 3 11 13 6 Z" fill={d} />
    <ellipse cx="-27" cy="-24" rx="9" ry="11" fill={f} />
    <path d="M-32 -18 q -13 9 -10 24 q 2 7 7 5 q 3 -3 0 -9" stroke={f} strokeWidth="6.5" fill="none" strokeLinecap="round" />
    <path d="M-30 -12 q -7 3 -9 8" stroke="#F2EDE2" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <circle cx="-24" cy="-25" r="1.7" fill={EYE} />
    {[-18, -5, 9].map((x) => leg(x, 8, 15, f))}
    <path d="M25 -26 q 7 4 5 12" stroke={f} strokeWidth="3" fill="none" strokeLinecap="round" />
  </g>); },

  giraffe: () => { const f = "#E8C783", p = "#C4903F"; return (<g>
    <ellipse cx="-4" cy="-16" rx="17" ry="11" fill={f} />
    <path d="M8 -22 q 11 -22 13 -38" stroke={f} strokeWidth="8.5" fill="none" strokeLinecap="round" />
    <g fill={p} opacity=".75"><circle cx="-10" cy="-19" r="3.2" /><circle cx="-1" cy="-14" r="3" /><circle cx="-8" cy="-10" r="2.4" /><circle cx="6" cy="-19" r="2.4" /><circle cx="13" cy="-32" r="2.2" /><circle cx="17" cy="-44" r="2" /></g>
    <ellipse cx="24" cy="-61" rx="8" ry="5.5" fill={f} transform="rotate(-16 24 -61)" />
    <path d="M20 -67 v-5 M27 -68 v-5" stroke={f} strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="20" cy="-65" r="4" fill={f} /><circle cx="20" cy="-65" r="1.5" fill={EYE} />
    {[-14, -5, 5, 12].map((x) => leg(x, 4.5, 17, f))}
    <path d="M-20 -22 q -7 5 -6 12" stroke={p} strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </g>); },

  zebra: () => { const f = "#F4EFE6", s = "#4A443C"; return (<g>
    <ellipse cx="-2" cy="-15" rx="18" ry="10.5" fill={f} />
    <path d="M12 -20 q 9 -8 12 -16" stroke={f} strokeWidth="7" fill="none" strokeLinecap="round" />
    <ellipse cx="27" cy="-38" rx="7" ry="4.5" fill={f} transform="rotate(-32 27 -38)" />
    <path d="M25 -43 v-5" stroke={f} strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="25" cy="-38" r="1.4" fill={EYE} />
    <g stroke={s} strokeWidth="2.2" strokeLinecap="round"><path d="M-10 -22 v13" /><path d="M-3 -23 v15" /><path d="M4 -22 v13" /><path d="M17 -27 l4 -7" /><path d="M22 -32 l3 -5" /></g>
    {[-14, -5, 5, 11].map((x) => leg(x, 4.5, 16, f))}
    <path d="M-19 -20 q -8 6 -7 14" stroke={s} strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </g>); },

  wildebeest: () => { const f = "#948C7C"; return (<g>
    <ellipse cx="-2" cy="-15" rx="17" ry="10" fill={f} />
    <path d="M11 -19 q 10 -5 13 -12" stroke={f} strokeWidth="8" fill="none" strokeLinecap="round" />
    <ellipse cx="27" cy="-31" rx="8" ry="5" fill={f} transform="rotate(-18 27 -31)" />
    <path d="M22 -36 q -5 -7 2 -8 M31 -37 q 5 -6 -2 -8" stroke="#6F675A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <circle cx="25" cy="-32" r="1.4" fill={EYE} />
    <path d="M28 -26 q -2 6 -5 8" stroke="#6F675A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    {[-13, -4, 5, 11].map((x) => leg(x, 4.5, 16, f))}
  </g>); },

  impala: () => { const f = "#DBA35F"; return (<g>
    <ellipse cx="-1" cy="-12" rx="12" ry="7" fill={f} />
    <path d="M8 -15 q 7 -7 9 -13" stroke={f} strokeWidth="4.5" fill="none" strokeLinecap="round" />
    <ellipse cx="19" cy="-31" rx="5" ry="3.4" fill={f} transform="rotate(-26 19 -31)" />
    <path d="M17 -35 q 3 -11 -3 -13 M21 -36 q 4 -11 -2 -13" stroke="#A8763C" strokeWidth="1.7" fill="none" strokeLinecap="round" />
    <circle cx="18" cy="-32" r="1.2" fill={EYE} />
    {[-9, -2, 4, 9].map((x) => leg(x, 3, 13, f))}
    <path d="M-12 -16 q -5 4 -4 9" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" />
  </g>); },

  warthog: () => { const f = "#AC8F76"; return (<g>
    <ellipse cx="-2" cy="-9" rx="14" ry="8" fill={f} />
    <ellipse cx="12" cy="-12" rx="8" ry="6" fill={f} />
    <path d="M18 -14 q 5 -2 2 -5" stroke={f} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M17 -16 q 4 -5 0 -7" stroke="#F0E8DA" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <circle cx="12" cy="-14" r="1.3" fill={EYE} />
    <path d="M8 -18 q -1 -5 3 -5" stroke={f} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <path d="M-6 -17 q 3 -6 7 -5 M-1 -18 q 3 -6 6 -4" stroke="#6E5B48" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    {[-10, -2, 5].map((x) => leg(x, 3.4, 10, f))}
    <path d="M-15 -13 q -5 -6 -1 -8" stroke={f} strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </g>); },

  rhino: () => { const f = "#B4B7B2"; return (<g>
    <ellipse cx="-2" cy="-17" rx="23" ry="13.5" fill={f} />
    <ellipse cx="20" cy="-16" rx="13" ry="8.5" fill={f} />
    <path d="M31 -21 q 6 -12 8 -1 Z" fill="#E3E0D6" />
    <path d="M18 -24 q 2 -7 5 -1 Z" fill="#E3E0D6" />
    <path d="M14 -24 q 0 -6 4 -5" stroke={f} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <circle cx="17" cy="-19" r="1.4" fill={EYE} />
    {[-15, -4, 8].map((x) => leg(x, 6.5, 14, f))}
    <path d="M-23 -22 q -7 5 -6 11" stroke={f} strokeWidth="2.6" fill="none" strokeLinecap="round" />
  </g>); },

  hippo: () => { const f = "#C29CA7"; return (<g>
    <ellipse cx="0" cy="-6" rx="22" ry="9" fill={f} />
    <ellipse cx="17" cy="-9" rx="12" ry="7.5" fill={f} />
    <circle cx="24" cy="-13" r="2.2" fill={f} /><circle cx="28" cy="-12" r="2" fill={f} />
    <circle cx="12" cy="-14" r="3.4" fill={f} /><circle cx="12" cy="-14" r="1.3" fill={EYE} />
    <circle cx="4" cy="-13" r="2.6" fill={f} />
    <path d="M-16 -8 q -6 -3 -8 1" stroke={f} strokeWidth="3" fill="none" strokeLinecap="round" />
  </g>); },

  croc: () => { const f = "#93AB7C", d = "#7A9066"; return (<g>
    <ellipse cx="0" cy="-4" rx="26" ry="6" fill={f} />
    <path d="M14 -6 q 18 -1 22 3 q -6 4 -22 2 Z" fill={f} />
    <circle cx="10" cy="-9" r="3" fill={f} /><circle cx="10" cy="-9.5" r="1.3" fill={EYE} />
    <g fill={d}><path d="M-16 -8 l4 -5 l4 5 Z" /><path d="M-6 -9 l4 -5 l4 5 Z" /><path d="M4 -8 l4 -4 l4 4 Z" /></g>
    <path d="M-24 -5 q -12 1 -16 5" stroke={f} strokeWidth="5" fill="none" strokeLinecap="round" />
  </g>); },

  baboon: () => { const f = "#A88A6A", d = "#7E6A54"; return (<g>
    <ellipse cx="-2" cy="-13" rx="12" ry="9" fill={f} />
    <circle cx="10" cy="-21" r="8" fill={f} />
    <ellipse cx="16" cy="-20" rx="5" ry="4" fill={d} />
    <circle cx="9" cy="-23" r="1.4" fill={EYE} /><circle cx="14" cy="-24" r="1.2" fill={EYE} />
    <path d="M3 -27 q 3 -4 7 -3" stroke={d} strokeWidth="2" fill="none" strokeLinecap="round" />
    {[-9, -1, 6].map((x) => leg(x, 3.4, 11, f))}
    <path d="M-13 -18 q -9 -3 -8 -11 q 1 -4 5 -3" stroke={f} strokeWidth="3" fill="none" strokeLinecap="round" />
  </g>); },

  meerkat: () => { const f = "#DCC298", d = "#B49B72"; return (<g>
    <ellipse cx="0" cy="-11" rx="6" ry="11" fill={f} />
    <circle cx="1" cy="-24" r="6" fill={f} />
    <ellipse cx="5" cy="-25" rx="3" ry="2.4" fill={d} />
    <circle cx="-1" cy="-25" r="1.4" fill={EYE} /><circle cx="4" cy="-26" r="1.2" fill={EYE} />
    <circle cx="-3" cy="-29" r="2" fill={d} /><circle cx="6" cy="-30" r="2" fill={d} />
    <path d="M-5 -14 q -3 3 -2 6" stroke={f} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <path d="M-5 -4 q -8 4 -9 -6" stroke={f} strokeWidth="3" fill="none" strokeLinecap="round" />
    {[-3, 2].map((x) => leg(x, 3, 5, f))}
  </g>); },

  jackal: () => { const f = "#CB9E72", d = "#8E7050"; return (<g>
    <ellipse cx="-2" cy="-12" rx="14" ry="7" fill={f} />
    <circle cx="11" cy="-18" r="6.5" fill={f} />
    <path d="M16 -20 q 6 1 7 3 q -5 2 -8 0 Z" fill={f} />
    <path d="M7 -23 l0 -7 l5 4 Z" fill={d} /><path d="M14 -24 l2 -7 l4 5 Z" fill={d} />
    <circle cx="10" cy="-19" r="1.3" fill={EYE} />
    <path d="M-14 -14 q -9 -1 -10 -8" stroke={f} strokeWidth="3.4" fill="none" strokeLinecap="round" />
    {[-11, -4, 3, 8].map((x) => leg(x, 3, 12, f))}
  </g>); },

  leopard: () => { const f = "#E9C878", s = "#5B4B33"; return (<g>
    <ellipse cx="-2" cy="-13" rx="17" ry="8" fill={f} />
    <circle cx="13" cy="-19" r="7" fill={f} />
    <path d="M9 -24 l-1 -5 l5 3 Z" fill={f} /><path d="M17 -25 l2 -5 l3 4 Z" fill={f} />
    <circle cx="12" cy="-20" r="1.4" fill={EYE} /><circle cx="17" cy="-20" r="1.2" fill={EYE} />
    <g fill={s} opacity=".6"><circle cx="-8" cy="-16" r="1.7" /><circle cx="-1" cy="-12" r="1.7" /><circle cx="-9" cy="-9" r="1.4" /><circle cx="4" cy="-17" r="1.5" /><circle cx="3" cy="-10" r="1.4" /></g>
    <path d="M-17 -16 q -12 -2 -11 -11" stroke={f} strokeWidth="3.4" fill="none" strokeLinecap="round" />
    {[-13, -5, 3, 9].map((x) => leg(x, 3.6, 13, f))}
  </g>); },

  lion: () => { const f = "#E0B978", m = "#B98842"; return (<g>
    <ellipse cx="-4" cy="-14" rx="18" ry="8.5" fill={f} />
    <circle cx="13" cy="-21" r="10.5" fill={m} />
    <circle cx="14" cy="-21" r="6.5" fill={f} />
    <circle cx="12" cy="-22" r="1.4" fill={EYE} /><circle cx="17" cy="-22" r="1.3" fill={EYE} />
    <path d="M13 -18 q 2 2 4 0" stroke="#8E6A34" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <path d="M-20 -17 q -12 -2 -10 -11" stroke={f} strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="-31" cy="-29" r="3.4" fill={m} />
    {[-15, -7, 2, 8].map((x) => leg(x, 4, 14, f))}
  </g>); },

  ostrich: () => { const f = "#5F564C", n = "#E2C3A2"; return (<g>
    <ellipse cx="-2" cy="-26" rx="15" ry="12" fill={f} />
    <path d="M8 -33 q 8 -14 6 -24" stroke={n} strokeWidth="4.5" fill="none" strokeLinecap="round" />
    <ellipse cx="15" cy="-60" rx="5" ry="4" fill={n} />
    <path d="M19 -60 l6 1" stroke="#D9A44E" strokeWidth="2" strokeLinecap="round" />
    <circle cx="15" cy="-61" r="1.3" fill={EYE} />
    <path d="M-16 -30 q -8 -3 -10 3" stroke="#F0EBE2" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M-6 -14 v13 M2 -14 v13" stroke={n} strokeWidth="2.6" strokeLinecap="round" />
  </g>); },

  heron: () => { const f = "#FBFAF6", n = "#D9A44E"; return (<g>
    <ellipse cx="-1" cy="-20" rx="10" ry="7" fill={f} stroke="#DFD9CC" strokeWidth="0.7" />
    <path d="M5 -25 q 6 -12 8 -18" stroke={f} strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <circle cx="14" cy="-46" r="3.8" fill={f} />
    <path d="M17 -46 l9 3" stroke={n} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M11 -50 q -4 -2 -6 -1" stroke={f} strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="14" cy="-47" r="1.1" fill={EYE} />
    <path d="M-11 -22 q -8 2 -10 5" stroke={f} strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <path d="M-3 -14 v13 M3 -14 v13" stroke={n} strokeWidth="1.6" strokeLinecap="round" />
  </g>); },

  flamingo: () => { const f = "#F3A9BB", d = "#E2778F"; return (<g>
    <ellipse cx="-2" cy="-26" rx="11" ry="8" fill={f} />
    <path d="M4 -32 q 10 -8 6 -16 q -3 -6 -9 -4" stroke={f} strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <circle cx="0" cy="-52" r="4" fill={f} />
    <path d="M-3 -50 q -6 2 -6 5 q 4 1 7 -2 Z" fill="#3A342B" />
    <circle cx="1" cy="-53" r="1.1" fill={EYE} />
    <path d="M-11 -28 q -8 1 -10 4" stroke={d} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M-1 -19 q 3 8 0 19" stroke={f} strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </g>); },

  guinea: () => { const f = "#7F8B95"; return (<g>
    <ellipse cx="-1" cy="-9" rx="10" ry="8" fill={f} />
    <circle cx="8" cy="-18" r="4" fill={f} />
    <path d="M11 -18 l5 1" stroke="#D9A44E" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M8 -23 q 1 -4 3 -3" stroke="#C97C5C" strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="8" cy="-19" r="1.1" fill={EYE} />
    <g fill="#F2F0EA" opacity=".65"><circle cx="-4" cy="-11" r="1.2" /><circle cx="1" cy="-7" r="1.2" /><circle cx="-2" cy="-15" r="1.1" /><circle cx="-8" cy="-7" r="1.1" /><circle cx="4" cy="-12" r="1.1" /></g>
    <path d="M-4 -1 v5 M2 -1 v5" stroke="#D9A44E" strokeWidth="1.6" strokeLinecap="round" />
  </g>); },

  weaver: () => { const f = "#F2CE55"; return (<g>
    <ellipse cx="0" cy="-7" rx="6.5" ry="5.5" fill={f} />
    <circle cx="5" cy="-13" r="3.4" fill={f} />
    <path d="M8 -13 l4 1" stroke="#4A443C" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="5" cy="-14" r="1" fill={EYE} />
    <path d="M-6 -8 q -6 2 -7 4" stroke="#D9AE33" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <path d="M-2 -2 v4 M2 -2 v4" stroke="#D9AE33" strokeWidth="1.2" strokeLinecap="round" />
  </g>); },

  frog: () => { const f = "#93C87E"; return (<g>
    <ellipse cx="0" cy="-6" rx="8" ry="6" fill={f} />
    <circle cx="-3" cy="-12" r="2.6" fill={f} /><circle cx="3" cy="-12" r="2.6" fill={f} />
    <circle cx="-3" cy="-12.5" r="1.1" fill={EYE} /><circle cx="3" cy="-12.5" r="1.1" fill={EYE} />
    <path d="M-2 -4 q 2 1.5 4 0" stroke="#5E9349" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M-7 -2 q -4 3 -1 4 M7 -2 q 4 3 1 4" stroke={f} strokeWidth="2.6" fill="none" strokeLinecap="round" />
  </g>); },

  tortoise: () => { const f = "#B0A874", s = "#8A8253"; return (<g>
    <path d="M-13 -5 q 0 -12 13 -12 q 13 0 13 12 Z" fill={f} />
    <g stroke={s} strokeWidth="1.2" fill="none"><path d="M-5 -16 v11" /><path d="M5 -16 v11" /><path d="M-12 -9 h25" /></g>
    <circle cx="17" cy="-8" r="4" fill="#C5BD8E" />
    <circle cx="19" cy="-9" r="1.1" fill={EYE} />
    <path d="M-9 -4 v4 M6 -4 v4" stroke="#C5BD8E" strokeWidth="3.4" strokeLinecap="round" />
  </g>); },
};

export type BeastSlot = {
  key: string;
  kind: string;
  anim: string;
  depth: number;
  x: number;
  y: number;
  scale: number;
  delay: number;
};

export function Beast({ kind, x, y, scale, depth, anim, delay }: Omit<BeastSlot, "key">) {
  const S = SHAPES[kind];
  if (!S) return null;
  const op = 0.5 + depth * 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={op}>
      <ellipse cx="0" cy="2" rx="16" ry="3.4" fill="#8A7657" opacity="0.16" />
      <g className={`a-${anim}`} style={{ animationDelay: `${delay}s` }}>{S()}</g>
    </g>
  );
}
