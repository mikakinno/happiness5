import { useRef, useState } from "react";
import Link from "next/link";
import {
  resolveFauna, absentHints, GREEN_STAGE_THRESHOLDS, GREEN_STAGE_NAMES,
  type TimeBand, type Metrics,
} from "../../lib/waterhole";
import { useWaterhole } from "./useWaterhole";
import { presetMetrics, type Activity } from "./debugPresets";
import { pickTalk, type TalkState } from "./talks";
import { Waterhole } from "./Scene";
import { Drop, Stat, Toggle } from "./ui";
import { C, weatherUI, WHY_TEXT } from "./palette";
import type { DiaryEntry } from "../../pages/api/waterhole";
import { fmtDate, fmtStamp } from "./format";

const TIME_OPTS: [TimeBand, string][] = [["dawn", "朝"], ["day", "昼"], ["dusk", "夕"], ["night", "夜"]];
const ACTIVITY_OPTS: [Activity, string][] = [["quiet", "静か"], ["normal", "ふつう"], ["lively", "にぎやか"]];

const isDev = process.env.NODE_ENV === "development";

export default function MinnaNoMizuba() {
  const wh = useWaterhole();

  const [timeOverride, setTimeOverride] = useState<TimeBand | null>(null);
  const [activityOverride, setActivityOverride] = useState<Activity | null>(null);
  const [greenStageOverride, setGreenStageOverride] = useState<number | null>(null);
  const [ripples, setRipples] = useState<number[]>([]);
  const rid = useRef(0);

  const splash = () => {
    const id = ++rid.current;
    setRipples((r) => [...r, id]);
    setTimeout(() => setRipples((r) => r.filter((x) => x !== id)), 2100);
  };

  if (wh.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: C.inkSoft }}>
        読み込み中…
      </div>
    );
  }
  if (wh.status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: C.inkSoft }}>
        水場を読み込めませんでした（{wh.message}）
      </div>
    );
  }

  const { data } = wh;

  const band: TimeBand = timeOverride ?? data.band;
  const metrics: Metrics = activityOverride
    ? presetMetrics(activityOverride, data.metrics.memberTotal, data.metrics.streak)
    : data.metrics;
  const stage = greenStageOverride ?? data.green.stage;
  const overrideActive = timeOverride !== null || activityOverride !== null;

  const fauna = overrideActive
    ? (() => {
        const { present, absent } = resolveFauna(metrics, band);
        return { present, absent, hints: absentHints(metrics, absent) };
      })()
    : data.fauna;

  const stageProgress =
    greenStageOverride !== null
      ? 1
      : (() => {
          const cur = GREEN_STAGE_THRESHOLDS[stage];
          const next: number | undefined = GREEN_STAGE_THRESHOLDS[stage + 1];
          return next !== undefined ? (data.green.value - cur) / (next - cur) : 1;
        })();

  const talkState: TalkState = { spreadRatio: metrics.spreadRatio, level: metrics.level, variety: metrics.variety, time: band };
  const talk = pickTalk(talkState, new Date(data.asOf));

  return (
    <div style={{ background: C.paper, color: C.ink }} className="min-h-screen">
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="maru text-lg font-bold tracking-wide">みんなの水場</span>
            <span className="text-xs" style={{ color: C.inkSoft }}>ハピネス5</span>
          </div>
          <Link href="/report" className="text-sm px-3 py-1.5 rounded-full border" style={{ borderColor: C.line, color: C.inkSoft }}>レポート</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5">
        <section className="pt-5">
          <div className="rounded-2xl overflow-hidden border relative" style={{ borderColor: C.line }}>
            <Waterhole level={metrics.level} stage={stage} present={fauna.present} timeOfDay={band} ripples={ripples} onSplash={splash} />
            <div className="absolute top-3 left-4 text-[11px] tracking-wider" style={{ color: C.inkSoft }}>{fmtStamp(data.asOf)} の水場</div>
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
            {fauna.hints.length > 0 && (
              <ul className="mt-3 space-y-1">
                {fauna.hints.map((f) => (
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
          {data.viewer.todayPosted ? (
            <div className="rounded-xl px-5 py-4 flex items-center gap-3" style={{ background: C.mist }}>
              <Drop size={26} />
              <div>
                <div className="maru font-bold text-sm">今日の一滴は、もう水になりました</div>
                <div className="text-xs mt-0.5" style={{ color: C.inkSoft }}>また明日、ここで</div>
              </div>
            </div>
          ) : (
            <button onClick={splash} className="rounded-xl px-5 py-4 text-left text-white" style={{ background: C.water }}>
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
            <Stat label="今週きた人" value={metrics.spread} unit={`/ ${metrics.memberTotal}人`} bar={metrics.spreadRatio} note="集まる種の数が決まります" />
            <Stat label="水位" value={metrics.streak} unit="日ぶん" bar={metrics.level} note="カバとワニは水位が高い日だけ" />
            <Stat label="お天気の種類" value={metrics.variety} unit="/ 4" bar={metrics.variety / 4} note={metrics.variety >= 3 ? "臆病な生き物も降りてこられます" : "晴れに寄っています"} />
            <Stat label="めぐった感謝" value={metrics.thanks} unit="件" bar={Math.min(1, metrics.thanks / 40)} note="この30日ぶん" />
          </div>

          {/* 緑だけは累積で、減らない */}
          <div className="mt-3 rounded-xl border px-4 py-3.5" style={{ borderColor: C.line }}>
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <span className="text-xs" style={{ color: C.inkSoft }}>育った緑</span>
                <span className="maru text-lg font-bold ml-2">{GREEN_STAGE_NAMES[stage]}</span>
              </div>
              <span className="text-xs" style={{ color: C.inkSoft }}>
                みんなで歩いた距離　{Math.round(data.totalKm).toLocaleString()} km
              </span>
            </div>
            <div className="h-1.5 rounded-full mt-2.5 overflow-hidden" style={{ background: C.line }}>
              <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(1, stageProgress)) * 100}%`, background: C.acacia }} />
            </div>
            <p className="text-[10px] mt-2 leading-relaxed" style={{ color: C.inkSoft }}>
              みんなの投稿と歩数が、そのまま土地に積もっていきます。ここまで育った緑は、静かな週があっても減りません。
            </p>
          </div>
        </section>

        <section className="mt-9 pb-4">
          <h2 className="maru text-sm font-bold" style={{ color: C.inkSoft }}>水場の日誌</h2>
          <p className="text-xs mt-1 mb-4" style={{ color: C.inkSoft }}>どの行をタップしても、そのひとしずくが水面に落ちます</p>
          {data.diary.map(({ date, entries }) => (
            <div key={date} className="mb-7">
              <div className="flex items-center gap-3 mb-2">
                <span className="maru text-sm font-bold">{fmtDate(date)}</span>
                <span className="flex-1 h-px" style={{ background: C.line }} />
                <span className="flex gap-1">
                  {entries
                    .filter((e): e is Extract<DiaryEntry, { type: "mind" }> => e.type === "mind" && !!e.weather)
                    .map((e, k) => (
                      <span key={k} className="w-2 h-2 rounded-full" style={{ background: weatherUI(e.weather)?.color }} />
                    ))}
                </span>
              </div>
              <div className="space-y-0.5">
                {entries.map((e, i) => (
                  <div key={i} role="button" tabIndex={0} onClick={splash}
                    onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && splash()}
                    className="hit rounded-lg px-3 py-2.5 cursor-pointer">
                    {e.type === "mind" ? (
                      <div className="flex gap-3">
                        <span className="text-base leading-6 shrink-0">{weatherUI(e.weather)?.emoji ?? "・"}</span>
                        <div className="min-w-0">
                          <span className="maru text-sm font-bold">{e.name}</span>
                          {e.weatherLabel && <span className="text-xs ml-2" style={{ color: C.inkSoft }}>{e.weatherLabel}</span>}
                          {e.comment && <p className="text-sm mt-0.5 leading-relaxed">{e.comment}</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <span className="shrink-0 mt-0.5"><Drop size={18} /></span>
                        <div className="min-w-0">
                          <span className="maru text-sm font-bold">{e.from}</span>
                          <span className="text-xs mx-1.5" style={{ color: C.inkSoft }}>から</span>
                          <span className="maru text-sm font-bold">{e.to}</span>
                          <span className="text-xs ml-2 px-1.5 py-0.5 rounded" style={{ background: C.waterPale, color: "#357080" }}>{e.credo}</span>
                          <p className="text-sm mt-0.5 leading-relaxed">{e.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {isDev && (
          <section className="mb-10 rounded-xl p-4 text-xs" style={{ background: C.mist, color: C.inkSoft }}>
            <div className="mb-2 font-bold">モックアップ確認用（本番では出しません）</div>
            <div className="flex flex-wrap gap-4">
              <Toggle label="時刻" value={band} set={(v) => setTimeOverride(v)} opts={TIME_OPTS} />
              <Toggle
                label="活性度"
                value={activityOverride ?? "normal"}
                set={(v) => setActivityOverride(v)}
                opts={ACTIVITY_OPTS}
              />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className="shrink-0">緑の段階</span>
              <input type="range" min="0" max={GREEN_STAGE_NAMES.length - 1} value={stage}
                onChange={(e) => setGreenStageOverride(Number(e.target.value))} className="flex-1 max-w-xs" style={{ accentColor: C.acacia }} />
              <span className="maru shrink-0" style={{ color: C.ink }}>{GREEN_STAGE_NAMES[stage]}</span>
              {(timeOverride !== null || activityOverride !== null || greenStageOverride !== null) && (
                <button
                  className="text-[11px] underline shrink-0"
                  onClick={() => { setTimeOverride(null); setActivityOverride(null); setGreenStageOverride(null); }}
                >実データに戻す</button>
              )}
            </div>
            <p className="mt-2.5 leading-relaxed">
              時刻・活性度・緑の段階は、実データを上書きして見た目だけを確認するためのプレビューです。本番のメンバーには表示されません。
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
