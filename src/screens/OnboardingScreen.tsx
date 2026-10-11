import React from 'react';
import { ShieldCheck, Radio, MapPin, HeartHandshake, ArrowRight, ShieldAlert, WifiOff } from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';

interface OnboardingScreenProps {
  onContinue: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onContinue }) => {
  return (
    <div className="min-h-full px-4 py-6 flex flex-col justify-between max-w-lg mx-auto">
      {/* Brand Header */}
      <div className="text-center pt-2 pb-4">
        <div className="inline-flex p-3.5 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-blue-600 shadow-xl shadow-pink-500/25 border border-white/20 mb-4 animate-bounce duration-1000">
          <ShieldAlert className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-300 via-rose-200 to-blue-300 bg-clip-text text-transparent">
          SURAKSHA MESH
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1.5 max-w-xs mx-auto">
          Offline-First Women Safety & BLE Mesh Protection Network
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full bg-blue-950/60 border border-blue-400/30 text-[11px] text-blue-300">
          <WifiOff className="w-3.5 h-3.5 text-pink-400" />
          <span>Zero Cellular / Zero Internet Required for SOS</span>
        </div>
      </div>

      {/* Feature Glass Cards */}
      <div className="space-y-3.5 my-4">
        <GlassCard glow="pink" className="p-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center shrink-0 text-pink-300">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Peer-to-Peer BLE Mesh</h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Transmits encrypted SOS beacons to nearby compatible Android phones using Bluetooth Low Energy, hopping across devices up to 3 hops.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard glow="blue" className="p-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Verified Safe-Haven Network</h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Discover pre-downloaded offline safe locations: 24/7 pharmacies, pink police booths, metro security desks, and partner shops.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard glow="none" className="p-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Truthful Verification Timeline</h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Never claims an alert reached police or helpers unless an authenticated acknowledgement packet is confirmed from a receiver.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard glow="none" className="p-4 bg-slate-900/60">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center shrink-0 text-rose-300">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Hardware Keystore Security</h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Alerts are cryptographically signed with local Ed25519 keys, preventing forged beacons, replay attacks, and false triggers.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* CTA Button */}
      <div className="pt-2 pb-4">
        <GlassButton
          variant="primary-gradient"
          size="lg"
          fullWidth
          onClick={onContinue}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Setup Safety Permissions
        </GlassButton>
        <p className="text-center text-[11px] text-slate-400 mt-2.5">
          Suraksha Mesh stores all personal profile data strictly offline on this device.
        </p>
      </div>
    </div>
  );
};
