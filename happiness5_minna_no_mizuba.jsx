import React, { useState, useMemo, useEffect, useRef } from "react";

/* ============================================================
   ハピネス5 「みんなの水場」
   ------------------------------------------------------------
   場はひとつ。個人の水場もストリークもバッジも持たない。
   人間にできるのは水を足すことだけ。何が降りてくるかは決められない。
   ============================================================ */

const C = {
  paper: "#FFFFFF", mist: "#F7F4EE", line: "#E7E0D4",
  ink: "#3A342B", inkSoft: "#8A8073",
  water: "#5FA9BC", waterPale: "#CFE7EC",
  sand: "#EDDFC7", sandDeep: "#D3BF9C", mud: "#BCA381",
  acacia: "#8C9E77", acaciaDeep: "#5F7355", hazeFar: "#DAD3C5",
  mame: "#C89F72", kinako: "#E8CFA9",
};

const WEATHER = {
  "☀️ 晴れ": { color: "#EFB03C", short: "晴れ" },
  "☁️ 曇り": { color: "#AAB2AC", short: "曇り" },
  "☂ 雨": { color: "#71A2CC", short: "雨" },
  "⚡ 疲れ気味": { color: "#E0906A", short: "疲れ気味" },
};

/* ------------------------------------------------------------
   水場に降りてくる生き物（21種）

   need  : 今週きた人の割合がこれを超えると現れる
   shy   : 心のお天気が3種類以上ないと降りてこない
           ＝ ☂ や ⚡ を出せる場所にしか来ない
   water : 水位がこれを超えないと来られない
   rain  : その週に ☂ が出ていないと来ない
   time  : この時間帯にしか降りてこない
   ------------------------------------------------------------ */
const FAUNA = [
  { id: "weaver",     name: "ハタオリドリ",   need: 0.00, max: 8, anim: "peck" },
  { id: "guinea",     name: "ホロホロチョウ", need: 0.00, max: 6, anim: "peck" },
  { id: "impala",     name: "インパラ",       need: 0.15, max: 5, anim: "bob" },
  { id: "warthog",    name: "イボイノシシ",   need: 0.22, max: 3, anim: "sip" },
  { id: "meerkat",    name: "ミーアキャット", need: 0.25, max: 4, anim: "bob", time: ["dawn", "day"] },
  { id: "tortoise",   name: "リクガメ",       need: 0.28, max: 2, anim: "creep" },
  { id: "zebra",      name: "シマウマ",       need: 0.32, max: 4, anim: "sip" },
  { id: "baboon",     name: "ヒヒ",           need: 0.35, max: 4, anim: "bob" },
  { id: "frog",       name: "アマガエル",     need: 0.30, max: 4, anim: "hop", rain: true },
  { id: "wildebeest", name: "ヌー",           need: 0.40, max: 4, anim: "sip" },
  { id: "heron",      name: "サギ",           need: 0.40, max: 2, anim: "bob", shy: true },
  { id: "jackal",     name: "ジャッカル",     need: 0.40, max: 2, anim: "bob", time: ["night"] },
  { id: "ostrich",    name: "ダチョウ",       need: 0.45, max: 2, anim: "peck" },
  { id: "flamingo",   name: "フラミンゴ",     need: 0.50, max: 3, anim: "sway", rain: true },
  { id: "croc",       name: "ワニ",           need: 0.50, max: 1, anim: "still", water: 0.70 },
  { id: "elephant",   name: "ゾウ",           need: 0.55, max: 3, anim: "sip" },
  { id: "giraffe",    name: "キリン",         need: 0.55, max: 2, anim: "sway", shy: true },
  { id: "hippo",      name: "カバ",           need: 0.60, max: 2, anim: "still", water: 0.80 },
  { id: "leopard",    name: "ヒョウ",         need: 0.70, max: 1, anim: "bob", shy: true, time: ["night"], rare: true },
  { id: "rhino",      name: "サイ",           need: 0.78, max: 1, anim: "sip", shy: true, rare: true },
  { id: "lion",       name: "ライオン",       need: 0.85, max: 2, anim: "bob", time: ["dawn", "dusk"], rare: true },
];

const MAX_DRAWN = 18;

