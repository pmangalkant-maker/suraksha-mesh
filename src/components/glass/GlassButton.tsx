import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary-gradient' | 'pink' | 'blue' | 'emergency-red' | 'glass-outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'sos';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary-gradient',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl min-h-[36px]',
    md: 'px-4 py-2.5 text-sm font-semibold rounded-2xl min-h-[44px]',
    lg: 'px-6 py-3.5 text-base font-bold rounded-2xl min-h-[52px]',
    sos: 'w-44 h-44 rounded-full text-xl font-extrabold flex flex-col items-center justify-center shadow-2xl',
  }[size];

  const variantStyles = {
    'primary-gradient':
      'bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-400 hover:to-blue-500 text-white shadow-lg shadow-pink-500/25 border border-white/20 active:scale-[0.98]',
    pink: 'bg-pink-500/90 hover:bg-pink-400 text-white shadow-lg shadow-pink-500/20 border border-pink-300/30 active:scale-[0.98]',
    blue: 'bg-blue-600/90 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30 active:scale-[0.98]',
    'emergency-red':
      'bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-xl shadow-red-600/35 border border-red-400/40 active:scale-[0.97]',
    'glass-outline':
      'bg-white/10 hover:bg-white/15 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 text-slate-100 border border-blue-400/30 backdrop-blur-md shadow-sm active:scale-[0.98]',
    subtle:
      'bg-transparent hover:bg-white/10 dark:hover:bg-white/5 text-slate-300 hover:text-white border border-transparent active:scale-[0.98]',
  }[variant];

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer transition-all duration-200';

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap select-none ${sizeStyles} ${variantStyles} ${disabledStyles} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
