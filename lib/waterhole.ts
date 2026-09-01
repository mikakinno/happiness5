/* ============================================================
   lib/waterhole.ts
   水場のドメインロジック。Sheets にも Next にも依存しない純粋な計算。
   ここだけ単体でテストできる状態を保つこと。
   ============================================================ */

export type WeatherKey = "sun" | "cloud" | "rain" | "tired";
export type TimeBand = "dawn" | "day" | "dusk" | "night";
export type AbsentReason = "spread" | "shy" | "water" | "rain" | "time";

export const WEATHER_LABEL: Record<WeatherKey, string> = {
  sun: "晴れ",
  cloud: "曇り",
  rain: "雨",
  tired: "疲れ気味",
};

/* Google フォームの選択肢は絵文字つきで、異体字セレクタの有無が揺れる。
   絵文字では比較せず、日本語の語で判定する。 */
export function toWeatherKey(raw: string | undefined | null): WeatherKey | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  if (s.includes("晴")) return "sun";
  if (s.includes("曇")) return "cloud";
  if (s.includes("雨")) return "rain";
  if (s.includes("疲")) return "tired";
  return null;
}

/* 歩数の表記揺れ（全角数字・カンマ区切り・「約8000歩」・「8000〜9000」
   のようなレンジ表記など）を吸収する。全角数字を半角に直し、カンマを
   取り除いたうえで、最初に現れる数値だけを歩数として採用する
   （レンジ表記は控えめな見積もりになる）。変換できない・未入力の行は
   0 として扱う ─ 未入力にペナルティを与えない、という原則8のため。
   エラーを投げないこと。 */
export function parseSteps(raw: string | undefined | null): number {
  const hankaku = (raw ?? "")
    .trim()
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/,/g, "");
  const m = hankaku.match(/\d+/);
  if (!m) return 0;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : 0;
}

/* ------------------------------------------------------------
   生き物の出現条件

   need  : 今週きた人の割合がこれを超えると現れる
   shy   : 心のお天気が3種類以上ないと降りてこない
   water : 水位がこれを超えないと来られない
   rain  : その週に雨が出ていないと来ない
   time  : この時間帯にしか降りてこない
   ------------------------------------------------------------ */
export type Fauna = {
  id: string;
  name: string;
  need: number;
  max: number;
  anim: "bob" | "sip" | "sway" | "peck" | "hop" | "creep" | "still";
  shy?: boolean;
  water?: number;
  rain?: boolean;
  time?: TimeBand[];
  rare?: boolean;
};

export const FAUNA: Fauna[] = [
  { id: "weaver",     name: "ハタオリドリ",   need: 0.0,  max: 8, anim: "peck" },
  { id: "guinea",     name: "ホロホロチョウ", need: 0.0,  max: 6, anim: "peck" },
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

/* ------------------------------------------------------------
   日付・時刻（すべて JST 固定）
   ------------------------------------------------------------ */
const JST = "Asia/Tokyo";

export function ymdJst(d: Date): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: JST, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)!.value;
  return `${g("year")}-${g("month")}-${g("day")}`;
}

export function hourJst(d: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: JST, hour: "2-digit", hour12: false }).format(d)
  );
}

export function timeBand(d: Date): TimeBand {
  const h = hourJst(d);
  if (h < 8) return "dawn";
  if (h < 16) return "day";
  if (h < 19) return "dusk";
  return "night";
}

/* "2026/08/29 9:12:03" / "2026-08-29T09:12:03" どちらも受ける。
   タイムゾーン指定のない文字列は JST として解釈する。 */