/* ---------- 日付シード（同じ日は必ず同じ水場になる） ---------- */
function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const dateSeed = (d) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

/* ---------- モックデータ ---------- */
const MEMBER_TOTAL = 18;
const RAW = [
  { d: "2026-08-29", t: "mind", name: "加藤", w: "☀️ 晴れ", c: "朝の散歩で金木犀のにおいがした。まだ8月なのに。" },
  { d: "2026-08-29", t: "mind", name: "三浦", w: "⚡ 疲れ気味", c: "見積り3本立て込み中。でも今日中に片付く見込み。" },
  { d: "2026-08-29", t: "thanks", name: "金野", to: "加藤", credo: "背中を見せる", c: "議事録のたたきを先に出してくれて、会議が20分短くなりました。" },
  { d: "2026-08-29", t: "mind", name: "白石", w: "☁️ 曇り", c: "可もなく不可もなく。こういう日がいちばん長続きする気がする。" },
  { d: "2026-08-29", t: "mind", name: "遠藤", w: "☂ 雨", c: "気圧のせいにしておきます。" },
  { d: "2026-08-28", t: "mind", name: "小林", w: "☀️ 晴れ", c: "はじめて後輩に仕事を任せきれた日。" },
  { d: "2026-08-28", t: "thanks", name: "加藤", to: "遠藤", credo: "まず聴く", c: "落ち込んでるのを見抜かれて、何も言わずコーヒーを置いていってくれた。" },
  { d: "2026-08-28", t: "mind", name: "金野", w: "☁️ 曇り", c: "" },
  { d: "2026-08-28", t: "mind", name: "高野", w: "☀️ 晴れ", c: "机の上を全部片付けた。それだけで違う。" },
  { d: "2026-08-28", t: "thanks", name: "白石", to: "小林", credo: "やってみる", c: "新しい受付フロー、まず試してみようと言ってくれたのが心強かった。" },
  { d: "2026-08-27", t: "mind", name: "佐々木", w: "⚡ 疲れ気味", c: "寝不足。今日は無理せず定時で帰ります。" },
  { d: "2026-08-27", t: "mind", name: "加藤", w: "☁️ 曇り", c: "" },
  { d: "2026-08-27", t: "mind", name: "三浦", w: "☀️ 晴れ", c: "長かった案件がやっと着地しました。" },
  { d: "2026-08-27", t: "thanks", name: "遠藤", to: "三浦", credo: "最後までやりきる", c: "土壇場の差し替え、ひとりで抱えずに声をかけてくれてありがとう。" },
  { d: "2026-08-26", t: "mind", name: "小林", w: "☂ 雨", c: "うまく言葉にできない日もある。" },
  { d: "2026-08-26", t: "mind", name: "白石", w: "☀️ 晴れ", c: "" },
  { d: "2026-08-26", t: "mind", name: "金野", w: "☀️ 晴れ", c: "娘の運動会の代休。庭の草むしりをしました。" },
  { d: "2026-08-26", t: "thanks", name: "高野", to: "佐々木", credo: "まず聴く", c: "15分だけ、と言いながら1時間つきあってくれた。" },
  { d: "2026-08-26", t: "mind", name: "遠藤", w: "☁️ 曇り", c: "" },
  { d: "2026-08-25", t: "mind", name: "加藤", w: "☀️ 晴れ", c: "" },
  { d: "2026-08-25", t: "mind", name: "佐々木", w: "☁️ 曇り", c: "月曜の朝はだいたいこれくらい。" },
  { d: "2026-08-25", t: "thanks", name: "三浦", to: "白石", credo: "背中を見せる", c: "誰も手を挙げなかった議事録を、黙って引き受けてくれた。" },
];
const ENTRIES = RAW.map((r, i) => ({ ...r, id: `e${i}` }));

/* ------------------------------------------------------------
   緑

   ほかの指標が「いまの状態」なのに対し、緑だけは累積で、二度と減らない。
   静かな週があっても、この土地がここまで来た事実は消えない。

   歩数は合計しか使わない。個人別の表示・目標・未入力へのペナルティは作らない。
   ------------------------------------------------------------ */
