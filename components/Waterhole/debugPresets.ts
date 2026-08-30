import type { Metrics } from "../../lib/waterhole";

/* 「モックアップ確認用」の活性度トグルだけが使うプリセット。
   実データの metrics を差し替えて、参加率が低い／高いときの見た目を
   確認するためだけのもの。本番の表示・保存には一切使わない。 */
export type Activity = "quiet" | "normal" | "lively";

const SPREAD_RATIO: Record<Activity, number> = { quiet: 0.18, normal: 0.5, lively: 0.9 };
const LEVEL: Record<Activity, number> = { quiet: 0.35, normal: 0.65, lively: 0.95 };
const VARIETY: Record<Activity, number> = { quiet: 1, normal: 3, lively: 4 };
const HAS_RAIN: Record<Activity, boolean> = { quiet: false, normal: true, lively: true };
const THANKS: Record<Activity, number> = { quiet: 2, normal: 12, lively: 28 };

export function presetMetrics(activity: Activity, memberTotal: number, streak: number): Metrics {
  const spreadRatio = SPREAD_RATIO[activity];
  const spread = Math.round(spreadRatio * memberTotal);
  const variety = VARIETY[activity];
  return {
    memberTotal,
    spread,
    spreadRatio: memberTotal > 0 ? spread / memberTotal : spreadRatio,
    streak,
    level: LEVEL[activity],
    variety,
    weatherBreakdown: {
      sun: variety >= 1 ? 1 : 0,
      cloud: variety >= 2 ? 1 : 0,
      rain: variety >= 3 ? 1 : 0,
      tired: variety >= 4 ? 1 : 0,
    },
    hasRain: HAS_RAIN[activity],
    thanks: THANKS[activity],
  };
}
