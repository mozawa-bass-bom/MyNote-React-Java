// components/ui/ToastHost.tsx
import { useAtomValue, useSetAtom } from 'jotai';
import { toastsAtom, removeToastAtom } from '../states/ToastAtom';

const ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const COLORS = {
  success: {
    border: 'border-emerald-400/40',
    bg: 'bg-emerald-500/10',
    icon: 'bg-emerald-500 text-white',
    bar: 'bg-emerald-500',
  },
  error: {
    border: 'border-red-400/40',
    bg: 'bg-red-500/10',
    icon: 'bg-red-500 text-white',
    bar: 'bg-red-500',
  },
  info: {
    border: 'border-sky-400/40',
    bg: 'bg-sky-500/10',
    icon: 'bg-sky-500 text-white',
    bar: 'bg-sky-500',
  },
  warning: {
    border: 'border-amber-400/40',
    bg: 'bg-amber-500/10',
    icon: 'bg-amber-500 text-white',
    bar: 'bg-amber-500',
  },
};

export default function ToastHost() {
  const toasts = useAtomValue(toastsAtom);
  const remove = useSetAtom(removeToastAtom);

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex w-80 max-w-[90vw] flex-col-reverse gap-2 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t) => {
        const c = COLORS[t.type] ?? COLORS.info;
        return (
          <div
            key={t.id}
            className={[
              'pointer-events-auto rounded-xl border shadow-xl backdrop-blur-sm overflow-hidden',
              'transition-all duration-350 ease-in-out',
              c.border,
              c.bg,
              t.fadingOut
                ? 'opacity-0 translate-y-2 scale-95'
                : 'opacity-100 translate-y-0 scale-100',
            ].join(' ')}
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              {/* アイコン */}
              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${c.icon}`}>
                {ICONS[t.type]}
              </span>

              {/* メッセージ */}
              <div className="flex-1 text-sm font-medium text-foreground leading-snug">
                {t.message}
              </div>

              {/* 閉じるボタン */}
              <button
                onClick={() => remove(t.id)}
                className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs text-muted-foreground hover:bg-foreground/10 transition-colors"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
