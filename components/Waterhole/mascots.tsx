import { C } from "./palette";

/* おまけの二匹。投稿については何も言わない。目の前の土地と水と空のことだけ。 */

export function Mame() {
  return (<g>
    <ellipse cx="0" cy="8" rx="16" ry="3.6" fill={C.sandDeep} opacity="0.3" />
    <path d="M-11 -7 q -7 -1 -8 -8" stroke={C.mame} strokeWidth="4" fill="none" strokeLinecap="round" className="wag" />
    <ellipse cx="0" cy="-4" rx="14" ry="10" fill={C.mame} />
    <circle cx="11" cy="-13" r="9.5" fill={C.mame} />
    <path d="M4.5 -19.5 q -4.5 -5.5 1 -7.5 q 3.5 1 3.5 6.5 Z" fill="#AA845C" />
    <path d="M17.5 -19.5 q 4.5 -5.5 -1 -7.5 q -3.5 1 -3.5 6.5 Z" fill="#AA845C" />
    <circle cx="8" cy="-14" r="1.4" fill={C.ink} /><circle cx="14.5" cy="-14" r="1.4" fill={C.ink} />
    <ellipse cx="11.3" cy="-9.8" rx="2" ry="1.5" fill="#6B4F36" />
    <path d="M-8 5 v5 M-2 6 v5 M5 5 v5" stroke={C.mame} strokeWidth="3.6" strokeLinecap="round" />
  </g>);
}

export function Kinako() {
  return (<g>
    <ellipse cx="0" cy="9" rx="15" ry="3.6" fill={C.sandDeep} opacity="0.3" />
    <path d="M12 4 q 11 0 8 -13" stroke={C.kinako} strokeWidth="4" fill="none" strokeLinecap="round" className="wag-cat" />
    <ellipse cx="0" cy="0" rx="13" ry="9" fill={C.kinako} />
    <circle cx="-10" cy="-10" r="9" fill={C.kinako} />
    <path d="M-17.5 -15.5 l1 -8 l6.5 4.5 Z" fill={C.kinako} /><path d="M-2.5 -15.5 l-1 -8 l-6.5 4.5 Z" fill={C.kinako} />
    <path d="M-14 -11 h2.6 M-9 -11 h2.6" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M-11 -7 q 1.4 1.4 2.8 0" stroke="#8C7355" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M-5 6 v5 M2 6 v5 M8 5 v5" stroke={C.kinako} strokeWidth="3.6" strokeLinecap="round" />
  </g>);
}
