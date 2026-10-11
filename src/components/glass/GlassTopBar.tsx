import React from 'react';
import { ArrowLeft, Bluetooth, MapPin, BatteryMedium, ShieldAlert, Sparkles } from 'lucide-react';
import { ScreenId } from '../../types';

interface GlassTopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onTriggerDiscreet?: () => void;
  bleActive?: boolean;
  gpsActive?: boolean;
  batteryLevel?: number;
  rightAction?: React.ReactNode;
}

export const GlassTopBar: React.FC<GlassTopBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  onTriggerDiscreet,
  bleActive = true,
  gpsActive = true,
  batteryLevel = 88,
  rightAction,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 backdrop-blur-xl bg-slate-950/70 border-b border-blue-500/20 shadow-md">
      <div className="flex items-center justify-between gap-3">
        {/* Left slot: Back or Brand Icon */}
        <div className="flex items-center gap-2 shrink-0">
          {showBack ? (
            <button
              onClick={onBack}
              aria-label="Go Back"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-pink-300 border border-pink-400/30 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-blue-600 flex items-center justify-center shadow-md shadow-pink-500/20 border border-white/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
          )}

          <div>
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-pink-300 via-rose-200 to-blue-300 bg-clip-text text-transparent truncate max-w-[170px] sm:max-w-xs">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[170px]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center / Right status chips and action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Hardware status indicators */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-400/20 text-[11px] text-slate-300">
            <span
              className={`flex items-center gap-1 ${
                bleActive ? 'text-blue-400' : 'text-slate-500'
              }`}
              title={bleActive ? 'BLE Mesh Active' : 'Bluetooth Disabled'}
            >
              <Bluetooth className="w-3.5 h-3.5" />
              <span className="font-semibold">BLE</span>
            </span>
            <span className="text-slate-600">·</span>
            <span
              className={`flex items-center gap-1 ${
                gpsActive ? 'text-pink-400' : 'text-slate-500'
              }`}
              title={gpsActive ? 'GPS Fixed' : 'No GPS Fix'}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-semibold">GPS</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-slate-300">
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
              <span>{batteryLevel}%</span>
            </span>
          </div>

          {/* Discreet mode button */}
          {onTriggerDiscreet && (
            <button
              onClick={onTriggerDiscreet}
              title="Discreet Mode (Duress / Stealth Screen)"
              className="px-2.5 py-1.5 rounded-xl bg-pink-950/30 hover:bg-pink-900/40 border border-pink-400/30 text-pink-300 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Discreet</span>
            </button>
          )}

          {rightAction}
        </div>
      </div>
    </header>
  );
};
