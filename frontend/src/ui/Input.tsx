import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, fullWidth = false, id, ...props }, ref) => {
    // 一意のIDを生成（ラベルとの紐付け用）
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    
    const baseInputClasses = 'bg-input-bg border rounded px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:bg-muted disabled:cursor-not-allowed';
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClasses = error ? 'border-destructive focus:ring-destructive' : 'border-input';
    
    const combinedClasses = `${baseInputClasses} ${errorClasses} ${widthClass} ${className}`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={combinedClasses} {...props} />
        {error && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