const GREEN_PER_MIND = 1;
const GREEN_PER_THANKS = 3;
const STEPS_PER_GREEN = 100_000;
const STEP_LENGTH_M = 0.7; // 歩数から距離への換算

const GREEN_STAGES = [
  { at: 0,    label: "裸地" },
  { at: 60,   label: "まばらな草" },
  { at: 250,  label: "草地" },
  { at: 700,  label: "低木" },
  { at: 1400, label: "アカシアが数本" },
  { at: 2600, label: "林" },
  { at: 4200, label: "水辺に葦、緑の帯" },
];

function greenStageOf(total) {
  let i = 0;
  for (let k = 0; k < GREEN_STAGES.length; k++) if (total >= GREEN_STAGES[k].at) i = k;
  return i;
}

/* ---------- 場の指標 ---------- */
function useMetrics(activity, greenOverride) {
  return useMemo(() => {
    const mult = { quiet: 0.3, normal: 1, lively: 1.7 }[activity];
    const week = ENTRIES.filter((e) => e.d >= "2026-08-24");
    /* 実データでは週の投稿者数を数えるところ。モックでは3段階を明示する */
    const spread = { quiet: 3, normal: 8, lively: 17 }[activity];
    const weathers = new Set(week.filter((e) => e.t === "mind").map((e) => e.w));
    const variety = activity === "quiet" ? 1 : weathers.size;
    const hasRain = activity !== "quiet" && weathers.has("☂ 雨");
    const streak = { quiet: 5, normal: 34, lively: 61 }[activity];
    const thanks = Math.round(week.filter((e) => e.t === "thanks").length * mult) + { quiet: 4, normal: 21, lively: 40 }[activity];

    /* 累積分。実データでは全期間のマインド件数・カード件数・歩数合計を使う。
       モックではスライダーの段階に合わせて、歩数と距離も比例して動かす */
    const base = { minds: 1180, thanks: 214, steps: 9_640_000 };
    const baseTotal =
      base.minds * GREEN_PER_MIND + base.thanks * GREEN_PER_THANKS + base.steps / STEPS_PER_GREEN;
    const greenTotal = greenOverride !== null ? GREEN_STAGES[greenOverride].at : Math.round(baseTotal);
    const totalSteps = Math.round(base.steps * (baseTotal > 0 ? greenTotal / baseTotal : 0));
    const stage = greenStageOf(greenTotal);
    const next = GREEN_STAGES[stage + 1];

    return {
      spread, spreadRatio: spread / MEMBER_TOTAL, streak, variety, hasRain, thanks,
      level: Math.max(0.35, Math.min(1, streak / 55)),
      greenTotal, stage,
      /* 段階内の進み具合。「あと◯」は出さず、バーの長さだけに使う */
      stageProgress: next ? (greenTotal - GREEN_STAGES[stage].at) / (next.at - GREEN_STAGES[stage].at) : 1,
      totalSteps,
      totalKm: Math.round((totalSteps * STEP_LENGTH_M) / 1000),
    };
  }, [activity, greenOverride]);
}

/* ---------- 今日、水場に降りている生き物 ---------- */
function useFauna(metrics, timeOfDay) {
  return useMemo(() => {
    const r = seeded(dateSeed(new Date()) + metrics.spread * 31 + metrics.variety * 7);
    const present = [], absent = [];
    FAUNA.forEach((f) => {
      let why = null;
      if (metrics.spreadRatio < f.need) why = "spread";
      else if (f.shy && metrics.variety < 3) why = "shy";
      else if (f.water && metrics.level < f.water) why = "water";
      else if (f.rain && !metrics.hasRain) why = "rain";
      else if (f.time && !f.time.includes(timeOfDay)) why = "time";
      if (why) { absent.push({ ...f, why }); return; }
      const head = Math.min(f.max, Math.max(1, Math.round(f.max * (0.35 + metrics.spreadRatio * 0.75) * (0.6 + r() * 0.6))));
      present.push({ ...f, head });
    });
    return { present, absent };
  }, [metrics, timeOfDay]);
}

/* ============================================================
   水場
   ============================================================ */
