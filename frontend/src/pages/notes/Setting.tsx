// src/pages/setting/Setting.tsx
import { Link } from "react-router-dom";
import DeleteAccountSection from "../../components/setting/DeleteAccountSection";
import { useTheme } from "../../ui/ThemeProvider";

export default function Setting() {
  const { theme, setTheme, customColors, setCustomColors } = useTheme();
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">設定</h1>

      <section className="rounded-xl border bg-background/70 shadow-sm">
        <div className="border-b p-4">
          <h2 className="text-lg font-medium">外観</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            アプリのカラーモードを選択します。
          </p>
        </div>
        <div className="p-4 flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === "light"}
              onChange={() => setTheme("light")}
              className="cursor-pointer"
            />
            <span>ライト</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === "dark"}
              onChange={() => setTheme("dark")}
              className="cursor-pointer"
            />
            <span>ダーク</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="custom"
              checked={theme === "custom"}
              onChange={() => setTheme("custom")}
              className="cursor-pointer"
            />
            <span>カスタム</span>
          </label>
        </div>

        {theme === "custom" && (
          <div className="border-t p-4 flex flex-col gap-4">
            <h3 className="text-sm font-medium">カスタムカラー設定</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                背景色:
                <input
                  type="color"
                  value={customColors.bg}
                  onChange={(e) => setCustomColors({ bg: e.target.value })}
                  className="cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                枠線色:
                <input
                  type="color"
                  value={customColors.border}
                  onChange={(e) => setCustomColors({ border: e.target.value })}
                  className="cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                文字色:
                <input
                  type="color"
                  value={customColors.font}
                  onChange={(e) => setCustomColors({ font: e.target.value })}
                  className="cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                フォーム背景色:
                <input
                  type="color"
                  value={customColors.inputBg}
                  onChange={(e) => setCustomColors({ inputBg: e.target.value })}
                  className="cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}
      </section>

      {/* <section className="rounded-xl border bg-background/70 shadow-sm">
        <div className="border-b p-4">
          <h2 className="text-lg font-medium">お問い合わせ</h2>
          <p className="mt-1 text-sm text-muted-foreground">不具合報告・機能要望・その他ご質問などがあればこちらから。</p>
        </div>
        <div className="p-4">
          <Link to="/contact">
            <button className="btn btn-primary">お問い合わせ</button>
          </Link>
        </div>
      </section> */}

      <DeleteAccountSection />
    </div>
  );
}
