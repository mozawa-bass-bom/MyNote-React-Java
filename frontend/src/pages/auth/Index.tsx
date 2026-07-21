import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auths/LoginForm";
import ParticleBackground from "../../components/index/Particle";
import { Button } from "../../ui/Button";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-dvh bg-white text-gray-900 overflow-hidden"
      style={{
        colorScheme: "light",
        ["--background" as string]: "0 0% 100%",
        ["--foreground" as string]: "222.2 84% 4.9%",
        ["--input-bg" as string]: "0 0% 100%",
      }}
    >
      {/* 背景パーティクル */}
      <ParticleBackground />

      {/* メインコンテンツ: relative z-10 を追加してパーティクルの上に表示 */}
      <div className="relative z-10 flex flex-row justify-between gap-2 w-full p-3 min-h-dvh">
        <div className="flex-1 min-w-0 flex flex-col justify-center items-center">
          <div className="flex flex-col gap-4">
            <h1 className="text-6xl font-bold">MyNote</h1>
            <p className="text-sm text-gray-500">自分だけのノートブック</p>
            <p>
              MyNoteは、自分だけのノートブックを作成できるサービスです。
              <br />
              PDFや画像を取り込み内容をまとめたり、会議や授業の準備に役立ちます。
            </p>
          </div>
        </div>
        <div className="w-[500px] shrink-0 flex justify-center items-center">
          {/* フォーム側のカード背景に bg-white / backdrop-blur を指定するとパーティクルと重なっても綺麗に見えます */}
          <div className="flex flex-col m-5 p-4 w-full border border-gray-100 bg-white/90 backdrop-blur-sm rounded-2xl h-[80%] min-h-[35rem] justify-center shadow-md">
            <LoginForm />

            <div className="flex w-full mt-4 gap-4">
              <Button
                type="button"
                variant="black"
                fullWidth
                onClick={() => navigate('/Register')}
              >
                新規登録
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
