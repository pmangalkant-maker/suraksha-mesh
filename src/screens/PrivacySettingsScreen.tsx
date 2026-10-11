import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Radio,
  MapPin,
  Trash2,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassDialog } from '../components/glass/GlassDialog';
import { SecurityKeypair } from '../types';

interface PrivacySettingsScreenProps {
  keypair: SecurityKeypair;
  relayConsent: boolean;
  onToggleRelayConsent: () => void;
  locationSharing: boolean;
  onToggleLocationSharing: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPurgeAllData: () => void;
  onNavigateToCodeViewer: () => void;
}

export const PrivacySettingsScreen: React.FC<PrivacySettingsScreenProps> = ({
  keypair,
  relayConsent,
  onToggleRelayConsent,
  locationSharing,
  onToggleLocationSharing,
  soundEnabled,
  onToggleSound,
  onPurgeAllData,
  onNavigateToCodeViewer,
}) => {
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [keyRotated, setKeyRotated] = useState(false);

  const handleRotateKey = () => {
    setKeyRotated(true);
    setTimeout(() => setKeyRotated(false), 2000);
  };

  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-lg mx-auto space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-white">Privacy & Cryptographic Security</h1>
        <p className="text-xs text-slate-400">
          Hardware-backed keystore, peer relay consent, and anti-surveillance policies
        </p>
      </div>

      {/* Hardware Keystore Identity Card */}
      <GlassCard glow="blue" className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Android Hardware Keystore
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            StrongBox Active
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Algorithm:</span>
            <span className="text-white font-mono">{keypair.keyAlgorithm}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Alias:</span>
            <span className="text-white font-mono">{keypair.keystoreAlias}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block mb-1">Public Verification Key:</span>
            <div className="p-2 rounded-xl bg-black/40 border border-blue-400/20 font-mono text-[10px] text-blue-300 break-all select-all">
              {keypair.publicKeyHex}
            </div>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <button
            onClick={handleRotateKey}
            className="text-[11px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${keyRotated ? 'animate-spin' : ''}`} />
            {keyRotated ? 'Rotated in StrongBox' : 'Regenerate Keystore Token'}
          </button>
          <button
            onClick={onNavigateToCodeViewer}
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline"
          >
            View Kotlin Implementation
          </button>
        </div>
      </GlassCard>

      {/* Privacy and Relay Toggles */}
      <div className="space-y-3">
        {/* Toggle 1: Relay Consent */}
        <GlassCard glow="none" className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Radio className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Participate in Mesh Relay Forwarding</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Allow your phone's BLE radio to securely forward distress beacons from nearby women (bounded to 3 hops max).
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={relayConsent}
              onChange={onToggleRelayConsent}
              className="w-5 h-5 rounded accent-pink-500 cursor-pointer shrink-0 mt-1"
            />
          </div>
        </GlassCard>

        {/* Toggle 2: Location precision */}
        <GlassCard glow="none" className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Attach High-Accuracy GPS Coordinates</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  If disabled, only coarse district location will be broadcast during active distress calls.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={locationSharing}
              onChange={onToggleLocationSharing}
              className="w-5 h-5 rounded accent-pink-500 cursor-pointer shrink-0 mt-1"
            />
          </div>
        </GlassCard>

        {/* Toggle 3: Sound effects */}
        <GlassCard glow="none" className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Tactile Audio Feedback & Beeps</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Audio sirens, countdown ticks, and helper delivery confirmation sounds.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={onToggleSound}
              className="w-5 h-5 rounded accent-pink-500 cursor-pointer shrink-0 mt-1"
            />
          </div>
        </GlassCard>
      </div>

      {/* Dangerous Data Purge */}
      <GlassCard glow="none" className="p-4 bg-red-950/20 border-red-500/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-red-300">Wipe All Offline Data</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently purges local Room DB, emergency profile, contacts, and offline tiles.
            </p>
          </div>
          <button
            onClick={() => setShowPurgeModal(true)}
            className="px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-md shrink-0"
          >
            Purge All
          </button>
        </div>
      </GlassCard>

      {/* Purge Modal */}
      <GlassDialog
        isOpen={showPurgeModal}
        onClose={() => setShowPurgeModal(false)}
        title="Permanently Purge All Data?"
        description="This will clear your local emergency profile, contacts, and downloaded maps. This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={() => setShowPurgeModal(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onPurgeAllData();
              setShowPurgeModal(false);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg"
          >
            Yes, Purge Everything
          </button>
        </div>
      </GlassDialog>
    </div>
  );
};
