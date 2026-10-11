import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'pink' | 'blue' | 'red' | 'none';
  variant?: 'dark' | 'light' | 'auto';
  onClick?: () => void;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  variant = 'auto',
  onClick,
  interactive = false,
}) => {
  const glowClasses = {
    pink: 'glass-card-glow-pink hover:border-pink-400/50',
    blue: 'glass-card-glow-blue hover:border-blue-400/50',
    red: 'glass-card-glow-red hover:border-red-500/60',
    none: 'border-white/10 dark:border-blue-400/15',
  }[glow];

  const interactiveStyles = interactive || onClick
    ? 'cursor-pointer transition-all duration-200 active:scale-[0.99] hover:bg-white/10 dark:hover:bg-blue-950/40'
    : '';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border shadow-lg ${
        variant === 'light'
          ? 'bg-white/85 text-slate-900 border-pink-200/50 shadow-pink-900/5'
          : variant === 'dark'
          ? 'bg-slate-900/75 text-slate-100 border-blue-400/20 shadow-black/40'
          : 'bg-slate-900/75 dark:bg-slate-900/75 light:bg-white/85 text-slate-100 border-blue-400/20 shadow-black/40'
      } ${glowClasses} ${interactiveStyles} ${className}`}
    >
      {/* Subtle glass reflection highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {children}
    </div>
  );
};
