/* ============================================================
   lib/sheets.ts
   Google Sheets の読み取りだけを担当する層。
   計算は一切しない。列の位置が変わったらここだけ直す。
   ============================================================ */

import { google } from "googleapis";
import { parseSheetDate, toWeatherKey, type MindRow, type ThanksRow } from "./waterhole";

/* ------------------------------------------------------------
   .env.local

   GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   HAPPINESS_SHEET_ID=1AbC...
   ROSTER_SHEET_ID=1DeF...          # 名簿が別ファイルの場合。同一なら省略可
   TAB_MIND=マインド
   TAB_THANKS=ありがとうカード
   TAB_ROSTER=メンバー名簿
   TEST_NAMES=テスト太郎,いしばしまりこ
   ------------------------------------------------------------ */

const SHEET_ID = process.env.HAPPINESS_SHEET_ID!;
const ROSTER_ID = process.env.ROSTER_SHEET_ID || SHEET_ID;
const TAB_MIND = process.env.TAB_MIND || "マインド";
const TAB_THANKS = process.env.TAB_THANKS || "ありがとうカード";
const TAB_ROSTER = process.env.TAB_ROSTER || "メンバー名簿";

const TEST_NAMES = new Set(
  (process.env.TEST_NAMES || "").split(",").map((s) => s.trim()).filter(Boolean)
);

function sheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // Vercel の環境変数では改行が \n のまま入るため復元する
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

async function readTable(spreadsheetId: string, range: string): Promise<string[][]> {
  const api = sheetsClient();
  const res = await api.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "FORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
  const rows = (res.data.values ?? []) as string[][];
  return rows.slice(1); // 1行目はヘッダー
}

const isTest = (name: string) => TEST_NAMES.has((name || "").trim());

/* ------------------------------------------------------------
   メンバー名簿
   A=氏名  B=メールアドレス  C=種別  D=ステータス
   ------------------------------------------------------------ */
export type Member = { name: string; email: string; kind: string; status: string };

export async function fetchRoster(): Promise<Member[]> {
  const rows = await readTable(ROSTER_ID, `${TAB_ROSTER}!A:D`);
  return rows
    .map((r) => ({
      name: (r[0] || "").trim(),
      email: (r[1] || "").trim().toLowerCase(),
      kind: (r[2] || "").trim(),
      status: (r[3] || "").trim(),
    }))
    .filter((m) => m.name && !isTest(m.name));
}

/* 在籍しているメンバーだけを数える。ステータスが空欄なら在籍扱い。 */
export function activeMembers(roster: Member[]): Member[] {
  return roster.filter((m) => !/退|停止|無効|休/.test(m.status));
}

export function nameByEmail(roster: Member[], email: string | null | undefined): string | null {
  if (!email) return null;
  const hit = roster.find((m) => m.email === email.trim().toLowerCase());
  return hit ? hit.name : null;
}

/* ------------------------------------------------------------
   マインド
   A=タイムスタンプ  B=名前  C=心のお天気  D=コメント
   ※ 歩数・肝臓など後続列がある場合も、ここでは A:D だけ読む
   ------------------------------------------------------------ */
export async function fetchMinds(): Promise<MindRow[]> {
  const rows = await readTable(SHEET_ID, `${TAB_MIND}!A:D`);
  return rows
    .map((r) => {
      const at = parseSheetDate(r[0]);
      const name = (r[1] || "").trim();
      if (!at || !name) return null;
      return { at, name, weather: toWeatherKey(r[2]), comment: (r[3] || "").trim() };
    })
    .filter((r): r is MindRow => r !== null && !isTest(r.name));
}

/* ------------------------------------------------------------
   ありがとうカード
   A=タイムスタンプ  B=あなたの名前  C=送る相手の名前
   D=クレド  E=想い  F=メッセージ
   ------------------------------------------------------------ */
export async function fetchThanks(): Promise<ThanksRow[]> {
  const rows = await readTable(SHEET_ID, `${TAB_THANKS}!A:F`);
  return rows
    .map((r) => {
      const at = parseSheetDate(r[0]);
      const from = (r[1] || "").trim();
      const to = (r[2] || "").trim();
      if (!at || !from || !to) return null;
      return {
        at,
        from,
        to,
        credo: (r[3] || "").trim(),
        // E列「想い」は本人の内心のメモなので画面には出さない。F列だけを表示する。
        message: (r[5] || "").trim(),
      };
    })
    .filter((r): r is ThanksRow => r !== null && !isTest(r.from) && !isTest(r.to));
}
