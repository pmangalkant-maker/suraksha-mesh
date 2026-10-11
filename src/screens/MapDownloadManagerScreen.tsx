import React, { useState } from 'react';
import {
  Download,
  Trash2,
  HardDrive,
  CheckCircle2,
  WifiOff,
  Plane,
  ArrowLeft,
  RotateCw,
  Layers,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassBadge } from '../components/glass/GlassBadge';
import { MapRegionPack } from '../types';

interface MapDownloadManagerScreenProps {
  packs: MapRegionPack[];
  onDownloadPack: (packId: string) => void;
  onDeletePack: (packId: string) => void;
  isAirplaneMode: boolean;
  onToggleAirplaneMode: () => void;
  onBack: () => void;
}

export const MapDownloadManagerScreen: React.FC<MapDownloadManagerScreenProps> = ({
  packs,
  onDownloadPack,
  onDeletePack,
  isAirplaneMode,
  onToggleAirplaneMode,
  onBack,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const totalStorageMb = packs
    .filter((p) => p.isDownloaded)
    .reduce((acc, p) => acc + p.sizeMb, 0);

  const handleDownload = (packId: string) => {
    setDownloadingId(packId);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        setDownloadingId(null);
        onDownloadPack(packId);
      }
    }, 400);
  };

  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-lg mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold backdrop-blur-md border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Map
        </button>
        <span className="text-xs font-bold text-pink-400 font-mono">
          MBTiles Local Engine
        </span>
      </div>

      <div>
        <h1 className="text-lg font-extrabold text-white">Offline Map Packs</h1>
        <p className="text-xs text-slate-400">
          Download vector tiles and landmarks to navigate without cellular data
        </p>
      </div>

      {/* Storage and Airplane Mode Test Card */}
      <GlassCard glow="blue" className="p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold text-white">Local Device Storage</span>
          </div>
          <span className="text-xs font-mono font-bold text-pink-300">
            {totalStorageMb.toFixed(1)} MB Used
          </span>
        </div>

        {/* Airplane Mode Offline Testing Simulator */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-blue-400/20 flex items-center justify-between">
          <div className="flex items-start gap-2.5">
            <Plane
              className={`w-4 h-4 mt-0.5 ${
                isAirplaneMode ? 'text-amber-400' : 'text-slate-400'
              }`}
            />
            <div>
              <h4 className="text-xs font-bold text-white">Simulate Airplane / Zero Data</h4>
              <p className="text-[11px] text-slate-400">
                Forces map to render strictly from cached local tiles.
              </p>
            </div>
          </div>
          <button
            onClick={onToggleAirplaneMode}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              isAirplaneMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : 'bg-white/10 text-slate-300 border-white/20'
            }`}
          >
            {isAirplaneMode ? 'Simulating Offline' : 'Online Mode'}
          </button>
        </div>
      </GlassCard>

      {/* Regional Packs List */}
      <div className="space-y-3">
        {packs.map((pack) => (
          <GlassCard key={pack.regionId} glow="none" className="p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{pack.name}</h3>
                  {pack.isDownloaded && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Cached
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{pack.zoomLevels}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                  <span>Size: {pack.sizeMb} MB</span>
                  <span>·</span>
                  <span>{pack.tileCount.toLocaleString()} tiles</span>
                  {pack.lastDownloadedAt && (
                    <>
                      <span>·</span>
                      <span>Cached: {pack.lastDownloadedAt}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="shrink-0">
                {pack.isDownloaded ? (
                  <button
                    onClick={() => onDeletePack(pack.regionId)}
                    title="Delete downloaded map pack"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <GlassButton
                    variant="pink"
                    size="sm"
                    disabled={downloadingId === pack.regionId}
                    onClick={() => handleDownload(pack.regionId)}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    {downloadingId === pack.regionId ? 'Downloading...' : 'Download'}
                  </GlassButton>
                )}
              </div>
            </div>

            {/* Simulated download progress bar */}
            {downloadingId === pack.regionId && (
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-blue-500 h-1.5 rounded-full animate-pulse w-3/4" />
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
