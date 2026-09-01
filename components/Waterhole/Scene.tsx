import { useMemo } from "react";
import { GREEN_STAGE_VEG, ymdJst, type PresentFauna, type TimeBand } from "../../lib/waterhole";
import { C } from "./palette";
import { Beast, type BeastSlot } from "./species";
import { Acacia, ACACIAS, FarHerd, PALMS, Palm, REEDS, Reed, Shrub, SHRUBS, Tuft } from "./vegetation";
import { Mame, Kinako } from "./mascots";

const MAX_DRAWN = 18;
const X_MIN = 42;
const X_SPAN = 816; // 陸の生き物が使える横幅（42〜858）

/* 見た目の配置だけに使う、日付シードの疑似乱数。
   「頭数」を決める本物の乱数はサーバー側（lib/waterhole.ts の resolveFauna）
   が持つ。ここでは同じ日なら誰が見ても同じ配置になる、という一貫性だけを担う。 */
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const dateSeed = (d: Date) => Number(ymdJst(d).replace(/-/g, ""));

export type SceneProps = {
  level: number;
  stage: number;
  present: PresentFauna[];
  timeOfDay: TimeBand;
  ripples: number[];
  onSplash: () => void;
};

export function Waterhole({ level, stage, present, timeOfDay, ripples, onSplash }: SceneProps) {
  const rnd = useMemo(() => seeded(dateSeed(new Date()) + 991), []);
  const veg = GREEN_STAGE_VEG[stage];
  const sky = {
    dawn: ["#FFF3EC", "#FFFFFF"],
    day: ["#EBF5F8", "#FFFFFF"],
    dusk: ["#FFEDE0", "#FFFFFF"],
    night: ["#EDEFF7", "#FFFFFF"],
  }[timeOfDay];
  const ws = 0.55 + level * 0.45;

  /* 描画スロット：まず各種1体ずつ、残りを頭数の多い種で埋める */
  const slots = useMemo<BeastSlot[]>(() => {
    const r = seeded(dateSeed(new Date()) + 77);
    const picks: PresentFauna[] = [];
    present.forEach((f) => picks.push(f));
    const extra: PresentFauna[] = [];
    present.forEach((f) => { for (let i = 1; i < f.head; i++) extra.push(f); });
    for (let i = extra.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [extra[i], extra[j]] = [extra[j], extra[i]];
    }
    picks.push(...extra.slice(0, Math.max(0, MAX_DRAWN - picks.length)));

    /* x座標：頭数が少ない日でも中央に固まらないよう、陸の生き物の数ぶんに
       画面幅を区切り、1頭ずつ別の区画へ割り当ててから区画内だけで揺らす。
       区画の割り当て順もシャッフルするので、同じ種がいつも同じ側に出るわけではない。 */
    const landTotal = picks.filter((f) => f.id !== "croc" && f.id !== "hippo").length;
    const binWidth = X_SPAN / Math.max(1, landTotal);
    const binOrder = Array.from({ length: landTotal }, (_, i) => i);
    for (let i = binOrder.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [binOrder[i], binOrder[j]] = [binOrder[j], binOrder[i]];
    }
    let landCursor = 0;

    return picks
      .map((f, i) => {
        const depth = r();
        const water = f.id === "croc" || f.id === "hippo";
        const x = water
          ? 380 + r() * 150
          : X_MIN + (binOrder[landCursor++] + r()) * binWidth;
        return {
          key: `${f.id}-${i}`,
          kind: f.id,
          anim: f.anim,
          depth,
          x,
          y: water ? 316 + r() * 10 : 236 + depth * 132,
          scale: (water ? 0.85 : 0.5 + depth * 0.72) * (f.id === "weaver" || f.id === "frog" ? 0.8 : 1),
          delay: (i % 6) * 0.45,
        };
      })
      .sort((a, b) => a.depth - b.depth);
  }, [present]);

  return (
    <svg viewBox="0 0 900 400" className="w-full block" role="img" aria-label="みんなの水場">
      <title>みんなの水場</title>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sky[0]} /><stop offset="100%" stopColor={sky[1]} /></linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.sand} /><stop offset="100%" stopColor={C.sandDeep} /></linearGradient>
        <radialGradient id="pool" cx="50%" cy="35%"><stop offset="0%" stopColor="#EEF8FA" /><stop offset="55%" stopColor={C.waterPale} /><stop offset="100%" stopColor={C.water} /></radialGradient>
        <clipPath id="poolClip"><ellipse cx="450" cy="318" rx={190 * ws} ry={46 * ws} /></clipPath>
      </defs>

      <rect x="0" y="0" width="900" height="230" fill="url(#sky)" />
      {timeOfDay === "night"
        ? <g opacity="0.7"><circle cx="742" cy="52" r="17" fill="#F2EEDF" /><circle cx="734" cy="47" r="15" fill={sky[0]} /></g>
        : <circle cx="742" cy="52" r={timeOfDay === "day" ? 22 : 27} fill={timeOfDay === "dusk" ? "#F6C193" : "#FAE0A4"} opacity="0.85" />}

      <path d="M0 214 Q 220 200 470 212 T 900 204 L900 232 L0 232 Z" fill={C.hazeFar} opacity="0.55" />
      {/* 遠景の緑の帯：奥は淡く。低木・アカシアと同じ緑にしないことで
          手前ほど濃い、という奥行きを保つ */}
      <path d="M0 216 Q 240 204 480 214 T 900 208 L900 230 L0 230 Z" fill={C.acaciaPale} opacity={veg.farBand} />
      <FarHerd />
      <path d="M0 222 Q 450 208 900 222 L900 400 L0 400 Z" fill="url(#ground)" />

      {/* 草：根元から3〜5本が扇状に広がる「株」として描く。
          veg.grass は本数ではなく株の数（段階が上がるほど株が増え、色も濃くなる）。
          陸地にランダムに散らす分と、池のふちに帯状に集める分の二本立て。
          水面の上には生やさないが、除外になった株は陸の別の場所に振り直す
          （水辺の帯は別枠なので、除外分を捨てずに済む）。 */}
      <g stroke={stage >= 3 ? C.acaciaDeep : stage >= 1 ? C.acacia : C.mud}
        strokeWidth="2.2" strokeLinecap="round" fill="none" opacity={stage >= 1 ? 0.85 : 0.45}>
        {Array.from({ length: veg.grass }).map((_, i) => {
          let x = 0, y = 0;
          for (let tries = 0; tries < 6; tries++) {
            x = 14 + ((rnd() * 880 + i * 47) % 878);
            y = 240 + rnd() * 146;
            if (!(Math.abs(x - 450) < 208 * ws && y > 284)) break;
          }
          return <Tuft key={i} x={x} y={y} stage={stage} rnd={rnd} />;
        })}
        {/* 水辺の帯：池の外周のすぐ外側に、角度を振って並べる。段階が上がるほど密になる */}
        {Array.from({ length: Math.round(veg.grass * 0.6) }).map((_, i) => {
          const angle = rnd() * Math.PI * 2;
          const spread = 1.03 + rnd() * 0.15; // 池の縁から3〜18%外側
          const x = 450 + 190 * ws * spread * Math.cos(angle);
          const y = 318 + 46 * ws * spread * Math.sin(angle);
          return <Tuft key={`w${i}`} x={x} y={y} stage={stage} rnd={rnd} />;
        })}
      </g>

      {/* 低木 */}
      {SHRUBS.slice(0, veg.shrub).map((p, i) => (
        <Shrub key={i} x={p[0]} y={p[1]} s={p[2]} stage={stage} />
      ))}

      {/* 水際の葦 */}
      {REEDS.slice(0, veg.reed).map((p, i) => <Reed key={i} x={p[0]} y={p[1]} s={p[2]} flip={p[3]} />)}

      {/* ナツメヤシ */}
      {PALMS.slice(0, veg.palm).map((p, i) => <Palm key={i} x={p[0]} y={p[1]} s={p[2]} />)}

      {/* アカシア */}
      {ACACIAS.slice(0, veg.acacia).map((p, i) => (
        <Acacia key={i} x={p[0]} y={p[1]} s={p[2]} stage={stage} />
      ))}

      <ellipse cx="450" cy="318" rx="212" ry="53" fill={C.mud} opacity="0.3" />
      <ellipse cx="450" cy="318" rx={198 * (0.6 + ws * 0.4)} ry={49 * (0.6 + ws * 0.4)} fill={C.mud} opacity="0.34" />

      <g onClick={onSplash} style={{ cursor: "pointer" }}>
        <ellipse cx="450" cy="318" rx={190 * ws} ry={46 * ws} fill="url(#pool)" />
        <g clipPath="url(#poolClip)">
          <ellipse cx="450" cy="318" rx="30" ry="8" fill="none" stroke="#FFF" strokeWidth="1.5" opacity="0.75" className="amb1" />
          <ellipse cx="450" cy="318" rx="30" ry="8" fill="none" stroke="#FFF" strokeWidth="1.3" opacity="0.6" className="amb2" />
          {ripples.map((r) => <ellipse key={r} cx="450" cy="318" rx="8" ry="2" fill="none" stroke="#FFF" strokeWidth="2.6" className="splash" />)}
        </g>
        {ripples.map((r) => <circle key={`d${r}`} cx="450" cy="150" r="6" fill={C.water} className="drop" />)}
      </g>

      {slots.map(({ key, ...rest }) => <Beast key={key} {...rest} />)}

      <g transform="translate(78 378) scale(.78)"><Mame /></g>
      <g transform="translate(830 372) scale(.78)"><Kinako /></g>

      <style>{`
        /* SVGのtransform-originは既定でviewBox基準になるため、
           回転する要素にはすべて transform-box:fill-box を指定して
           その図形自身の付け根で回るようにする */
        .a-sip,.a-peck,.a-sway,.swayt,.wag,.wag-cat{transform-box:fill-box}

        .amb1{animation:amb 9s ease-out infinite}.amb2{animation:amb 9s ease-out infinite 4.5s}
        @keyframes amb{0%{rx:6;ry:2;opacity:.8}100%{rx:${186 * ws};ry:${44 * ws};opacity:0}}
        .splash{animation:splash 2.4s ease-out forwards}
        @keyframes splash{0%{rx:5;ry:2;opacity:1;stroke-width:3}100%{rx:${188 * ws};ry:${45 * ws};opacity:0;stroke-width:.4}}
        .drop{animation:drop .7s cubic-bezier(.5,0,.9,.4) forwards}
        @keyframes drop{0%{cy:130;opacity:0}25%{opacity:1}100%{cy:314;opacity:0;r:11}}

        .a-bob{animation:a-bob 7s ease-in-out infinite}
        @keyframes a-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
        .a-sip{animation:a-sip 15s ease-in-out infinite;transform-origin:20% 100%}
        @keyframes a-sip{0%,58%,100%{transform:rotate(0)}72%,88%{transform:rotate(8deg)}}
        .a-sway{animation:a-sway 12s ease-in-out infinite;transform-origin:50% 100%}
        @keyframes a-sway{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}
        .a-peck{animation:a-peck 5.5s ease-in-out infinite;transform-origin:30% 100%}
        @keyframes a-peck{0%,68%,100%{transform:rotate(0)}80%{transform:rotate(15deg)}}
        .a-hop{animation:a-hop 6.5s ease-in-out infinite}
        @keyframes a-hop{0%,78%,100%{transform:translateY(0)}86%{transform:translateY(-7px)}93%{transform:translateY(0)}}
        .a-creep{animation:a-creep 80s linear infinite}
        @keyframes a-creep{from{transform:translateX(-24px)}to{transform:translateX(24px)}}
        .a-still{animation:a-still 14s ease-in-out infinite}
        @keyframes a-still{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.2px)}}

        .swayt{animation:a-sway 17s ease-in-out infinite;transform-origin:50% 100%}
        .wag{animation:wag 2.4s ease-in-out infinite;transform-origin:100% 100%}
        @keyframes wag{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}
        .wag-cat{animation:wag-cat 9s ease-in-out infinite;transform-origin:0% 100%}
        @keyframes wag-cat{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
        .farmove{animation:farmove 150s linear infinite}
        @keyframes farmove{from{transform:translateX(-30px)}to{transform:translateX(30px)}}
        @media (prefers-reduced-motion:reduce){
          .amb1,.amb2,.splash,.drop,.a-bob,.a-sip,.a-sway,.a-peck,.a-hop,.a-creep,.a-still,.swayt,.wag,.wag-cat,.farmove{animation:none!important}
        }
      `}</style>
    </svg>
  );
}
