import React, { useState } from 'react';
import { User, Droplet, AlertTriangle, FileText, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassInputField } from '../components/glass/GlassInputField';
import { EmergencyProfile } from '../types';

interface ProfileSetupScreenProps {
  initialProfile: EmergencyProfile;
  onSaveAndComplete: (profile: EmergencyProfile) => void;
  onBack: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  initialProfile,
  onSaveAndComplete,
  onBack,
}) => {
  const [profile, setProfile] = useState<EmergencyProfile>(initialProfile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAndComplete(profile);
  };

  return (
    <div className="min-h-full px-4 py-4 flex flex-col justify-between max-w-lg mx-auto">
      <div>
        <div className="mb-4">
          <span className="text-[11px] font-bold text-pink-400 tracking-wider">
            STEP 2 OF 2
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Emergency Health Profile
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Stored strictly offline on your phone. Dispatched to verified medical helpers or Safe Haven desks only during active SOS.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <GlassCard glow="blue" className="p-4 space-y-3.5">
            <GlassInputField
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="e.g. Ananya Sharma"
              icon={<User className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Blood Group
                </label>
                <div className="relative">
                  <select
                    value={profile.bloodGroup}
                    onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-900/60 border border-blue-400/20 rounded-xl text-sm text-slate-100 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  >
                    <option value="A+">A+ (Rh Pos)</option>
                    <option value="A-">A- (Rh Neg)</option>
                    <option value="B+">B+ (Rh Pos)</option>
                    <option value="B-">B- (Rh Neg)</option>
                    <option value="AB+">AB+ (Rh Pos)</option>
                    <option value="AB-">AB- (Rh Neg)</option>
                    <option value="O+">O+ (Rh Pos)</option>
                    <option value="O-">O- (Rh Neg)</option>
                  </select>
                </div>
              </div>

              <GlassInputField
                label="Duress / Discreet PIN"
                type="password"
                maxLength={4}
                value={profile.discreetDuressPin}
                onChange={(e) => setProfile({ ...profile, discreetDuressPin: e.target.value })}
                placeholder="4-digit PIN"
                icon={<KeyRound className="w-4 h-4" />}
                helperText="Silent trigger unlock"
              />
            </div>

            <GlassInputField
              label="Allergies & Sensitivities"
              value={profile.allergies}
              onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              placeholder="e.g. Penicillin, Peanuts, Latex"
              icon={<AlertTriangle className="w-4 h-4" />}
            />

            <GlassInputField
              label="Medical Conditions"
              value={profile.medicalConditions}
              onChange={(e) => setProfile({ ...profile, medicalConditions: e.target.value })}
              placeholder="e.g. Asthma, Diabetes, Heart condition"
              icon={<Droplet className="w-4 h-4" />}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                First Responder Instructions
              </label>
              <textarea
                rows={2}
                value={profile.emergencyInstructions}
                onChange={(e) =>
                  setProfile({ ...profile, emergencyInstructions: e.target.value })
                }
                placeholder="e.g. Inhaler in outer bag pouch. Please phone emergency contact immediately."
                className="w-full py-2 px-3 bg-slate-900/60 border border-blue-400/20 rounded-xl text-sm text-slate-100 placeholder-slate-500 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              />
            </div>
          </GlassCard>

          {/* Privacy Toggle */}
          <GlassCard glow="pink" className="p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-bold text-white">Broadcast Health Info in SOS</h2>
                  <p className="text-[11px] text-slate-300">
                    If disabled, only your anonymized cryptographic ID and coordinates will be sent.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={profile.shareMedicalDataOnSos}
                onChange={(e) =>
                  setProfile({ ...profile, shareMedicalDataOnSos: e.target.checked })
                }
                className="w-5 h-5 rounded accent-pink-500 cursor-pointer"
              />
            </div>
          </GlassCard>

          <div className="pt-2 pb-3 space-y-2">
            <GlassButton
              type="submit"
              variant="primary-gradient"
              size="lg"
              fullWidth
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Finish Setup & Enter Dashboard
            </GlassButton>
            <button
              type="button"
              onClick={onBack}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-200 py-2 transition-colors"
            >
              Back to Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
