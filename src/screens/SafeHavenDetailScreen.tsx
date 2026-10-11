import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Navigation,
  Compass,
  Building2,
  Video,
  UserCheck,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassBadge } from '../components/glass/GlassBadge';
import { GlassDialog } from '../components/glass/GlassDialog';
import { SafeHaven } from '../types';
import { GeoService } from '../services/geoService';

interface SafeHavenDetailScreenProps {
  haven: SafeHaven;
  onBack: () => void;
  onNavigateToMap: () => void;
}

export const SafeHavenDetailScreen: React.FC<SafeHavenDetailScreenProps> = ({
  haven,
  onBack,
  onNavigateToMap,
}) => {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);

  const handleSimulateCheckIn = () => {
    setCheckInDone(true);
    setTimeout(() => {
      setShowCheckInModal(false);
    }, 1500);
  };

  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-lg mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold backdrop-blur-md border border-white/20 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>
        <GlassBadge
          label={haven.isOpenNow ? 'Open Now' : 'Check Hours'}
          variant={haven.isOpenNow ? 'success' : 'warning'}
        />
      </div>

      {/* Main Haven Info Card */}
      <GlassCard glow="pink" className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-pink-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-pink-400 tracking-wider">
              {haven.category.replace('_', ' ')}
            </span>
            <h1 className="text-base font-bold text-white mt-0.5">{haven.name}</h1>
            <p className="text-xs text-slate-300 mt-0.5">{haven.address}</p>
          </div>
        </div>

        {/* Distance & Coordinates */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs text-slate-300">
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-blue-400/20">
            <span className="text-slate-400 text-[10px] block">Distance</span>
            <span className="font-bold text-white font-mono">
              {GeoService.formatDistance(haven.distanceMeters)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-blue-400/20">
            <span className="text-slate-400 text-[10px] block">Staffed Hours</span>
            <span className="font-bold text-white font-mono text-[11px] truncate block">
              {haven.publishedHours}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Verification Evidence Card */}
      <GlassCard glow="blue" className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Physical Audit & Verification
        </h3>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-slate-400">Audit Source:</span>
            <span className="font-semibold text-white text-right max-w-[200px] truncate">
              {haven.verificationSource}
            </span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-slate-400">Last Verified Stamp:</span>
            <span className="font-mono text-slate-200">{haven.lastVerifiedAt}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-slate-400 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Security Personnel:
            </span>
            <span className="font-semibold text-emerald-400">
              {haven.hasSecurityPersonnel ? 'On-Duty Verified' : 'Standard Staff'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-pink-400" /> CCTV Surveillance:
            </span>
            <span className="font-semibold text-emerald-400">
              {haven.hasCctvCoverage ? '24/7 Monitored' : 'Front Entrance Only'}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Honest Availability Disclaimer */}
      <GlassCard glow="none" className="p-3 bg-amber-950/20 border-amber-400/20">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300">Availability Uncertainty Notice:</strong> Physical conditions may vary (e.g. temporary gate closure, shift changes). In extreme danger, proceed towards the nearest illuminated safe post or dial emergency 112 if signal restores.
          </p>
        </div>
      </GlassCard>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <div className="grid grid-cols-2 gap-2.5">
          <GlassButton
            variant="primary-gradient"
            size="md"
            onClick={onNavigateToMap}
            icon={<Navigation className="w-4 h-4" />}
          >
            Show on Map
          </GlassButton>
          <GlassButton
            variant="glass-outline"
            size="md"
            onClick={() => setShowCheckInModal(true)}
            icon={<QrCode className="w-4 h-4 text-pink-400" />}
          >
            Safe Check-In
          </GlassButton>
        </div>

        <a
          href={`tel:${haven.contactPhone}`}
          className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 transition-all block text-center"
        >
          <Phone className="w-4 h-4 text-pink-400" />
          <span>Call Desk: {haven.contactPhone}</span>
        </a>
      </div>

      {/* Check-In Modal */}
      <GlassDialog
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title="Safe Haven QR / NFC Check-In"
        description="Verify your arrival at this safe location to update local audit logs."
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-32 h-32 mx-auto rounded-2xl bg-white p-3 border-4 border-pink-400/40 shadow-xl flex items-center justify-center">
            <QrCode className="w-24 h-24 text-slate-900" />
          </div>

          <p className="text-xs text-slate-300">
            Scan the official Suraksha Mesh badge sticker at the desk or tap physical NFC tag to record safe check-in.
          </p>

          <p className="text-[10px] text-slate-400 italic">
            *A check-in confirms physical proximity; it does not replace medical or police response in active danger.
          </p>

          <GlassButton
            variant="primary-gradient"
            size="md"
            fullWidth
            onClick={handleSimulateCheckIn}
            icon={checkInDone ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4" />}
          >
            {checkInDone ? 'Check-In Confirmed!' : 'Simulate NFC Tap Check-In'}
          </GlassButton>
        </div>
      </GlassDialog>
    </div>
  );
};
