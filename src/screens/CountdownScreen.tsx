import React, { useState, useEffect } from 'react';
import { AlertOctagon, Volume2, VolumeX, X, ShieldAlert, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { sounds } from '../services/soundService';

interface CountdownScreenProps {
  onCountdownComplete: (isSilent: boolean) => void;
  onCancel: () => void;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  onCountdownComplete,
  onCancel,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isSilent, setIsSilent] = useState(false);

  useEffect(() => {
    // Sound tick on each second
    if (!isSilent) {
      sounds.playCountdownTick(secondsLeft);
    }

    if (secondsLeft <= 0) {
      onCountdownComplete(isSilent);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isSilent, onCountdownComplete]);

  const handleCancelClick = () => {
    sounds.playCancelChime();
    onCancel();
  };

  return (
    <div className="min-h-full px-4 py-6 flex flex-col justify-between max-w-lg mx-auto bg-gradient-to-b from-red-950/40 via-slate-950 to-slate-950">
      {/* Top Bar for Countdown */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCancelClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold backdrop-blur-md border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel SOS
        </button>

        {/* Silent alert toggle */}
        <button
          onClick={() => setIsSilent(!isSilent)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition-all ${
            isSilent
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
              : 'bg-red-500/20 text-red-300 border-red-400/30'
          }`}
        >
          {isSilent ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isSilent ? 'Discreet / Silent Alert' : 'Siren Enabled'}</span>
        </button>
      </div>

      {/* Main Countdown Display */}
      <div className="flex flex-col items-center justify-center my-auto text-center py-6">
        <div className="relative flex items-center justify-center">
          {/* Pulsing red emergency glow */}
          <div className="absolute w-64 h-64 rounded-full bg-red-600/30 animate-ping duration-1000 blur-2xl pointer-events-none" />

          <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-full border-4 border-red-500/80 bg-gradient-to-br from-red-600 to-rose-900 shadow-2xl shadow-red-600/60 flex flex-col items-center justify-center text-white backdrop-blur-xl">
            <AlertOctagon className="w-10 h-10 text-red-200 animate-bounce mb-1" />
            <span className="text-6xl sm:text-7xl font-black font-mono tracking-tighter drop-shadow-lg">
              {secondsLeft}
            </span>
            <span className="text-[11px] font-bold text-red-200 uppercase tracking-widest mt-1">
              Seconds to Broadcast
            </span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white mt-6 tracking-tight">
          Broadcasting Emergency SOS
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xs mt-1.5 font-medium">
          Nearby phones and Safe Havens within 3 mesh hops will receive your GPS coordinates and profile.
        </p>
      </div>

      {/* Unmistakable Cancel Action */}
      <div className="space-y-3 pb-4">
        <button
          onClick={handleCancelClick}
          className="w-full py-4 px-6 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-98 text-white font-black text-base border-2 border-white/40 shadow-2xl backdrop-blur-2xl flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
        >
          <X className="w-6 h-6 text-red-400" />
          <span>CANCEL EMERGENCY (FALSE ALARM)</span>
        </button>

        <p className="text-center text-[11px] text-slate-400">
          Cancelling will abort BLE packet transmission immediately with no broadcast made.
        </p>
      </div>
    </div>
  );
};
