// src/components/ui/Alert.tsx
import { X } from 'lucide-react';
import { useState, memo } from 'react';

type Variant = 'error' | 'success' | 'warning' | 'info';

const styles: Record<Variant, string> = {
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info: 'bg-info/10 text-info border-info/20',
};

type Props = {
  variant?: Variant;
  title?: string;
  message?: string;
  /** 子要素があれば message より優先して描画 */
  children?: React.ReactNode;
  /** ✕ボタンで閉じられるようにする */
  dismissible?: boolean;
  /** 既に閉じた状態でレンダしたい時（制御不要なら使わなくてOK） */
  defaultOpen?: boolean;
  className?: string;
};

function AlertImpl({
  variant = 'info',
  title,
  message,
  children,
  dismissible = false,
  defaultOpen = true,
  className = '',
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  if (!open) return null;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`border rounded-md px-3 py-2 flex items-start gap-2 ${styles[variant]} ${className}`}
    >
      {/* アイコン（適当に変えたければOK） */}
      <span className="mt-0.5">!</span>

      <div className="flex-1 text-sm">
        {title && <div className="font-medium mb-0.5">{title}</div>}
        {children ?? message}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="閉じる"
          className="opacity-70 hover:opacity-100"
        >
          <X size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}

export default memo(AlertImpl);
