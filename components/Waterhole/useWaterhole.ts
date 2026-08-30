import { useCallback, useEffect, useRef, useState } from "react";
import type { WaterholeResponse } from "../../pages/api/waterhole";

export type WaterholeState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: WaterholeResponse };

export function useWaterhole() {
  const [state, setState] = useState<WaterholeState>({ status: "loading" });
  const inflight = useRef(false);

  const load = useCallback(async (fresh = false) => {
    if (inflight.current) return;
    inflight.current = true;
    try {
      const res = await fetch(`/api/waterhole${fresh ? "?fresh=1" : ""}`);
      if (!res.ok) {
        setState({ status: "error", message: `HTTP ${res.status}` });
        return;
      }
      const data = (await res.json()) as WaterholeResponse;
      setState({ status: "ready", data });
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : "unknown error" });
    } finally {
      inflight.current = false;
    }
  }, []);

  useEffect(() => {
    // 初回マウント時のfetch。setState は fetch 完了後に非同期で走るため、
    // レンダー中のカスケードにはならない（この警告は誤検知）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    /* フォーム投稿は別タブで開く運用なので、タブに戻ってきた瞬間
       （window の focus）に再取得する。「投稿したのに水場が変わらない」
       というがっかりを防ぐため。 */
    const onFocus = () => load(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  return { ...state, reload: load };
}