export function parseSheetDate(raw: string): Date | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  const m = s.match(
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?/
  );
  if (m) {
    const [, y, mo, d, h, mi, se] = m;
    const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T${h.padStart(2, "0")}:${mi}:${(se ?? "00").padStart(2, "0")}+09:00`;
    const dt = new Date(iso);
    return isNaN(dt.getTime()) ? null : dt;
  }
  const dOnly = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (dOnly) {
    const [, y, mo, d] = dOnly;
    return new Date(`${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00+09:00`);
  }
  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function shiftDays(ymd: string, delta: number): string {
  const d = new Date(`${ymd}T12:00:00+09:00`);
  d.setUTCDate(d.getUTCDate() + delta);
  return ymdJst(d);
}

/* ------------------------------------------------------------
   入力
   ------------------------------------------------------------ */
export type MindRow = { at: Date; name: string; weather: WeatherKey | null; comment: string; steps: number };
export type ThanksRow = { at: Date; from: string; to: string; credo: string; message: string };

export type Metrics = {
  memberTotal: number;
  spread: number;
  spreadRatio: number;
  streak: number;
  level: number;
  levelDays: number; // 直近 LEVEL_WINDOW_DAYS 日のうち、投稿があった日数（表示用の実数。level は下限クランプ済みなのでこちらを使う）
  variety: number;
  weatherBreakdown: Record<WeatherKey, number>;
  hasRain: boolean;
  thanks: number;
};

export const SPREAD_WINDOW_DAYS = 7;
export const THANKS_WINDOW_DAYS = 30;
export const LEVEL_WINDOW_DAYS = 30; // 水位＝直近この日数のうち投稿があった日の割合
export const LEVEL_FLOOR = 0.35;     // 干上がらせない下限

export function computeMetrics(
  minds: MindRow[],
  thanks: ThanksRow[],
  memberTotal: number,
  now = new Date()
): Metrics {
  const today = ymdJst(now);
  const weekFrom = shiftDays(today, -(SPREAD_WINDOW_DAYS - 1));
  const thanksFrom = shiftDays(today, -(THANKS_WINDOW_DAYS - 1));

  const week = minds.filter((m) => ymdJst(m.at) >= weekFrom);

  const people = new Set(week.map((m) => m.name.trim()).filter(Boolean));
  const spread = Math.min(people.size, memberTotal);

  const weatherBreakdown: Record<WeatherKey, number> = { sun: 0, cloud: 0, rain: 0, tired: 0 };
  week.forEach((m) => { if (m.weather) weatherBreakdown[m.weather]++; });
  const variety = (Object.values(weatherBreakdown) as number[]).filter((n) => n > 0).length;

  /* 場のストリーク：誰か1人でも投稿した日が何日続いているか（表示用）。
     今日まだ誰も来ていない場合は、昨日までで数える（今日を失敗にしない）。 */
  const activeDays = new Set(minds.map((m) => ymdJst(m.at)));
  let cursor = activeDays.has(today) ? today : shiftDays(today, -1);
  let streak = 0;
  while (activeDays.has(cursor)) {
    streak++;
    cursor = shiftDays(cursor, -1);
    if (streak > 3650) break;
  }

  /* 水位：直近 LEVEL_WINDOW_DAYS 日のうち、誰か1人でも投稿があった日の割合。
     連続を要求しない ─ 14人規模だと週末で必ず途切れ、streak ベースだと
     水位が下限に張り付いてしまうため（原則2：水場は干上がらない）。 */
  const levelFrom = shiftDays(today, -(LEVEL_WINDOW_DAYS - 1));
  const activeDaysInWindow = Array.from(activeDays).filter(
    (d) => d >= levelFrom && d <= today
  ).length;
  const level = Math.max(LEVEL_FLOOR, Math.min(1, activeDaysInWindow / LEVEL_WINDOW_DAYS));

  return {
    memberTotal,
    spread,
    spreadRatio: memberTotal > 0 ? spread / memberTotal : 0,
    streak,
    level,
    levelDays: activeDaysInWindow,
    variety,
    weatherBreakdown,
    hasRain: weatherBreakdown.rain > 0,
    thanks: thanks.filter((t) => ymdJst(t.at) >= thanksFrom).length,
  };
}

/* ------------------------------------------------------------
   育った緑（原則7）

   積み上がるだけで、減らない。全期間が対象なので、
   computeMetrics のような直近7日・30日の窓は掛けない。

   与贈          緑への寄与
   マインド投稿1件   1
   ありがとうカード1件 3
   歩数100,000歩    1
   ------------------------------------------------------------ */
export const GREEN_WEIGHT = {
  mind: 1,
  thanks: 3,
  stepsPerUnit: 100_000,
} as const;

export const GREEN_STAGE_THRESHOLDS = [0, 30, 120, 300, 620, 1100, 1800] as const;

export const GREEN_STAGE_NAMES = [
  "裸地",
  "まばらな草",
  "草地",
  "低木",
  "アカシアが数本",
  "林",
  "水辺に葦、緑の帯",
] as const;

export type Green = { value: number; stage: number; stageName: string };

/* 段階ごとの植生の本数（草・低木・アカシア・ナツメヤシ・葦）と
   遠景の緑の帯の濃さ。人間側で決めた表そのもの。ロジックは変えず、
   ここが唯一の値の置き場所にする（Scene.tsx 側にバラバラに散らさない）。
   段階ごとに必ず「見たことのないもの」を1つ足す（原則7）：
   葦は段階2、アカシアは段階3、ナツメヤシは段階5で初登場する。

   grass は「株の数」（1株＝根元から3〜5本が扇状に生える）。以前は
   1本＝1本の値だったが、株として描き直すのに合わせて本数ベースの
   値を株数ベースに引き直した（段階4で約20株、というのが人間側の指定）。 */
export type StageVeg = {
  grass: number;
  shrub: number;
  acacia: number;
  palm: number;
  reed: number;
  farBand: number; // 遠景の緑の帯の不透明度
};

export const GREEN_STAGE_VEG: readonly StageVeg[] = [
  { grass: 1,  shrub: 0, acacia: 0, palm: 0, reed: 0,  farBand: 0.12 },
  { grass: 5,  shrub: 0, acacia: 0, palm: 0, reed: 0,  farBand: 0.16 },
  { grass: 11, shrub: 1, acacia: 0, palm: 0, reed: 2,  farBand: 0.22 },
  { grass: 16, shrub: 3, acacia: 1, palm: 0, reed: 4,  farBand: 0.30 },
  { grass: 20, shrub: 5, acacia: 3, palm: 0, reed: 6,  farBand: 0.40 },
  { grass: 25, shrub: 7, acacia: 5, palm: 1, reed: 9,  farBand: 0.52 },
  { grass: 30, shrub: 9, acacia: 5, palm: 3, reed: 12, farBand: 0.66 },
] as const;

export function computeGreen(minds: MindRow[], thanks: ThanksRow[]): Green {
  const totalSteps = minds.reduce((sum, m) => sum + (m.steps || 0), 0);
  const value =
    minds.length * GREEN_WEIGHT.mind +
    thanks.length * GREEN_WEIGHT.thanks +
    totalSteps / GREEN_WEIGHT.stepsPerUnit;

  let stage = 0;
  for (let i = GREEN_STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (value >= GREEN_STAGE_THRESHOLDS[i]) {
      stage = i;
      break;
    }
  }
  return { value, stage, stageName: GREEN_STAGE_NAMES[stage] };
}

/* みんなで歩いた距離（km）。合計のみを返し、個人別の歩数は
   一切扱わない ─ 歩数は健康データであり、原則8のため。 */
const METERS_PER_STEP = 0.7;

export function totalWalkedKm(minds: MindRow[]): number {
  const totalSteps = minds.reduce((sum, m) => sum + (m.steps || 0), 0);
  return (totalSteps * METERS_PER_STEP) / 1000;
}

/* ------------------------------------------------------------
   今日、誰が降りているか

   頭数は日付シードで決める。乱数をサーバー側に置くことで、
   全メンバーが同じ水場を見る。ここをクライアントでやると
   人ごとに違う水場になり、「ひとつの場」でなくなる。
   ------------------------------------------------------------ */
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export type PresentFauna = { id: string; name: string; head: number; anim: string; rare: boolean };
export type AbsentFauna = { id: string; name: string; why: AbsentReason };

export function resolveFauna(
  metrics: Metrics,
  band: TimeBand,
  now = new Date()
): { present: PresentFauna[]; absent: AbsentFauna[] } {
  const seed =
    Number(ymdJst(now).replace(/-/g, "")) + metrics.spread * 31 + metrics.variety * 7;
  const rnd = seeded(seed);

  const present: PresentFauna[] = [];
  const absent: AbsentFauna[] = [];

  for (const f of FAUNA) {
    let why: AbsentReason | null = null;
    if (metrics.spreadRatio < f.need) why = "spread";
    else if (f.shy && metrics.variety < 3) why = "shy";
    else if (f.water !== undefined && metrics.level < f.water) why = "water";
    else if (f.rain && !metrics.hasRain) why = "rain";
    else if (f.time && !f.time.includes(band)) why = "time";

    if (why) {
      absent.push({ id: f.id, name: f.name, why });
      continue;
    }
    const head = Math.min(
      f.max,
      Math.max(1, Math.round(f.max * (0.35 + metrics.spreadRatio * 0.75) * (0.6 + rnd() * 0.6)))
    );
    present.push({ id: f.id, name: f.name, head, anim: f.anim, rare: !!f.rare });
  }
  return { present, absent };
}

/* 「あと少しで来られる」種だけをヒントに使う。
   人数不足（spread）は理由として出さない ─ 出席していない人を責める表示になるため。 */
export function absentHints(
  metrics: Metrics,
  absent: AbsentFauna[],
  limit = 3
): AbsentFauna[] {
  const need = new Map(FAUNA.map((f) => [f.id, f.need]));
  return absent
    .filter((a) => a.why !== "spread" && metrics.spreadRatio >= (need.get(a.id) ?? 1))
    .slice(0, limit);
}
