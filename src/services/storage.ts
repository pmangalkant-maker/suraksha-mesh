import {
  EmergencyAlert,
  EmergencyProfile,
  TrustedContact,
  SafeHaven,
  MapRegionPack,
  SecurityKeypair,
} from '../types';
import {
  INITIAL_PROFILE,
  INITIAL_CONTACTS,
  INITIAL_SAFE_HAVENS,
  INITIAL_MAP_PACKS,
  INITIAL_SECURITY_KEYPAIR,
} from '../data/defaultData';

const KEYS = {
  PROFILE: 'suraksha_mesh_profile',
  CONTACTS: 'suraksha_mesh_contacts',
  SAFE_HAVENS: 'suraksha_mesh_safe_havens',
  MAP_PACKS: 'suraksha_mesh_map_packs',
  ALERTS: 'suraksha_mesh_alerts',
  KEYPAIR: 'suraksha_mesh_keypair',
  RELAY_CONSENT: 'suraksha_mesh_relay_consent',
  AIRPLANE_MODE: 'suraksha_mesh_airplane_mode',
  LOCATION_SHARING: 'suraksha_mesh_location_sharing',
  THEME_MODE: 'suraksha_mesh_theme_mode',
  SOUND_ENABLED: 'suraksha_mesh_sound_enabled',
};

export const StorageService = {
  getProfile(): EmergencyProfile {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  },

  saveProfile(profile: EmergencyProfile): void {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getContacts(): TrustedContact[] {
    try {
      const data = localStorage.getItem(KEYS.CONTACTS);
      return data ? JSON.parse(data) : INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  },

  saveContacts(contacts: TrustedContact[]): void {
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
  },

  getSafeHavens(): SafeHaven[] {
    try {
      const data = localStorage.getItem(KEYS.SAFE_HAVENS);
      return data ? JSON.parse(data) : INITIAL_SAFE_HAVENS;
    } catch {
      return INITIAL_SAFE_HAVENS;
    }
  },

  saveSafeHavens(havens: SafeHaven[]): void {
    localStorage.setItem(KEYS.SAFE_HAVENS, JSON.stringify(havens));
  },

  getMapPacks(): MapRegionPack[] {
    try {
      const data = localStorage.getItem(KEYS.MAP_PACKS);
      return data ? JSON.parse(data) : INITIAL_MAP_PACKS;
    } catch {
      return INITIAL_MAP_PACKS;
    }
  },

  saveMapPacks(packs: MapRegionPack[]): void {
    localStorage.setItem(KEYS.MAP_PACKS, JSON.stringify(packs));
  },

  getAlerts(): EmergencyAlert[] {
    try {
      const data = localStorage.getItem(KEYS.ALERTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAlerts(alerts: EmergencyAlert[]): void {
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  },

  getKeypair(): SecurityKeypair {
    try {
      const data = localStorage.getItem(KEYS.KEYPAIR);
      return data ? JSON.parse(data) : INITIAL_SECURITY_KEYPAIR;
    } catch {
      return INITIAL_SECURITY_KEYPAIR;
    }
  },

  getRelayConsent(): boolean {
    const val = localStorage.getItem(KEYS.RELAY_CONSENT);
    return val !== null ? val === 'true' : true;
  },

  setRelayConsent(consented: boolean): void {
    localStorage.setItem(KEYS.RELAY_CONSENT, String(consented));
  },

  getAirplaneMode(): boolean {
    return localStorage.getItem(KEYS.AIRPLANE_MODE) === 'true';
  },

  setAirplaneMode(active: boolean): void {
    localStorage.setItem(KEYS.AIRPLANE_MODE, String(active));
  },

  getLocationSharingEnabled(): boolean {
    const val = localStorage.getItem(KEYS.LOCATION_SHARING);
    return val !== null ? val === 'true' : true;
  },

  setLocationSharingEnabled(enabled: boolean): void {
    localStorage.setItem(KEYS.LOCATION_SHARING, String(enabled));
  },

  getThemeMode(): 'dark' | 'light' {
    const val = localStorage.getItem(KEYS.THEME_MODE);
    return val === 'light' ? 'light' : 'dark';
  },

  setThemeMode(theme: 'dark' | 'light'): void {
    localStorage.setItem(KEYS.THEME_MODE, theme);
  },

  getSoundEnabled(): boolean {
    const val = localStorage.getItem(KEYS.SOUND_ENABLED);
    return val !== null ? val === 'true' : true;
  },

  setSoundEnabled(enabled: boolean): void {
    localStorage.setItem(KEYS.SOUND_ENABLED, String(enabled));
  },

  purgeAllData(): void {
    localStorage.clear();
  },
};
