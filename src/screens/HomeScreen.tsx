import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  MapPin,
  BatteryMedium,
  CheckCircle2,
  AlertCircle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassBadge } from '../components/glass/GlassBadge';
import { GlassButton } from '../components/glass/GlassButton';
import { LocationMetadata, BlePeerNode, SafeHaven } from '../types';
import { GeoService } from '../services/geoService';
import { sounds } from '../services/soundService';

interface HomeScreenProps {
  location: LocationMetadata;
  bleActive: boolean;
  peers: BlePeerNode[];
  relayConsent: boolean;
  batteryLevel: number;
  nearestSafeHaven: SafeHaven | null;
  onTriggerSos: () => void;
  onNavigateToMap: () => void;
  onNavigateToDiagnostics: () => void;
  onNavigateToSafeHavens: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  location,
  bleActive,
  peers,
  relayConsent,
  batteryLevel,
  nearestSafeHaven,
  onTriggerSos,
  onNavigateToMap,
  onNavigateToDiagnostics,
  onNavigateToSafeHavens,
  soundEnabled,
  onToggleSound,
}) => {
  const [sosPressed, setSosPressed] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);

  // Hold-to-activate logic or immediate click
  useEffect(() => {
    let timer: any;
    if (sosPressed) {
      timer = setInterval(() => {
        setPressProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            onTriggerSos();
            return 100;
          }
          return prev + 12;
        });
      }, 50);
    } else {
      setPressProgress(0);
    }
    return () => clearInterval(timer);
  }, [sosPressed, onTriggerSos]);

  const activePeersCount = peers.filter((p) => p.isRelayConsented).length;

  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-lg mx-auto space-y-4">
      {/* Network & Safety Status Card */}
      <GlassCard glow="blue" className="p-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-white tracking-wide">
              SURAKSHA MESH MESH ACTIVE
            </span>
          </div>
          <button
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="p-1 rounded-lg bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-pink-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2.5">
          {/* BLE Node discovery metric */}
          <button
            onClick={onNavigateToDiagnostics}
            className="p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 border border-blue-400/20 text-left transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Radio className="w-3 h-3 text-blue-400" /> Nearby Radios
              </span>
              <span className="text-xs font-bold text-white font-mono">
                {activePeersCount} Active
              </span>
            </div>
            <p className="text-[10px] text-blue-300 mt-1 font-semibold truncate">
              {activePeersCount > 0 ? 'Mesh forwarding ready' : 'Local phone cache only'}
            </p>
          </button>

          {/* GPS Accuracy status */}
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-pink-400/20 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-pink-400" /> GPS Precision
              </span>
              <span className="text-xs font-bold text-white font-mono">
                ±{location.accuracyMeters ?? 25}m
              </span>
            </div>
            <p className="text-[10px] text-pink-300 mt-1 font-semibold truncate">
              {location.isStale ? 'Warning: Stale GPS' : 'Real-time Fix'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Relay Forwarding:{' '}
            <strong className="text-slate-200">
              {relayConsent ? 'Enabled (3 Hops)' : 'Disabled'}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
            Battery: <strong className="text-slate-200">{batteryLevel}%</strong>
          </span>
        </div>
      </GlassCard>

      {/* Primary SOS Trigger Core Component */}
      <div className="flex flex-col items-center justify-center py-4 sm:py-6">
        <div className="relative flex items-center justify-center">
          {/* Pulsing outer aura ring */}
          <div className="absolute w-60 h-60 rounded-full bg-gradient-to-tr from-pink-500/20 via-rose-500/30 to-blue-500/20 animate-pulse blur-xl pointer-events-none" />

          {/* Outer ring for hold progress */}
          <div className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-full p-2 bg-gradient-to-tr from-pink-500/40 via-white/10 to-blue-500/40 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center">
            {/* Circular progress bar SVG */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="stroke-white/10 stroke-[6px] fill-transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                style={{
                  strokeDasharray: '320',
                  strokeDashoffset: `${320 - (320 * pressProgress) / 100}`,
                  transition: 'stroke-dashoffset 0.05s linear',
                }}
                className="stroke-pink-400 stroke-[7px] fill-transparent stroke-linecap-round"
              />
            </svg>

            {/* Main Interactive Button */}
            <button
              onMouseDown={() => {
                setSosPressed(true);
                sounds.playClick();
              }}
              onMouseUp={() => setSosPressed(false)}
              onMouseLeave={() => setSosPressed(false)}
              onTouchStart={() => {
                setSosPressed(true);
                sounds.playClick();
              }}
              onTouchEnd={() => setSosPressed(false)}
              onClick={() => {
                // If quick tap, trigger directly
                onTriggerSos();
              }}
              aria-label="Activate Emergency SOS"
              className="group relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-rose-600 via-pink-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 transition-all duration-200 flex flex-col items-center justify-center text-white shadow-2xl shadow-rose-600/50 border-2 border-white/30 cursor-pointer select-none"
            >
              {/* Inner glass highlight */}
              <div className="absolute inset-x-6 top-3 h-8 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none" />

              <Flame className="w-10 h-10 mb-1 text-white group-hover:scale-110 transition-transform animate-pulse" />
              <span className="text-3xl font-black tracking-wider text-white drop-shadow-md">
                SOS
              </span>
              <span className="text-[11px] font-bold text-rose-100 uppercase tracking-widest mt-1">
                Tap or Hold
              </span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-300 font-medium mt-4 max-w-xs">
          Instantly triggers 5-second countdown with loud/silent options, encrypted mesh beaconing, and GPS dispatch.
        </p>
      </div>

      {/* Honest Delivery Disclaimer Banner */}
      <GlassCard glow="none" className="p-3 bg-blue-950/30 border-blue-400/20">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-blue-300">Truthful Delivery Policy:</strong> Suraksha Mesh will never report that police (112) or helpers have received your distress call until an authentic cryptographic acknowledgement is received back.
          </p>
        </div>
      </GlassCard>

      {/* Quick Safe-Haven Map Shortcut */}
      {nearestSafeHaven && (
        <GlassCard glow="pink" className="p-4" onClick={onNavigateToSafeHavens} interactive>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider">
                    Nearest Safe Haven
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Open Now
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5 truncate max-w-[210px] sm:max-w-xs">
                  {nearestSafeHaven.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {GeoService.formatDistance(nearestSafeHaven.distanceMeters ?? 450)} · {nearestSafeHaven.address}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/10 text-pink-300 shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <GlassButton
          variant="glass-outline"
          size="md"
          fullWidth
          onClick={onNavigateToMap}
          icon={<Compass className="w-4 h-4 text-blue-400" />}
        >
          Offline Map
        </GlassButton>
        <GlassButton
          variant="glass-outline"
          size="md"
          fullWidth
          onClick={onNavigateToDiagnostics}
          icon={<Radio className="w-4 h-4 text-pink-400" />}
        >
          Mesh Radios ({activePeersCount})
        </GlassButton>
      </div>
    </div>
  );
};
