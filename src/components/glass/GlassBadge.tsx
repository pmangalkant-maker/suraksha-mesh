import React from 'react';

interface GlassBadgeProps {
  label: string;
  variant?: 'pink' | 'blue' | 'success' | 'warning' | 'danger' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  label,
  variant = 'blue',
  icon,
  className = '',
}) => {
  const styles = {
    pink: 'bg-pink-500/15 text-pink-300 border-pink-400/30',
    blue: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    danger: 'bg-red-500/15 text-red-300 border-red-400/30',
    neutral: 'bg-slate-700/30 text-slate-300 border-slate-600/30',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border backdrop-blur-md select-none ${styles} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </span>
  );
};
