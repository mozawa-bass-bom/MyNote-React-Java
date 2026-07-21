import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import customAxios, { getOk } from "../../helpers/CustomAxios";
import { Button } from "../../ui/Button";
import { Input, type InputProps } from "../../ui/Input";

type Availability = { userNameAvailable?: boolean; emailAvailable?: boolean };
type Form = {
  userName: string;
  email: string;
  password: string;
  password2: string;
};

// 🌟 このファイル専用のステータス〇 + エラー時吹き出し付きInputコンポーネント
interface PopupInputProps extends InputProps {
  status?: "none" | "checking" | "success" | "error";
  errorMessage?: string;
}

function PopupInput({
  status = "none",
  errorMessage,
  label,
  id,
  ...props
}: PopupInputProps) {
  const inputId = id || props.name;

  return (
    <div className="relative w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {/* インプット本体 */}
        <Input id={inputId} className="pr-10" {...props} />

        {/* 右側に配置するステータスアイコン (〇) */}
        {status !== "none" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {status === "checking" && (
              <span
                className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"
                title="確認中…"
              />
            )}
            {status === "success" && (
              <span
                className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm"
                title="利用可能"
              />
            )}
            {status === "error" && (
              <div className="relative group">
                {/* エラー時の赤〇 */}
                <span className="w-3.5 h-3.5 rounded-full bg-destructive flex items-center justify-center text-[10px] text-white font-bold cursor-pointer">
                  !
                </span>

                {/* 〇の上にフワッと出る吹き出し */}
                {errorMessage && (
                  <div
                    role="tooltip"
                    className="absolute right-0 bottom-full mb-2 z-50 px-2.5 py-1 text-xs font-medium rounded shadow-md bg-destructive text-destructive-foreground border border-destructive whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none"
                  >
                    {errorMessage}
                    {/* 吹き出しの三角矢印（〇を指す） */}
                    <div className="absolute right-1.5 -bottom-1 w-2 h-2 rotate-45 bg-destructive border-r border-b border-destructive" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterForm() {
  const [f, setF] = useState<Form>({
    userName: "",
    email: "",
    password: "",
    password2: "",
  });
  const [availability, setAvailability] = useState<Availability>({});
  const [checking, setChecking] = useState<{
    userName?: boolean;
    email?: boolean;
  }>({});
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const navigate = useNavigate();

  const latestUserName = useRef("");
  const latestEmail = useRef("");

  const onChange =
    (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setF((p) => ({ ...p, [k]: v }));
      setIsError(null);
      if (k === "userName")
        setAvailability((p) => ({ ...p, userNameAvailable: undefined }));
      if (k === "email")
        setAvailability((p) => ({ ...p, emailAvailable: undefined }));
    };

  const checkUserNameOnBlur = async () => {
    const v = f.userName.trim();
    latestUserName.current = v;
    if (!v) {
      setAvailability((p) => ({ ...p, userNameAvailable: undefined }));
      return;
    }
    setChecking((p) => ({ ...p, userName: true }));
    try {
      const res = await getOk<{ userNameAvailable: boolean }>(
        "/auth/availability/username",
        {
          params: { value: v },
        } as any,
      );
      if (latestUserName.current === v)
        setAvailability((p) => ({
          ...p,
          userNameAvailable: res.userNameAvailable,
        }));
    } finally {
      setChecking((p) => ({ ...p, userName: false }));
    }
  };

  const checkEmailOnBlur = async () => {
    const v = f.email.trim().toLowerCase();
    latestEmail.current = v;
    if (!v) {
      setAvailability((p) => ({ ...p, emailAvailable: undefined }));
      return;
    }
    setChecking((p) => ({ ...p, email: true }));
    try {
      const res = await getOk<{ emailAvailable: boolean }>(
        "/auth/availability/email",
        { params: { value: v } } as any,
      );
      if (latestEmail.current === v)
        setAvailability((p) => ({ ...p, emailAvailable: res.emailAvailable }));
    } finally {
      setChecking((p) => ({ ...p, email: false }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setIsError(null);

    const userName = f.userName.trim();
    const email = f.email.trim().toLowerCase();
    const pass = f.password;
    const pass2 = f.password2;

    if (!userName || !email || !pass) {
      setIsError("未入力の項目があります。");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setIsError("メールアドレスの形式が正しくありません。");
      return;
    }
    if (pass !== pass2) {
      setIsError("パスワード（再入力）が一致しません。");
      return;
    }

    setIsPending(true);

    try {
      const res = await customAxios.post("/auth/register", {
        userName,
        password: pass,
        email,
      });
      if (res.status === 201) navigate("/", { replace: true });
      else setIsError("登録に失敗しました。");
    } catch {
      setIsError("登録処理中にエラーが発生しました。");
    } finally {
      setIsPending(false);
    }
  };

  // 🌟 ステータス判定ヘルパー
  const getUserNameState = (): {
    status: "none" | "checking" | "success" | "error";
    errorMessage?: string;
  } => {
    if (checking.userName) return { status: "checking" };
    if (availability.userNameAvailable === true) return { status: "success" };
    if (availability.userNameAvailable === false)
      return { status: "error", errorMessage: "既に使われています" };
    return { status: "none" };
  };

  const getEmailState = (): {
    status: "none" | "checking" | "success" | "error";
    errorMessage?: string;
  } => {
    if (checking.email) return { status: "checking" };
    if (availability.emailAvailable === true) return { status: "success" };
    if (availability.emailAvailable === false)
      return { status: "error", errorMessage: "既に使われています" };
    return { status: "none" };
  };

  const userNameState = getUserNameState();
  const emailState = getEmailState();

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative mt-6">
        {isError && (
          <div
            role="alert"
            className="absolute -top-16 left-0 right-0 p-3 text-xs text-center text-destructive-foreground bg-destructive/95 rounded shadow-sm border border-destructive animate-in fade-in slide-in-from-bottom-1 pointer-events-none"
          >
            {isError}
          </div>
        )}

        <div className="space-y-4">
          <PopupInput
            label="ユーザー名"
            type="text"
            value={f.userName}
            onChange={onChange("userName")}
            onBlur={checkUserNameOnBlur}
            autoComplete="username"
            disabled={isPending}
            fullWidth
            status={userNameState.status}
            errorMessage={userNameState.errorMessage}
          />

          <PopupInput
            label="メールアドレス"
            type="email"
            value={f.email}
            onChange={onChange("email")}
            onBlur={checkEmailOnBlur}
            autoComplete="email"
            disabled={isPending}
            fullWidth
            status={emailState.status}
            errorMessage={emailState.errorMessage}
          />

          <PopupInput
            label="パスワード"
            type="password"
            value={f.password}
            onChange={onChange("password")}
            autoComplete="new-password"
            disabled={isPending}
            fullWidth
          />

          <PopupInput
            label="パスワード（再入力）"
            type="password"
            value={f.password2}
            onChange={onChange("password2")}
            autoComplete="new-password"
            disabled={isPending}
            fullWidth
          />
        </div>

        <div className="flex w-full mt-6 gap-4">
          <Button
            type="submit"
            variant="primary"
            className="flex-1 text-sm py-2"
            disabled={isPending}
          >
            {isPending ? "登録中…" : "登録する"}
          </Button>
          <Link
            to="/"
            className="flex-1 px-3 py-2 rounded border border-input hover:bg-muted transition-colors text-sm text-center flex items-center justify-center font-medium"
          >
            ログインへ戻る
          </Link>
        </div>
      </div>
    </form>
  );
}
