/* ============================================================
   pages/api/waterhole.ts

   GET /api/waterhole
     → 水場の全状態を返す。フロントは受け取って描くだけ。

   個人に依存するのは todayPosted の1項目だけ。
   それ以外は全メンバーが同じ値を見る（ひとつの場であるため）。
   ============================================================ */

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { fetchMinds, fetchThanks, fetchRoster, activeMembers, nameByEmail } from "../../lib/sheets";
import {
  computeMetrics, resolveFauna, absentHints, timeBand, ymdJst,
  computeGreen, totalWalkedKm,
  WEATHER_LABEL, type Metrics, type PresentFauna, type AbsentFauna, type Green,
} from "../../lib/waterhole";

const DIARY_DAYS = 7;
const CACHE_MS = 60_000;

export type DiaryEntry =
  | { type: "mind"; at: string; name: string; weather: string | null; weatherLabel: string | null; comment: string }
  | { type: "thanks"; at: string; from: string; to: string; credo: string; message: string };

export type WaterholeResponse = {
  asOf: string;
  band: "dawn" | "day" | "dusk" | "night";
  metrics: Metrics;
  green: Green;
  totalKm: number;
  fauna: { present: PresentFauna[]; absent: AbsentFauna[]; hints: AbsentFauna[] };
  diary: { date: string; entries: DiaryEntry[] }[];
  viewer: { name: string | null; todayPosted: boolean };
};

/* 場の状態は全員で共通なので、プロセス内に1つだけ持てばよい。
   Sheets API のクォータ対策も兼ねる。 */
type Shared = Omit<WaterholeResponse, "viewer"> & { todayNames: Set<string> };
let cache: { at: number; data: Shared } | null = null;

async function buildShared(): Promise<Shared> {
  const now = new Date();
  const [minds, thanks, roster] = await Promise.all([fetchMinds(), fetchThanks(), fetchRoster()]);

  const memberTotal = activeMembers(roster).length;
  const metrics = computeMetrics(minds, thanks, memberTotal, now);
  const band = timeBand(now);
  const { present, absent } = resolveFauna(metrics, band, now);

  // 緑は累積（全期間）。computeMetrics のような直近7日・30日の窓は掛けない。
  const green = computeGreen(minds, thanks);
  const totalKm = totalWalkedKm(minds);

  /* 日誌：直近7日。日付は新しい順、日の中は古い順に並べる */
  const today = ymdJst(now);
  const from = ymdJst(new Date(new Date(`${today}T12:00:00+09:00`).getTime() - (DIARY_DAYS - 1) * 86400000));
  const buckets = new Map<string, DiaryEntry[]>();
  const push = (d: string, e: DiaryEntry) => {
    if (!buckets.has(d)) buckets.set(d, []);
    buckets.get(d)!.push(e);
  };

  minds.forEach((m) => {
    const d = ymdJst(m.at);
    if (d < from) return;
    push(d, {
      type: "mind",
      at: m.at.toISOString(),
      name: m.name,
      weather: m.weather,
      weatherLabel: m.weather ? WEATHER_LABEL[m.weather] : null,
      comment: m.comment,
    });
  });
  thanks.forEach((t) => {
    const d = ymdJst(t.at);
    if (d < from) return;
    push(d, { type: "thanks", at: t.at.toISOString(), from: t.from, to: t.to, credo: t.credo, message: t.message });
  });

  const diary = Array.from(buckets.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, entries]) => ({
      date,
      entries: entries.sort((a, b) => (a.at < b.at ? -1 : 1)),
    }));

  const todayNames = new Set(minds.filter((m) => ymdJst(m.at) === today).map((m) => m.name));

  return {
    asOf: now.toISOString(),
    band,
    metrics,
    green,
    totalKm,
    fauna: { present, absent, hints: absentHints(metrics, absent) },
    diary,
    todayNames,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) return res.status(401).json({ error: "unauthenticated" });

  try {
    if (!cache || Date.now() - cache.at > CACHE_MS || req.query.fresh === "1") {
      cache = { at: Date.now(), data: await buildShared() };
    }
    const { todayNames, ...shared } = cache.data;

    const roster = await fetchRoster();
    const name = nameByEmail(roster, email);

    const body: WaterholeResponse = {
      ...shared,
      viewer: { name, todayPosted: !!name && todayNames.has(name) },
    };

    // 個人依存の項目を含むので共有キャッシュには載せない
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).json(body);
  } catch (e) {
    console.error("[waterhole]", e);
    return res.status(500).json({ error: "sheet_read_failed" });
  }
}
