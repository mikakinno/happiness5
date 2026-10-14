/* ============================================================
   lib/config.ts
   組織ごとに変わる値の出どころを、ここ1か所にまとめる。
   同じリポジトリを、組織ごとに別の Vercel プロジェクトとしてデプロイするため。

   既定値は「1つ目の組織で今使っている値」。環境変数を追加しなくても
   既存のデプロイは今までどおりに動く。
   ただしシートIDとフォームURLには既定値を置かない。
   設定を忘れたときに、別の組織のデータやフォームを黙って使ってしまわないようにするため。

   名前と説明の一覧は .env.example を参照。
   ============================================================ */

/* サーバー側だけで使う値。ブラウザのバンドルでは undefined になる（NEXT_PUBLIC_ が付いていないため）。 */
export const serverConfig = {
  mindSheetId: process.env.MIND_SHEET_ID!,
  thanksSheetId: process.env.THANKS_SHEET_ID!,
  rosterSheetId: process.env.ROSTER_SHEET_ID!,
  tabMind: process.env.TAB_MIND || "ハピネス",
  tabThanks: process.env.TAB_THANKS || "フォームの回答 1",
  tabRoster: process.env.TAB_ROSTER || "シート1",
  testNames: (process.env.TEST_NAMES || "").split(",").map((s) => s.trim()).filter(Boolean),

  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  // Vercel の環境変数では改行が \n のまま入るため復元する
  serviceAccountKey: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),

  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
};

/* ブラウザ側でも使う値。Next はビルド時に process.env.NEXT_PUBLIC_XXX と
   文字どおり書かれた箇所だけを置き換えるので、1つずつ直接書くこと（動的に引かない）。 */
export const publicConfig = {
  formMind: process.env.NEXT_PUBLIC_FORM_MIND,
  formThanks: process.env.NEXT_PUBLIC_FORM_THANKS,
  appName: process.env.NEXT_PUBLIC_APP_NAME || "みんなの水場",
  productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || "ハピネス5",
};
