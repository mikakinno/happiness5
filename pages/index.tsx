// みんなの水場（ホーム画面）。
import { signIn, useSession } from "next-auth/react";
import MinnaNoMizuba from "../components/Waterhole";

export default function Home() {
  const { status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen" />;
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button
          onClick={() => signIn("google")}
          className="rounded-full px-6 py-3 text-sm text-white"
          style={{ background: "#5FA9BC" }}
        >
          Googleでログイン
        </button>
      </div>
    );
  }

  return <MinnaNoMizuba />;
}