function Waterhole({ metrics, fauna, timeOfDay, ripples, onSplash }) {
  const rnd = useMemo(() => seeded(dateSeed(new Date()) + 991), []);
  const sky = { dawn: ["#FFF3EC", "#FFFFFF"], day: ["#EBF5F8", "#FFFFFF"], dusk: ["#FFEDE0", "#FFFFFF"], night: ["#EDEFF7", "#FFFFFF"] }[timeOfDay];
  const ws = 0.55 + metrics.level * 0.45;
  const stage = metrics.stage;

  /* 描画スロット：まず各種1体ずつ、残りを頭数の多い種で埋める */
  const slots = useMemo(() => {
    const r = seeded(dateSeed(new Date()) + 77);
    const picks = [];
    fauna.present.forEach((f) => picks.push(f));
    const extra = [];
    fauna.present.forEach((f) => { for (let i = 1; i < f.head; i++) extra.push(f); });
    for (let i = extra.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [extra[i], extra[j]] = [extra[j], extra[i]]; }
    picks.push(...extra.slice(0, Math.max(0, MAX_DRAWN - picks.length)));

    return picks.map((f, i) => {
      const depth = r();
      const water = f.id === "croc" || f.id === "hippo";
      return {
        key: `${f.id}-${i}`, kind: f.id, anim: f.anim, depth,
        x: water ? 380 + r() * 150 : 42 + r() * 816,
        y: water ? 316 + r() * 10 : 236 + depth * 132,
        scale: (water ? 0.85 : 0.5 + depth * 0.72) * (f.id === "weaver" || f.id === "frog" ? 0.8 : 1),
        delay: (i % 6) * 0.45,
      };
    }).sort((a, b) => a.depth - b.depth);
  }, [fauna]);

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
      {/* 遠景の緑の帯：最終段階で地平線まで緑になる */}
      {stage >= 5 && (
        <path d="M0 216 Q 240 204 480 214 T 900 208 L900 230 L0 230 Z"
          fill={C.acacia} opacity={stage >= 6 ? 0.4 : 0.22} />
      )}
      <FarHerd />
      <path d="M0 222 Q 450 208 900 222 L900 400 L0 400 Z" fill="url(#ground)" />

      {/* 草：段階が上がるほど密になり、色が濃くなる */}
      <g stroke={stage >= 3 ? C.acaciaDeep : stage >= 1 ? C.acacia : C.mud}
        strokeWidth="2.2" strokeLinecap="round" fill="none" opacity={stage >= 1 ? 0.85 : 0.45}>
        {Array.from({ length: [4, 22, 46, 66, 84, 104, 124][stage] }).map((_, i) => {
          const x = 14 + ((rnd() * 880 + i * 47) % 878), y = 240 + rnd() * 146;
          if (Math.abs(x - 450) < 208 * ws && y > 284) return null;
          const h = 5 + rnd() * (6 + stage * 2.2);
          return <path key={i} d={`M${x} ${y} q 3 ${-h / 2} 5 ${-h}`} />;
        })}
      </g>

      {/* 低木 */}
      {stage >= 3 && SHRUBS.slice(0, [0, 0, 0, 4, 7, 10, 13][stage]).map((p, i) => (
        <Shrub key={i} x={p[0]} y={p[1]} s={p[2]} stage={stage} />
      ))}

      {/* 水際の葦 */}
      {stage >= 6 && REEDS.map((p, i) => <Reed key={i} x={p[0]} y={p[1]} s={p[2]} flip={p[3]} />)}

      {/* ナツメヤシ */}
      {stage >= 5 && <Palm x={262} y={250} s={0.9} />}
      {stage >= 6 && <Palm x={644} y={246} s={0.78} />}

      {/* アカシア */}
      {stage >= 4 && <Acacia x={78} y={254} s={0.95} stage={stage} />}
      {stage >= 4 && <Acacia x={824} y={246} s={0.8} stage={stage} />}
      {stage >= 5 && <Acacia x={176} y={236} s={0.56} stage={stage} />}
      {stage >= 5 && <Acacia x={730} y={238} s={0.64} stage={stage} />}
      {stage >= 6 && <Acacia x={352} y={230} s={0.44} stage={stage} />}
      {stage >= 6 && <Acacia x={560} y={228} s={0.4} stage={stage} />}

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

      {slots.map((s) => <Beast key={s.key} {...s} />)}

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

function FarHerd() {
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

/* ---------- 植生 ---------- */
const SHRUBS = [
  [138, 288, 1.0], [318, 268, 0.72], [598, 272, 0.8], [782, 290, 0.95],
  [232, 306, 1.1], [688, 300, 1.0], [64, 268, 0.8],
  [406, 254, 0.6], [512, 252, 0.62], [858, 262, 0.72],
  [178, 340, 1.2], [742, 336, 1.15], [292, 246, 0.55],
];
const REEDS = [
  [268, 322, 1.0, 0], [300, 330, 0.85, 1], [612, 326, 0.95, 0],
  [648, 318, 0.8, 1], [238, 312, 0.75, 0], [676, 334, 1.05, 1],
];

function Acacia({ x, y, s, stage }) {
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

function Shrub({ x, y, s, stage }) {
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

function Palm({ x, y, s }) {
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

function Reed({ x, y, s, flip }) {
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

/* ============================================================
   生き物のイラスト（すべて右向き・足元が原点）
   ============================================================ */
const EYE = "#3A342B";
const leg = (x, w, h, f) => <rect key={x} x={x} y="-4" width={w} height={h} rx={w / 2} fill={f} />;

const SHAPES = {
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

function Beast({ kind, x, y, scale, depth, anim, delay }) {
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

/* ---------- おまけの二匹 ---------- */
function Mame() {
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
function Kinako() {
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

/* ------------------------------------------------------------
   まめ と きなこ
   投稿については何も言わない。目の前の土地と水と空のことだけ。
   when : この状態のときだけ選ばれる（省略ならいつでも）
   ------------------------------------------------------------ */
const TALKS = [
  { m: "風が東さ回ったっちゃ。", k: "せやから砂が向こう岸まで飛んでんねん。" },
  { m: "今朝の水、やけに澄んでるない。", k: "夜のうちに誰も踏み荒らさへんかったんやろ。" },
  { m: "泥さ足あとがいっぺぇ残ってる。", k: "うちらが寝とるあいだも、ちゃんと誰か来てたんやな。" },
  { m: "遠くで雷なってるべ。", k: "降ったらええな。降らんでも、この水は残るけどな。" },
  { m: "向こう岸の草、青くなってきたっちゃ。", k: "根っこは、水面より下でつながってんねやで。" },
  { m: "この水場、誰のもんだべな。", k: "誰のもんでもないから、みんな降りてこれんねやろ。" },
  { m: "アカシアの影、だいぶ伸びたっちゃ。", k: "日が傾いてきたな。そろそろ大きいのが来るで。", when: (s) => s.time === "dusk" },
  { m: "星が出てきたべ。", k: "夜に来るやつは、昼のやつとは顔が違うねん。", when: (s) => s.time === "night" },
  { m: "朝もやが晴れてきたっちゃ。", k: "いちばん先に降りてくるのは、たいてい鳥やねん。", when: (s) => s.time === "dawn" },
  { m: "今日はやけに静かだない。", k: "静かな日もあるやろ。水さえあれば、また戻ってくるわ。", when: (s) => s.spreadRatio < 0.35 },
  { m: "水際の泥、だいぶ広がったない。", k: "そういう時期もあるわ。干上がりはせえへん。", when: (s) => s.level < 0.6 },
  { m: "岸まで水が来てるっちゃ。", k: "ここまで来たら、重たいやつも入ってこれるな。", when: (s) => s.level > 0.85 },
  { m: "ホロホロチョウばっかりだない。", k: "あの子らは強いからな。臆病なんは、あとから降りてくんねん。", when: (s) => s.variety < 3 },
  { m: "見ねぇ顔がいっぺぇ来てるっちゃ。", k: "いろんな天気の日がある水場やからな。安心して降りてこれんねん。", when: (s) => s.variety >= 3 && s.spreadRatio > 0.6 },
];

function pickTalk(state) {
  const ok = TALKS.filter((t) => !t.when || t.when(state));
  const pool = ok.length ? ok : TALKS;
  return pool[dateSeed(new Date()) % pool.length];
}

const WHY_TEXT = {
  shy: "は、晴れの日ばかりの水場には降りてきません",
  water: "は、水位がもっと上がらないと来られません",
  rain: "は、雨の日があった週にだけ現れます",
  time: "は、この時間には降りてきません",
};

/* ============================================================ */
export default function MinnaNoMizuba() {
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [activity, setActivity] = useState("normal");
  const [greenStage, setGreenStage] = useState(4);
  const [posted, setPosted] = useState(false);
  const [ripples, setRipples] = useState([]);
  const rid = useRef(0);

  const metrics = useMetrics(activity, greenStage);
  const fauna = useFauna(metrics, timeOfDay);

  useEffect(() => {
    const h = new Date().getHours();
    setTimeOfDay(h < 8 ? "dawn" : h < 16 ? "day" : h < 19 ? "dusk" : "night");
  }, []);

  const splash = () => {
    const id = ++rid.current;
    setRipples((r) => [...r, id]);
    setTimeout(() => setRipples((r) => r.filter((x) => x !== id)), 2100);
  };

  const talk = pickTalk({ ...metrics, time: timeOfDay });
  const hints = fauna.absent.filter((f) => f.why !== "spread" && metrics.spreadRatio >= f.need).slice(0, 3);

  const byDate = useMemo(() => {
    const m = new Map();
    ENTRIES.forEach((e) => { if (!m.has(e.d)) m.set(e.d, []); m.get(e.d).push(e); });
    return Array.from(m.entries());
  }, []);

  return (
    <div style={{ background: C.paper, color: C.ink, fontFamily: "'Zen Kaku Gothic New', sans-serif" }} className="min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap');
        .maru{font-family:'Zen Maru Gothic',sans-serif}
        .hit{transition:background .18s ease}.hit:hover{background:${C.mist}}
        button:focus-visible,[role="button"]:focus-visible{outline:2.5px solid ${C.water};outline-offset:2px}
      `}</style>

      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="maru text-lg font-bold tracking-wide">みんなの水場</span>
            <span className="text-xs" style={{ color: C.inkSoft }}>ハピネス5</span>
          </div>
          <a href="#report" className="text-sm px-3 py-1.5 rounded-full border" style={{ borderColor: C.line, color: C.inkSoft }}>レポート</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5">
        <section className="pt-5">
          <div className="rounded-2xl overflow-hidden border relative" style={{ borderColor: C.line }}>
            <Waterhole metrics={metrics} fauna={fauna} timeOfDay={timeOfDay} ripples={ripples} onSplash={splash} />
            <div className="absolute top-3 left-4 text-[11px] tracking-wider" style={{ color: C.inkSoft }}>{stamp()} の水場</div>
          </div>

          {/* 今日きているもの */}
          <div className="mt-4">
            <div className="text-xs mb-2" style={{ color: C.inkSoft }}>いま降りてきているもの　{fauna.present.length}種</div>
            <div className="flex flex-wrap gap-1.5">
              {fauna.present.map((f) => (
                <span key={f.id} className="text-xs px-2.5 py-1 rounded-full border"
                  style={{ borderColor: f.rare ? C.water : C.line, background: f.rare ? C.waterPale : C.mist, color: f.rare ? "#2F6B7A" : C.ink }}>
                  {f.name}<span className="ml-1 opacity-60">{f.head}</span>
                </span>
              ))}
            </div>
            {hints.length > 0 && (
              <ul className="mt-3 space-y-1">
                {hints.map((f) => (
                  <li key={f.id} className="text-xs leading-relaxed" style={{ color: C.inkSoft }}>
                    {f.name}{WHY_TEXT[f.why]}。
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-3 flex items-start gap-2">
            <span className="flex gap-1 shrink-0 mt-1">
              <span className="w-3 h-3 rounded-full" style={{ background: C.mame }} />
              <span className="w-3 h-3 rounded-full" style={{ background: C.kinako }} />
            </span>
            <p className="text-xs leading-relaxed" style={{ color: C.inkSoft }}>
              <span className="maru">まめ</span>「{talk.m}」
              <span className="maru ml-1">きなこ</span>「{talk.k}」
            </p>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {posted ? (
            <div className="rounded-xl px-5 py-4 flex items-center gap-3" style={{ background: C.mist }}>
              <Drop size={26} />
              <div>
                <div className="maru font-bold text-sm">今日の一滴は、もう水になりました</div>
                <div className="text-xs mt-0.5" style={{ color: C.inkSoft }}>また明日、ここで</div>
              </div>
            </div>
          ) : (
            <button onClick={() => { setPosted(true); splash(); }} className="rounded-xl px-5 py-4 text-left text-white" style={{ background: C.water }}>
              <span className="maru block text-base font-bold">今日の一滴を落とす</span>
              <span className="block text-xs opacity-90 mt-1">心のお天気をひとつ。水位が上がります</span>
            </button>
          )}
          <button onClick={splash} className="rounded-xl px-5 py-4 text-left border" style={{ borderColor: C.line }}>
            <span className="maru block text-base font-bold">ありがとうを贈る</span>
            <span className="block text-xs mt-1" style={{ color: C.inkSoft }}>いったん水に還って、土地ぜんたいに巡ります</span>
          </button>
        </section>

        <section className="mt-8">
          <h2 className="maru text-sm font-bold mb-3" style={{ color: C.inkSoft }}>この土地のいま</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="今週きた人" value={metrics.spread} unit={`/ ${MEMBER_TOTAL}人`} bar={metrics.spreadRatio} note="集まる種の数が決まります" />
            <Stat label="水位" value={metrics.streak} unit="日ぶん" bar={metrics.level} note="カバとワニは水位が高い日だけ" />
            <Stat label="お天気の種類" value={metrics.variety} unit="/ 4" bar={metrics.variety / 4} note={metrics.variety >= 3 ? "臆病な生き物も降りてこられます" : "晴れに寄っています"} />
            <Stat label="めぐった感謝" value={metrics.thanks} unit="件" bar={Math.min(1, metrics.thanks / 40)} note="この30日ぶん" />
          </div>

          {/* 緑だけは累積で、減らない */}
          <div className="mt-3 rounded-xl border px-4 py-3.5" style={{ borderColor: C.line }}>
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <span className="text-xs" style={{ color: C.inkSoft }}>育った緑</span>
                <span className="maru text-lg font-bold ml-2">{GREEN_STAGES[metrics.stage].label}</span>
              </div>
              <span className="text-xs" style={{ color: C.inkSoft }}>
                みんなで歩いた距離　{metrics.totalKm.toLocaleString()} km
              </span>
            </div>
            <div className="h-1.5 rounded-full mt-2.5 overflow-hidden" style={{ background: C.line }}>
              <div className="h-full rounded-full" style={{ width: `${metrics.stageProgress * 100}%`, background: C.acacia }} />
            </div>
            <p className="text-[10px] mt-2 leading-relaxed" style={{ color: C.inkSoft }}>
              みんなの投稿と歩数が、そのまま土地に積もっていきます。ここまで育った緑は、静かな週があっても減りません。
            </p>
          </div>
        </section>

        <section className="mt-9 pb-4">
          <h2 className="maru text-sm font-bold" style={{ color: C.inkSoft }}>水場の日誌</h2>
          <p className="text-xs mt-1 mb-4" style={{ color: C.inkSoft }}>どの行をタップしても、そのひとしずくが水面に落ちます</p>
          {byDate.map(([date, items]) => (
            <div key={date} className="mb-7">
              <div className="flex items-center gap-3 mb-2">
                <span className="maru text-sm font-bold">{fmtDate(date)}</span>
                <span className="flex-1 h-px" style={{ background: C.line }} />
                <span className="flex gap-1">
                  {items.filter((i) => i.t === "mind").map((i, k) => <span key={k} className="w-2 h-2 rounded-full" style={{ background: WEATHER[i.w].color }} />)}
                </span>
              </div>
              <div className="space-y-0.5">
                {items.map((e) => (
                  <div key={e.id} role="button" tabIndex={0} onClick={splash}
                    onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && splash()}
                    className="hit rounded-lg px-3 py-2.5 cursor-pointer">
                    {e.t === "mind" ? (
                      <div className="flex gap-3">
                        <span className="text-base leading-6 shrink-0">{e.w.split(" ")[0]}</span>
                        <div className="min-w-0">
                          <span className="maru text-sm font-bold">{e.name}</span>
                          <span className="text-xs ml-2" style={{ color: C.inkSoft }}>{WEATHER[e.w].short}</span>
                          {e.c && <p className="text-sm mt-0.5 leading-relaxed">{e.c}</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <span className="shrink-0 mt-0.5"><Drop size={18} /></span>
                        <div className="min-w-0">
                          <span className="maru text-sm font-bold">{e.name}</span>
                          <span className="text-xs mx-1.5" style={{ color: C.inkSoft }}>から</span>
                          <span className="maru text-sm font-bold">{e.to}</span>
                          <span className="text-xs ml-2 px-1.5 py-0.5 rounded" style={{ background: C.waterPale, color: "#357080" }}>{e.credo}</span>
                          <p className="text-sm mt-0.5 leading-relaxed">{e.c}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mb-10 rounded-xl p-4 text-xs" style={{ background: C.mist, color: C.inkSoft }}>
          <div className="mb-2 font-bold">モックアップ確認用（本番では出しません）</div>
          <div className="flex flex-wrap gap-4">
            <Toggle label="時刻" value={timeOfDay} set={setTimeOfDay} opts={[["dawn", "朝"], ["day", "昼"], ["dusk", "夕"], ["night", "夜"]]} />
            <Toggle label="活性度" value={activity} set={setActivity} opts={[["quiet", "静か"], ["normal", "ふつう"], ["lively", "にぎやか"]]} />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="shrink-0">緑の段階</span>
            <input type="range" min="0" max={GREEN_STAGES.length - 1} value={greenStage}
              onChange={(e) => setGreenStage(Number(e.target.value))} className="flex-1 max-w-xs" style={{ accentColor: C.acacia }} />
            <span className="maru shrink-0" style={{ color: C.ink }}>{GREEN_STAGES[greenStage].label}</span>
          </div>
          <p className="mt-2.5 leading-relaxed">
            「にぎやか」＝今週17人／18人。この状態の「朝」か「夕」でライオン、「夜」でヒョウとジャッカル、「昼」でミーアキャットが降りてきます。サイは「にぎやか」ならいつでも。
          </p>
        </section>
      </main>
    </div>
  );
}

/* ---------- 小物 ---------- */
function Drop({ size }) {
  return <svg width={size} height={size} viewBox="0 0 20 20"><path d="M10 2 C 6 8 4 10.5 4 13 a 6 6 0 0 0 12 0 C 16 10.5 14 8 10 2 Z" fill={C.water} /></svg>;
}
function Stat({ label, value, unit, bar, note }) {
  return (
    <div className="rounded-xl border px-3.5 py-3" style={{ borderColor: C.line }}>
      <div className="text-xs" style={{ color: C.inkSoft }}>{label}</div>
      <div className="maru mt-0.5"><span className="text-2xl font-bold">{value}</span><span className="text-xs ml-1" style={{ color: C.inkSoft }}>{unit}</span></div>
      <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: C.line }}>
        <div className="h-full rounded-full" style={{ width: `${bar * 100}%`, background: C.water }} />
      </div>
      {note && <div className="text-[10px] mt-1.5 leading-tight" style={{ color: C.inkSoft }}>{note}</div>}
    </div>
  );
}
function Toggle({ label, value, set, opts }) {
  return (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: C.line }}>
        {opts.map(([v, l]) => (
          <button key={v} onClick={() => set(v)} className="px-2.5 py-1"
            style={{ background: value === v ? C.water : C.paper, color: value === v ? "#fff" : C.inkSoft }}>{l}</button>
        ))}
      </div>
    </div>
  );
}
function fmtDate(d) {
  const dt = new Date(d + "T00:00:00");
  return `${dt.getMonth() + 1}月${dt.getDate()}日（${["日", "月", "火", "水", "木", "金", "土"][dt.getDay()]}）`;
}
function stamp() {
  const n = new Date(), p = (x) => String(x).padStart(2, "0");
  return `${n.getFullYear()}.${p(n.getMonth() + 1)}.${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`;
}
