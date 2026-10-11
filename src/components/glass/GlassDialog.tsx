import React from 'react';
import { X } from 'lucide-react';

interface GlassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const GlassDialog: React.FC<GlassDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Body */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900/90 border border-blue-400/30 p-6 shadow-2xl backdrop-blur-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
            {description && (
              <p className="text-xs text-slate-300 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};
