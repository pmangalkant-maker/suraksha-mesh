import React from 'react';

interface GlassInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const GlassInputField: React.FC<GlassInputFieldProps> = ({
  label,
  helperText,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      <label className="block text-xs font-semibold text-slate-300 tracking-wide">
        {label}
      </label>
      <div className="relative rounded-xl overflow-hidden">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full py-2.5 bg-slate-900/60 border rounded-xl text-sm text-slate-100 placeholder-slate-500 backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 ${
            icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } ${
            error
              ? 'border-red-500/80 bg-red-950/20'
              : 'border-blue-400/20 hover:border-blue-400/40'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[11px] text-red-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
