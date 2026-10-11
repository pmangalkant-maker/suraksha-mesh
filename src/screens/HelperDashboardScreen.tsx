import React, { useState } from 'react';
import {
  UserCheck,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Radio,
  Clock,
  Compass,
  ArrowRight,
  ShieldBan,
  BellRing,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassBadge } from '../components/glass/GlassBadge';
import { GlassButton } from '../components/glass/GlassButton';
import { EmergencyAlert } from '../types';
import { GeoService } from '../services/geoService';
import { sounds } from '../services/soundService';

interface HelperDashboardScreenProps {
  incomingAlerts: EmergencyAlert[];
  onAcknowledgeAlert: (alert: EmergencyAlert, helperName: string) => void;
  onIgnoreAlert: (alertId: string) => void;
  onBlockDevice: (senderId: string) => void;
  onSimulateIncomingAlert: () => void;
  onNavigateToMap: () => void;
}

export const HelperDashboardScreen: React.FC<HelperDashboardScreenProps> = ({
  incomingAlerts,
  onAcknowledgeAlert,
  onIgnoreAlert,
  onBlockDevice,
  onSimulateIncomingAlert,
  onNavigateToMap,
}) => {
  const [helperName, setHelperName] = useState('Volunteer Helper (Phone)');
  const [isAcking, setIsAcking] = useState<string | null>(null);

  const handleAcknowledge = async (alert: EmergencyAlert) => {
    setIsAcking(alert.alertId);
    sounds.playAckReceivedChime();
    await new Promise((r) => setTimeout(r, 600));
    onAcknowledgeAlert(alert, helperName);
    setIsAcking(null);
  };

  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-lg mx-auto space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white">Helper & Responder Console</h1>
          <p className="text-xs text-slate-400">
            Incoming emergency alerts intercepted over BLE radio mesh
          </p>
        </div>
        <button
          onClick={onSimulateIncomingAlert}
          className="px-2.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/30 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
        >
          <BellRing className="w-3.5 h-3.5 text-pink-400" />
          <span>Simulate Inbound</span>
        </button>
      </div>

      {/* Helper ID card */}
      <GlassCard glow="blue" className="p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">
              Responder Identity
            </span>
            <input
              type="text"
              value={helperName}
              onChange={(e) => setHelperName(e.target.value)}
              className="text-xs font-bold text-white bg-transparent border-b border-blue-400/30 focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>
        <GlassBadge label="GATT Listener On" variant="success" />
      </GlassCard>

      {/* Incoming Alerts List */}
      {incomingAlerts.length === 0 ? (
        <GlassCard glow="none" className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-blue-400/20 flex items-center justify-center mx-auto text-blue-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Active Distress Beacons Nearby</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Your device is actively listening for 128-bit Suraksha Mesh emergency packets within Bluetooth range.
            </p>
          </div>
          <button
            onClick={onSimulateIncomingAlert}
            className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-blue-600 text-white text-xs font-bold shadow-md hover:from-pink-400 hover:to-blue-500"
          >
            Simulate Test Distress Beacon
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {incomingAlerts.map((alert) => {
            const isAcked = alert.status === 'HELPER_ACKNOWLEDGED';

            return (
              <GlassCard
                key={alert.alertId}
                glow={isAcked ? 'none' : 'red'}
                className={`p-4 space-y-3 ${
                  isAcked
                    ? 'border-emerald-500/30 bg-emerald-950/20'
                    : 'border-red-500/40 bg-red-950/30'
                }`}
              >
                {/* Alert Title Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                        isAcked ? 'bg-emerald-600' : 'bg-red-600 animate-pulse'
                      }`}
                    >
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-red-300 uppercase tracking-wide">
                          {alert.emergencyType}
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">
                          Hop #{alert.hopCount}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{alert.senderName}</h4>
                    </div>
                  </div>

                  <GlassBadge
                    label={isAcked ? 'Acknowledged' : 'Distress Unacknowledged'}
                    variant={isAcked ? 'success' : 'danger'}
                  />
                </div>

                {/* Location Box */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-pink-400" /> Location
                    </span>
                    <span className="font-mono font-bold text-white">
                      {GeoService.formatCoordinates(
                        alert.location.latitude,
                        alert.location.longitude
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Precision: ±{alert.location.accuracyMeters ?? 25}m</span>
                    <span className="font-mono">
                      Received: {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Status Message */}
                <p className="text-xs text-slate-200 italic">"{alert.statusMessage}"</p>

                {/* Action Buttons */}
                {!isAcked ? (
                  <div className="pt-1 flex items-center gap-2">
                    <GlassButton
                      variant="primary-gradient"
                      size="sm"
                      fullWidth
                      disabled={isAcking === alert.alertId}
                      onClick={() => handleAcknowledge(alert)}
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      {isAcking === alert.alertId
                        ? 'Broadcasting ACK...'
                        : 'Acknowledge Distress'}
                    </GlassButton>

                    <button
                      onClick={() => onIgnoreAlert(alert.alertId)}
                      title="Dismiss alert locally"
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onBlockDevice(alert.senderId)}
                      title="Block sender hardware ID"
                      className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 transition-colors"
                    >
                      <ShieldBan className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-400/20 text-xs text-emerald-300 flex items-center justify-between">
                    <span>ACK returned to sender over BLE mesh.</span>
                    <button
                      onClick={onNavigateToMap}
                      className="text-[11px] font-bold text-white hover:underline flex items-center gap-1"
                    >
                      Locate on Map <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
