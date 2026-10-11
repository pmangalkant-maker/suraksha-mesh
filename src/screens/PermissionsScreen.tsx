import React, { useState } from 'react';
import { Bluetooth, MapPin, Bell, BatteryCharging, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';

interface PermissionsScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ onContinue, onBack }) => {
  const [bleGranted, setBleGranted] = useState(true);
  const [locationGranted, setLocationGranted] = useState(true);
  const [notificationGranted, setNotificationGranted] = useState(true);
  const [batteryGranted, setBatteryGranted] = useState(true);

  const requestBrowserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationGranted(true),
        () => setLocationGranted(true) // Still allow user to proceed
      );
    }
  };

  const requestBrowserNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setNotificationGranted(perm === 'granted');
      });
    } else {
      setNotificationGranted(true);
    }
  };

  return (
    <div className="min-h-full px-4 py-4 flex flex-col justify-between max-w-lg mx-auto">
      <div>
        <div className="mb-4">
          <span className="text-[11px] font-bold text-pink-400 tracking-wider">
            STEP 1 OF 2
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Required Safety Permissions
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Android requires runtime approval to scan nearby peer radios and attach accurate GPS coordinates to emergency beacons.
          </p>
        </div>

        <div className="space-y-3">
          {/* Permission 1: Bluetooth */}
          <GlassCard glow="blue" className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-300">
                  <Bluetooth className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">Bluetooth Low Energy (BLE)</h2>
                    {bleGranted && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Granted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Enables background advertising and scanning to form peer-to-peer mesh hops with nearby Android devices.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBleGranted(!bleGranted)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  bleGranted
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-blue-600 text-white border-blue-400 shadow-md'
                }`}
              >
                {bleGranted ? 'Allowed' : 'Grant'}
              </button>
            </div>
          </GlassCard>

          {/* Permission 2: Location */}
          <GlassCard glow="pink" className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center shrink-0 text-pink-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">Precise GPS Location</h2>
                    {locationGranted && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Enabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Packages satellite coordinates and accuracy radius into emergency packets. GPS functions offline without mobile data.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  requestBrowserLocation();
                  setLocationGranted(!locationGranted);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  locationGranted
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-pink-600 text-white border-pink-400 shadow-md'
                }`}
              >
                {locationGranted ? 'Allowed' : 'Grant'}
              </button>
            </div>
          </GlassCard>

          {/* Permission 3: Notifications */}
          <GlassCard glow="none" className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">Critical Notifications</h2>
                    {notificationGranted && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Enabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Delivers immediate sound, vibration, and helper delivery receipts when screen is locked.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  requestBrowserNotification();
                  setNotificationGranted(!notificationGranted);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  notificationGranted
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-600 text-white border-amber-400 shadow-md'
                }`}
              >
                {notificationGranted ? 'Allowed' : 'Grant'}
              </button>
            </div>
          </GlassCard>

          {/* Permission 4: Battery Optimization */}
          <GlassCard glow="none" className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">Foreground Service Priority</h2>
                    {batteryGranted && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Unrestricted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Prevents Android OEM aggressive battery killers from closing the BLE listener when the phone is in your pocket.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBatteryGranted(!batteryGranted)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  batteryGranted
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                }`}
              >
                {batteryGranted ? 'Allowed' : 'Grant'}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="pt-4 pb-2 space-y-2">
        <GlassButton
          variant="primary-gradient"
          size="lg"
          fullWidth
          onClick={onContinue}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Continue to Emergency Profile
        </GlassButton>
        <button
          onClick={onBack}
          className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-200 py-2 transition-colors"
        >
          Back to Overview
        </button>
      </div>
    </div>
  );
};
