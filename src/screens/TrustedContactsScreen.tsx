import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassInputField } from '../components/glass/GlassInputField';
import { GlassDialog } from '../components/glass/GlassDialog';
import { GlassBadge } from '../components/glass/GlassBadge';
import { TrustedContact } from '../types';

interface TrustedContactsScreenProps {
  contacts: TrustedContact[];
  onAddContact: (contact: TrustedContact) => void;
  onDeleteContact: (contactId: string) => void;
  onToggleContactNotify: (contactId: string) => void;
}

export const TrustedContactsScreen: React.FC<TrustedContactsScreenProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  onToggleContactNotify,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState('Family');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newContact: TrustedContact = {
      contactId: `c-${Date.now()}`,
      name: newName.trim(),
      phoneNumber: newPhone.trim(),
      relationship: newRelationship,
      optedIn: true,
      notifyOnSos: true,
      canReceiveBle: true,
      lastSeenMeshAt: Date.now(),
    };

    onAddContact(newContact);
    setNewName('');
    setNewPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white">Trusted Safety Ring</h1>
          <p className="text-xs text-slate-400">
            Contacts alerted during SOS via BLE mesh and automated fallback
          </p>
        </div>
        <GlassButton
          variant="pink"
          size="sm"
          onClick={() => setShowAddModal(true)}
          icon={<UserPlus className="w-4 h-4" />}
        >
          Add Contact
        </GlassButton>
      </div>

      {/* Information Callout */}
      <GlassCard glow="blue" className="p-3.5 bg-blue-950/25 border-blue-400/20">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-white">Offline Mesh Verification:</strong> Contacts with the Suraksha Mesh app installed on Android will automatically receive high-priority alerts via BLE radio when in physical vicinity (0–100m) with zero cellular dependency.
          </p>
        </div>
      </GlassCard>

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts.map((contact) => (
          <GlassCard key={contact.contactId} glow="none" className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-blue-500/20 border border-pink-400/30 flex items-center justify-center text-pink-300 shrink-0 font-bold">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{contact.name}</h3>
                    <span className="text-[10px] text-slate-400 font-semibold bg-white/10 px-1.5 py-0.5 rounded">
                      {contact.relationship}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" /> {contact.phoneNumber}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {contact.optedIn ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Opted In
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Pending Consent
                      </span>
                    )}

                    {contact.canReceiveBle && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-300 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        <Radio className="w-3 h-3 text-blue-400" /> BLE Mesh Peer
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggleContactNotify(contact.contactId)}
                  title={contact.notifyOnSos ? 'Disable SOS alerts' : 'Enable SOS alerts'}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    contact.notifyOnSos
                      ? 'bg-pink-500/20 text-pink-300 border-pink-400/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {contact.notifyOnSos ? 'Active' : 'Muted'}
                </button>

                <button
                  onClick={() => onDeleteContact(contact.contactId)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Add Contact Modal */}
      <GlassDialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Trusted Safety Contact"
        description="This contact will be included in the signed emergency payload."
      >
        <form onSubmit={handleCreate} className="space-y-3.5">
          <GlassInputField
            label="Contact Full Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Sister, Roommate, Mother"
            required
          />

          <GlassInputField
            label="Phone Number"
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="+91 98765 43210"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Relationship / Role
            </label>
            <select
              value={newRelationship}
              onChange={(e) => setNewRelationship(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-900 border border-blue-400/30 rounded-xl text-xs text-white"
            >
              <option value="Sister">Sister</option>
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Spouse">Spouse / Partner</option>
              <option value="Roommate">Roommate</option>
              <option value="Doctor">Doctor</option>
              <option value="Friend">Friend</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <GlassButton variant="primary-gradient" size="sm" type="submit">
              Save Contact
            </GlassButton>
          </div>
        </form>
      </GlassDialog>
    </div>
  );
};
