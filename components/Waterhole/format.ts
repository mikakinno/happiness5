const JST = "Asia/Tokyo";

export function fmtDate(ymd: string): string {
  const dt = new Date(ymd + "T00:00:00+09:00");
  const wd = ["日", "月", "火", "水", "木", "金", "土"][dt.getUTCDay()];
  return `${dt.getUTCMonth() + 1}月${dt.getUTCDate()}日（${wd}）`;
}

/* ヘッダーに出す「◯◯の水場」の時刻表示。サーバーの asOf（レスポンス取得時刻）
   を使う ─ 各自のブラウザの時計ではなく、みんなが見ているのと同じ時刻にする。 */
export function fmtStamp(asOfIso: string): string {
  const d = new Date(asOfIso);
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: JST,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("year")}.${g("month")}.${g("day")} ${g("hour")}:${g("minute")}`;
}
