import React, { useState } from 'react';
import {
  User,
  Droplet,
  AlertTriangle,
  FileText,
  KeyRound,
  ShieldCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassInputField } from '../components/glass/GlassInputField';
import { EmergencyProfile } from '../types';

interface EmergencyProfileScreenProps {
  profile: EmergencyProfile;
  onSaveProfile: (updated: EmergencyProfile) => void;
}

export const EmergencyProfileScreen: React.FC<EmergencyProfileScreenProps> = ({
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<EmergencyProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white">Emergency Medical Profile</h1>
          <p className="text-xs text-slate-400">
            Encrypted offline profile accessed by responders during active SOS
          </p>
        </div>
        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-3.5">
        <GlassCard glow="pink" className="p-4 space-y-3.5">
          <GlassInputField
            label="Full Legal Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={<User className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full py-2.5 px-3 bg-slate-900 border border-blue-400/20 rounded-xl text-xs text-white"
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

            <GlassInputField
              label="Discreet Duress PIN"
              type="password"
              maxLength={4}
              value={formData.discreetDuressPin}
              onChange={(e) =>
                setFormData({ ...formData, discreetDuressPin: e.target.value })
              }
              icon={<KeyRound className="w-4 h-4" />}
              helperText="Stealth unlock code"
            />
          </div>

          <GlassInputField
            label="Known Allergies"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            icon={<AlertTriangle className="w-4 h-4" />}
            placeholder="e.g. Penicillin, Peanuts"
          />

          <GlassInputField
            label="Pre-existing Conditions"
            value={formData.medicalConditions}
            onChange={(e) =>
              setFormData({ ...formData, medicalConditions: e.target.value })
            }
            icon={<Droplet className="w-4 h-4" />}
            placeholder="e.g. Asthma, Hypertension"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Paramedic / Responder Instructions
            </label>
            <textarea
              rows={3}
              value={formData.emergencyInstructions}
              onChange={(e) =>
                setFormData({ ...formData, emergencyInstructions: e.target.value })
              }
              className="w-full py-2 px-3 bg-slate-900 border border-blue-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="e.g. Inhaler in outer bag pocket. Please contact sister Pooja Sharma."
            />
          </div>
        </GlassCard>

        {/* Privacy Broadcast Control */}
        <GlassCard glow="blue" className="p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Broadcast Medical Data with SOS</h4>
                <p className="text-[11px] text-slate-400">
                  When enabled, medical notes and blood group are encrypted into the mesh payload for authorized responders.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.shareMedicalDataOnSos}
              onChange={(e) =>
                setFormData({ ...formData, shareMedicalDataOnSos: e.target.checked })
              }
              className="w-5 h-5 rounded accent-pink-500 cursor-pointer"
            />
          </div>
        </GlassCard>

        <GlassButton
          variant="primary-gradient"
          size="lg"
          fullWidth
          type="submit"
          icon={<Save className="w-4 h-4" />}
        >
          Save Profile Updates
        </GlassButton>
      </form>
    </div>
  );
};
