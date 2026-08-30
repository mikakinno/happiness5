import type { AbsentReason, WeatherKey } from "../../lib/waterhole";

export const C = {
  paper: "#FFFFFF", mist: "#F7F4EE", line: "#E7E0D4",
  ink: "#3A342B", inkSoft: "#8A8073",
  water: "#5FA9BC", waterPale: "#CFE7EC",
  sand: "#EDDFC7", sandDeep: "#D3BF9C", mud: "#BCA381",
  acacia: "#8C9E77", acaciaDeep: "#5F7355", hazeFar: "#DAD3C5",
  mame: "#C89F72", kinako: "#E8CFA9",
} as const;

/* 心のお天気の絵文字は異体字セレクタの有無が揺れるため、表示にだけ使う。
   判定は lib/waterhole.ts の toWeatherKey() が担う。 */
export const WEATHER_UI: Record<WeatherKey, { emoji: string; color: string }> = {
  sun: { emoji: "☀️", color: "#EFB03C" },
  cloud: { emoji: "☁️", color: "#AAB2AC" },
  rain: { emoji: "☂", color: "#71A2CC" },
  tired: { emoji: "⚡", color: "#E0906A" },
};

/* API のレスポンスは JSON を経由するため weather は string | null になる。
   実際の値は必ず WeatherKey のいずれかだが、型としては保証されないので
   安全にルックアップする。 */
export function weatherUI(key: string | null | undefined): { emoji: string; color: string } | null {
  if (!key) return null;
  return Object.prototype.hasOwnProperty.call(WEATHER_UI, key)
    ? WEATHER_UI[key as WeatherKey]
    : null;
}

/* "spread"（参加人数不足）は意図的に含めない。原則3：人数不足を
   不在理由として画面に出さない。absentHints() 側でも除外済みだが、
   ここでも二重に安全側にしておく。 */
export const WHY_TEXT: Partial<Record<AbsentReason, string>> = {
  shy: "は、晴れの日ばかりの水場には降りてきません",
  water: "は、水位がもっと上がらないと来られません",
  rain: "は、雨の日があった週にだけ現れます",
  time: "は、この時間には降りてきません",
};
