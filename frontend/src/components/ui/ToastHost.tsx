// components/ui/ToastHost.tsx
import { useAtomValue, useSetAtom } from 'jotai';
import { toastsAtom, removeToastAtom } from '../../states/ToastAtom';

export default function ToastHost() {
  const toasts = useAtomValue(toastsAtom);
  const remove = useSetAtom(removeToastAtom);

  return (
    <div
      className="fixed right-4 top-4 z-[9999] flex w-80 max-w-[90vw] flex-col gap-2"
      role="region"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            'rounded-xl border p-3 shadow-lg backdrop-blur',
            t.type === 'success' && 'border-green-200 bg-green-50',
            t.type === 'error' && 'border-red-200 bg-red-50',
            t.type === 'info' && 'border-blue-200 bg-blue-50',
            t.type === 'warning' && 'border-amber-200 bg-amber-50',
          ].join(' ')}
        >
          <div className="flex items-start gap-2">
            <div className="mt-0.5 text-sm text-gray-800">{t.message}</div>
            <button
              onClick={() => remove(t.id)}
              className="ml-auto inline-flex rounded p-1 hover:bg-black/5"
              aria-label="閉じる"
            ></button>
          </div>
        </div>
      ))}
    </div>
  );
}
