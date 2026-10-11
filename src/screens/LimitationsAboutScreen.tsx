import React from 'react';
import {
  AlertTriangle,
  Info,
  ShieldAlert,
  Battery,
  Radio,
  FileCode2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';

interface LimitationsAboutScreenProps {
  onNavigateToCodeViewer: () => void;
}

export const LimitationsAboutScreen: React.FC<LimitationsAboutScreenProps> = ({
  onNavigateToCodeViewer,
}) => {
  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-lg mx-auto space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-white">Known Limitations & Truthful Ethics</h1>
        <p className="text-xs text-slate-400">
          Honest engineering facts on real-world offline BLE mesh reliability
        </p>
      </div>

      {/* Core Non-Negotiable Rule Card */}
      <GlassCard glow="pink" className="p-4 bg-rose-950/25 border-rose-500/30">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-pink-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Truthful Delivery Principle</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Suraksha Mesh will <strong>never falsely report</strong> that emergency police (112), paramedics, or trusted contacts have received an alert unless an authenticated acknowledgement packet is cryptographically verified back through the mesh return route.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Hardware & OS Limitations */}
      <div className="space-y-3">
        <GlassCard glow="blue" className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Android OEM Background Battery Restrictions
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Certain phone manufacturers (Xiaomi/MIUI, Samsung OneUI, OnePlus/OxygenOS) enforce aggressive task killers that may throttle or freeze background BLE scanning when the screen remains off for extended periods. Users must grant "Unrestricted Battery" in OS app settings.
          </p>
        </GlassCard>

        <GlassCard glow="none" className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Radio Physics & Physical Range
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Bluetooth Low Energy operating on 2.4 GHz experiences signal attenuation through thick concrete walls, basements, and heavy metal subway cars. Optimal open-air range is 15–35 meters between peer hops.
          </p>
        </GlassCard>

        <GlassCard glow="none" className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Safe-Haven Verification Staleness
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Safe-Haven directories are preloaded and cached locally. Real-world operating hours, temporary gate closures, or staffing rotations may vary. The app displays verification timestamps and uncertainty warnings on every safe haven card.
          </p>
        </GlassCard>
      </div>

      {/* Engineering Feature Status Matrix */}
      <GlassCard glow="none" className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          MVP Feature Implementation Audit
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="text-slate-300">Offline Emergency SOS (Room DB)</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
            </span>
          </div>

          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="text-slate-300">BLE 128-bit Advertiser & GATT Protocol</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
            </span>
          </div>

          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="text-slate-300">Consent-based 3-Hop Relay & Loop Guard</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
            </span>
          </div>

          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="text-slate-300">Truthful Delivery Verification Timeline</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
            </span>
          </div>

          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="text-slate-300">Real Geographic Map & MBTiles Cache</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
            </span>
          </div>

          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="text-slate-300">Verified Safe-Haven Network & Check-In</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
            </span>
          </div>

          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="text-slate-300">Discreet Mode & Duress Screen</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Direct Satellite Uplink (Iridium/NTN)</span>
            <span className="flex items-center gap-1 text-slate-400 font-bold">
              <HelpCircle className="w-3.5 h-3.5" /> Phase 2 Roadmap
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Codebase Explorer Link */}
      <GlassButton
        variant="primary-gradient"
        size="md"
        fullWidth
        onClick={onNavigateToCodeViewer}
        icon={<FileCode2 className="w-4 h-4" />}
      >
        Explore Native Kotlin Android Architecture
      </GlassButton>
    </div>
  );
};
