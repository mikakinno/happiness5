import { ymdJst, type TimeBand } from "../../lib/waterhole";

/* まめ（仙台弁の犬）ときなこ（関西弁の猫）のセリフ。
   投稿については何も言わない。風向き・水の澄み具合・泥の足あと・
   アカシアの影といった、土地の話だけをする。
   when : この状態のときだけ選ばれる（省略ならいつでも） */
export type TalkState = { spreadRatio: number; level: number; variety: number; time: TimeBand };

type Talk = { m: string; k: string; when?: (s: TalkState) => boolean };

export const TALKS: Talk[] = [
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

/* その日は何度開いても同じセリフになるよう、JST日付から決める
   （原則9：日替わりの演出は「その日は何度開いても同じ」であること）。 */
export function pickTalk(state: TalkState, now = new Date()): Talk {
  const seed = Number(ymdJst(now).replace(/-/g, ""));
  const ok = TALKS.filter((t) => !t.when || t.when(state));
  const pool = ok.length ? ok : TALKS;
  return pool[seed % pool.length];
}
