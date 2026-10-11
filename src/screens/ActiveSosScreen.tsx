import React, { useState } from 'react';
import {
  ShieldAlert,
  Radio,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  X,
  Volume2,
  VolumeX,
  AlertTriangle,
  Send,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassBadge } from '../components/glass/GlassBadge';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassDialog } from '../components/glass/GlassDialog';
import { EmergencyAlert } from '../types';
import { GeoService } from '../services/geoService';
import { sounds } from '../services/soundService';

interface ActiveSosScreenProps {
  alert: EmergencyAlert;
  onCancelAlert: () => void;
  onNavigateToMap: () => void;
  onNavigateToDiagnostics: () => void;
  isSirenPlaying: boolean;
  onToggleSiren: () => void;
}

export const ActiveSosScreen: React.FC<ActiveSosScreenProps> = ({
  alert,
  onCancelAlert,
  onNavigateToMap,
  onNavigateToDiagnostics,
  isSirenPlaying,
  onToggleSiren,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Reached safety at Safe Haven');

  // Timeline steps
  const steps = [
    {
      id: 'step-1',
      title: 'SOS Beacon Created & Signed',
      desc: 'Signed with local Ed25519 hardware key, saved to Room DB.',
      isDone: true,
      time: new Date(alert.createdAt).toLocaleTimeString(),
    },
    {
      id: 'step-2',
      title: 'Nearby Android Device Received',
      desc:
        alert.hopCount >= 1
          ? `GATT payload delivered to peer (${alert.relayHistory[0]?.nodeName || 'Nearby Phone'}).`
          : 'Broadcasting BLE 128-bit advertisement. Waiting for nearby receiver...',
      isDone: alert.hopCount >= 1 || alert.status === 'NEARBY_DEVICE_RECEIVED' || alert.status === 'RELAYED_HOP_2' || alert.status === 'HELPER_ACKNOWLEDGED',
      time: alert.relayHistory[0] ? new Date(alert.relayHistory[0].timestamp).toLocaleTimeString() : undefined,
    },
    {
      id: 'step-3',
      title: 'Mesh Hop 2 Forwarding',
      desc:
        alert.hopCount >= 2
          ? `Relayed to node 2 (${alert.relayHistory[1]?.nodeName || 'Safe Haven Terminal'}).`
          : 'Consent-based hop forwarding in progress...',
      isDone: alert.hopCount >= 2 || alert.status === 'RELAYED_HOP_2' || alert.status === 'HELPER_ACKNOWLEDGED',
      time: alert.relayHistory[1] ? new Date(alert.relayHistory[1].timestamp).toLocaleTimeString() : undefined,
    },
    {
      id: 'step-4',
      title: 'Verified Helper Acknowledgement',
      desc: alert.acknowledgedBy
        ? `Confirmed by ${alert.acknowledgedBy.helperName}: "${alert.acknowledgedBy.note}"`
        : 'Awaiting authenticated acknowledgement return token from a verified helper desk.',
      isDone: alert.status === 'HELPER_ACKNOWLEDGED',
      time: alert.acknowledgedBy ? new Date(alert.acknowledgedBy.ackTimestamp).toLocaleTimeString() : undefined,
    },
  ];

  const handleConfirmCancel = () => {
    sounds.playCancelChime();
    setShowCancelModal(false);
    onCancelAlert();
  };

  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-lg mx-auto space-y-4">
      {/* Active Emergency Alert Header */}
      <GlassCard glow="red" className="p-4 bg-red-950/40 border-red-500/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-600/50 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-red-300 tracking-wider uppercase">
                  ACTIVE DISTRESS BEACON
                </span>
                <span className="text-[10px] text-red-200 bg-red-900/60 px-2 py-0.5 rounded-full border border-red-500/30 font-mono">
                  ID: {alert.alertId.slice(0, 8)}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {alert.senderName} ({alert.emergencyType})
              </h2>
            </div>
          </div>

          {/* Siren toggle */}
          <button
            onClick={onToggleSiren}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
              isSirenPlaying
                ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/40 animate-bounce'
                : 'bg-white/10 text-slate-300 border-white/20'
            }`}
          >
            {isSirenPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Current status banner */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-red-400/20 text-xs text-red-200">
          <p className="font-semibold">{alert.statusMessage}</p>
        </div>

        {/* Location & GPS metadata */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-300">
          <div className="p-2 rounded-lg bg-black/30 border border-white/10">
            <span className="text-slate-400 block text-[10px]">GPS Coordinates</span>
            <span className="font-mono font-bold text-white">
              {GeoService.formatCoordinates(alert.location.latitude, alert.location.longitude)}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-black/30 border border-white/10">
            <span className="text-slate-400 block text-[10px]">Accuracy Radius</span>
            <span className="font-mono font-bold text-white">
              ±{alert.location.accuracyMeters ?? 25} meters
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Verified Delivery Timeline */}
      <GlassCard glow="blue" className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-400" /> Truthful Delivery Timeline
          </h3>
          <span className="text-[11px] font-mono text-blue-300">
            Hops: {alert.hopCount} / {alert.maxHops}
          </span>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-3.5 before:w-0.5 before:bg-blue-500/20">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative flex items-start gap-3.5 pl-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold z-10 ${
                  step.isDone
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40 ring-4 ring-slate-950'
                    : 'bg-slate-800 text-slate-400 border border-blue-400/30 ring-4 ring-slate-950'
                }`}
              >
                {step.isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs font-bold ${
                      step.isDone ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {step.time && (
                    <span className="text-[10px] font-mono text-slate-400">{step.time}</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Helper Acknowledged Banner if verified */}
      {alert.acknowledgedBy && (
        <GlassCard glow="pink" className="p-4 bg-emerald-950/30 border-emerald-400/40">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Confirmed Return Delivery
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {alert.acknowledgedBy.helperName}
              </h4>
              <p className="text-xs text-slate-200 mt-1 italic">
                "{alert.acknowledgedBy.note}"
              </p>
              <p className="text-[10px] text-emerald-300 mt-1 font-mono">
                Received at: {new Date(alert.acknowledgedBy.ackTimestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Bottom Actions */}
      <div className="space-y-2.5 pt-2">
        <div className="grid grid-cols-2 gap-2.5">
          <GlassButton
            variant="glass-outline"
            size="md"
            onClick={onNavigateToMap}
            icon={<Compass className="w-4 h-4 text-blue-400" />}
          >
            Safe Havens Map
          </GlassButton>
          <GlassButton
            variant="glass-outline"
            size="md"
            onClick={onNavigateToDiagnostics}
            icon={<Radio className="w-4 h-4 text-pink-400" />}
          >
            Mesh Logs
          </GlassButton>
        </div>

        <GlassButton
          variant="emergency-red"
          size="lg"
          fullWidth
          onClick={() => setShowCancelModal(true)}
          icon={<X className="w-5 h-5" />}
        >
          Cancel Distress Alert (I Am Safe)
        </GlassButton>
      </div>

      {/* Safe Cancellation Modal */}
      <GlassDialog
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Confirm Distress Cancellation"
        description="Cancelling will transmit a signed 'CANCELLED_SAFE' packet to clear the alert across the mesh network."
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cancellation Reason / Safe Status
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-900 border border-blue-400/30 rounded-xl text-xs text-white"
            >
              <option value="Reached safety at Safe Haven">Reached safety at Safe Haven</option>
              <option value="Helper or Police arrived">Helper or Police arrived</option>
              <option value="Accidental false activation">Accidental false activation</option>
              <option value="Threat subsided safely">Threat subsided safely</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Keep Alert Active
            </button>
            <button
              onClick={handleConfirmCancel}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg transition-all"
            >
              Confirm I Am Safe
            </button>
          </div>
        </div>
      </GlassDialog>
    </div>
  );
};
