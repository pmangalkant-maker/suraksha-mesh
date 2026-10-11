/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ScreenId,
  EmergencyAlert,
  EmergencyProfile,
  TrustedContact,
  SafeHaven,
  MapRegionPack,
  SecurityKeypair,
  BlePeerNode,
  LocationMetadata,
} from './types';
import { StorageService } from './services/storage';
import { GeoService } from './services/geoService';
import { sounds } from './services/soundService';
import { meshSimulator } from './services/meshSimulator';

// Components
import { GlassTopBar } from './components/glass/GlassTopBar';
import { GlassNavigationBar } from './components/glass/GlassNavigationBar';
import { DiscreetModeModal } from './components/common/DiscreetModeModal';

// Screens
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PermissionsScreen } from './screens/PermissionsScreen';
import { ProfileSetupScreen } from './screens/ProfileSetupScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CountdownScreen } from './screens/CountdownScreen';
import { ActiveSosScreen } from './screens/ActiveSosScreen';
import { HelperDashboardScreen } from './screens/HelperDashboardScreen';
import { TrustedContactsScreen } from './screens/TrustedContactsScreen';
import { EmergencyProfileScreen } from './screens/EmergencyProfileScreen';
import { OfflineMapScreen } from './screens/OfflineMapScreen';
import { SafeHavenDirectoryScreen } from './screens/SafeHavenDirectoryScreen';
import { SafeHavenDetailScreen } from './screens/SafeHavenDetailScreen';
import { MapDownloadManagerScreen } from './screens/MapDownloadManagerScreen';
import { PrivacySettingsScreen } from './screens/PrivacySettingsScreen';
import { BluetoothDiagnosticsScreen } from './screens/BluetoothDiagnosticsScreen';
import { LimitationsAboutScreen } from './screens/LimitationsAboutScreen';
import { AndroidCodeExplorer } from './components/code/AndroidCodeExplorer';

import {
  Smartphone,
  Monitor,
  Moon,
  Sun,
  ShieldAlert,
  FileCode2,
  Terminal,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [previousScreen, setPreviousScreen] = useState<ScreenId>('home');

  // Display mode: mobile frame or desktop responsive
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(StorageService.getThemeMode());

  // Data states
  const [profile, setProfile] = useState<EmergencyProfile>(StorageService.getProfile());
  const [contacts, setContacts] = useState<TrustedContact[]>(StorageService.getContacts());
  const [safeHavens, setSafeHavens] = useState<SafeHaven[]>(StorageService.getSafeHavens());
  const [mapPacks, setMapPacks] = useState<MapRegionPack[]>(StorageService.getMapPacks());
  const [keypair] = useState<SecurityKeypair>(StorageService.getKeypair());

  // Settings & hardware toggles
  const [relayConsent, setRelayConsent] = useState(StorageService.getRelayConsent());
  const [locationSharing, setLocationSharing] = useState(StorageService.getLocationSharingEnabled());
  const [isAirplaneMode, setIsAirplaneMode] = useState(StorageService.getAirplaneMode());
  const [soundEnabled, setSoundEnabled] = useState(StorageService.getSoundEnabled());
  const [bleActive, setBleActive] = useState(meshSimulator.isBleEnabled());

  // Location & battery
  const [userLocation, setUserLocation] = useState<LocationMetadata>({
    latitude: 28.6139,
    longitude: 77.2090,
    accuracyMeters: 25,
    timestamp: Date.now(),
    isStale: false,
    provider: 'GPS_HARDWARE',
  });
  const [batteryLevel, setBatteryLevel] = useState(88);

  // Mesh simulator peers & active alerts
  const [peers, setPeers] = useState<BlePeerNode[]>(meshSimulator.getPeers());
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [incomingAlerts, setIncomingAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedHaven, setSelectedHaven] = useState<SafeHaven | null>(null);

  // Audio sirens & discreet mode
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [isDiscreetModalOpen, setIsDiscreetModalOpen] = useState(false);

  // Initialize GPS and battery
  useEffect(() => {
    GeoService.getCurrentLocation().then((loc) => {
      setUserLocation(loc);
    });

    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    const unsubscribe = meshSimulator.subscribe((event) => {
      if (event.type === 'PEERS_UPDATED') {
        setPeers(meshSimulator.getPeers());
      }
    });

    return () => unsubscribe();
  }, []);

  // Update nearest safe haven
  const nearestSafeHaven = useMemo(() => {
    if (!safeHavens.length) return null;
    const havensWithDist = safeHavens.map((h) => ({
      ...h,
      distanceMeters:
        userLocation.latitude && userLocation.longitude
          ? GeoService.calculateDistanceMeters(
              userLocation.latitude,
              userLocation.longitude,
              h.latitude,
              h.longitude
            )
          : 450,
    }));
    return havensWithDist.sort((a, b) => a.distanceMeters - b.distanceMeters)[0] || null;
  }, [safeHavens, userLocation]);

  // Navigation helper
  const navigateTo = (screen: ScreenId) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  // SOS Creation and Transmission Handler
  const handleTriggerSos = useCallback(() => {
    sounds.playClick();
    navigateTo('countdown');
  }, []);

  const handleCountdownComplete = useCallback(
    async (isSilent: boolean) => {
      const newAlert: EmergencyAlert = {
        alertId: `sos-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        senderId: keypair.publicKeyHex.slice(0, 16),
        senderName: profile.name || 'Emergency User',
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000,
        location: userLocation,
        hopCount: 0,
        maxHops: 3,
        status: 'STORED_LOCALLY',
        statusMessage: 'Alert signed and stored in local Room SQLite database.',
        signature: 'ED25519_SIG_VALID_' + Math.random().toString(36).substring(2, 10),
        payloadDigest: 'SHA256_' + Math.random().toString(36).substring(2, 12),
        emergencyType: isSilent ? 'DISCREET_ALERT' : 'IMMEDIATE_THREAT',
        relayHistory: [],
      };

      setActiveAlert(newAlert);
      navigateTo('active_sos');

      if (!isSilent && soundEnabled) {
        sounds.startSiren();
        setIsSirenPlaying(true);
      }

      // Start actual multi-hop transmission via simulator
      await meshSimulator.transmitSosAlert(newAlert, (updated) => {
        setActiveAlert({ ...updated });
        if (updated.status === 'HELPER_ACKNOWLEDGED' && soundEnabled) {
          sounds.playAckReceivedChime();
        }
      });
    },
    [profile, userLocation, keypair, soundEnabled]
  );

  const handleCancelActiveAlert = useCallback(() => {
    sounds.stopSiren();
    setIsSirenPlaying(false);
    if (activeAlert) {
      meshSimulator.addTrace({
        sourceNodeId: 'PHONE_A (Victim)',
        destNodeId: '0xFF:BROADCAST',
        packetType: 'ADV_BEACON',
        hopCount: activeAlert.hopCount,
        bytes: 32,
        description: `Signed 'CANCELLED_SAFE' token broadcasted. Alert ${activeAlert.alertId.slice(0, 8)} cleared.`,
        status: 'SUCCESS',
      });
    }
    setActiveAlert(null);
    navigateTo('home');
  }, [activeAlert]);

  const handleToggleSiren = () => {
    if (isSirenPlaying) {
      sounds.stopSiren();
      setIsSirenPlaying(false);
    } else {
      sounds.startSiren();
      setIsSirenPlaying(true);
    }
  };

  // Helper dashboard actions
  const handleAcknowledgeAlert = (alert: EmergencyAlert, helperName: string) => {
    const updated = meshSimulator.acknowledgeIncomingAlert(alert, helperName);
    setIncomingAlerts((prev) =>
      prev.map((a) => (a.alertId === alert.alertId ? updated : a))
    );
  };

  const handleSimulateIncomingAlert = () => {
    const inbound: EmergencyAlert = {
      alertId: `sos-inbound-${Date.now()}`,
      senderId: 'PEER_KAVITA_9921',
      senderName: 'Kavita Patel',
      createdAt: Date.now() - 1000 * 45,
      expiresAt: Date.now() + 25 * 60 * 1000,
      location: {
        latitude: 28.6148,
        longitude: 77.2112,
        accuracyMeters: 18,
        timestamp: Date.now() - 1000 * 45,
        isStale: false,
        provider: 'GPS_HARDWARE',
      },
      hopCount: 1,
      maxHops: 3,
      status: 'NEARBY_DEVICE_RECEIVED',
      statusMessage: 'Distress beacon received via BLE relay hop 1. Immediate responder assistance requested.',
      signature: 'ED25519_VALID_9841',
      payloadDigest: 'SHA256_INBOUND_5512',
      emergencyType: 'IMMEDIATE_THREAT',
      relayHistory: [
        {
          nodeId: 'peer-sm-8401',
          nodeName: 'Pixel 8 (Relay Node)',
          timestamp: Date.now() - 1000 * 30,
          hop: 1,
        },
      ],
    };
    setIncomingAlerts([inbound, ...incomingAlerts]);
    sounds.playAckReceivedChime();
    navigateTo('helper_dashboard');
  };

  const handleToggleBle = (enabled: boolean) => {
    setBleActive(enabled);
    meshSimulator.setBleEnabled(enabled);
  };

  const handleToggleAirplaneMode = () => {
    const next = !isAirplaneMode;
    setIsAirplaneMode(next);
    StorageService.setAirplaneMode(next);
  };

  const handlePurgeAllData = () => {
    StorageService.purgeAllData();
    setProfile(StorageService.getProfile());
    setContacts(StorageService.getContacts());
    setActiveAlert(null);
    setIncomingAlerts([]);
    navigateTo('home');
  };

  // Screen Title Mapping
  const screenMeta = {
    onboarding: { title: 'SURAKSHA MESH', subtitle: 'Offline Mesh Overview' },
    permissions: { title: 'Device Permissions', subtitle: 'BLE & GPS Access' },
    profile_setup: { title: 'Emergency Profile', subtitle: 'Health & Duress Setup' },
    home: { title: 'SURAKSHA MESH', subtitle: 'Offline Protection Active' },
    countdown: { title: 'Emergency Countdown', subtitle: '5s to Broadcast' },
    active_sos: { title: 'Active Emergency Alert', subtitle: 'Encrypted Broadcast' },
    helper_dashboard: { title: 'Helper Dashboard', subtitle: 'Inbound Beacon Monitor' },
    contacts: { title: 'Trusted Safety Ring', subtitle: 'Emergency Contacts' },
    profile: { title: 'Emergency Profile', subtitle: 'Encrypted Health Notes' },
    map: { title: 'Offline Safe Map', subtitle: 'MBTiles Regional Cache' },
    safe_havens: { title: 'Safe-Haven Directory', subtitle: 'Verified Safe Shelters' },
    safe_haven_detail: { title: 'Safe Haven Details', subtitle: selectedHaven?.name || 'Verified Shelter' },
    map_downloads: { title: 'Offline Map Packs', subtitle: 'Local Storage Manager' },
    settings: { title: 'Security & Keystore', subtitle: 'Hardware Cryptography' },
    diagnostics: { title: 'Mesh Radio Diagnostics', subtitle: 'BLE Air Packet Tracer' },
    limitations: { title: 'Limitations & Ethics', subtitle: 'Truthful Delivery Specs' },
    code_viewer: { title: 'Android Kotlin Architecture', subtitle: 'Jetpack Compose Source' },
  }[currentScreen];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${
        themeMode === 'light'
          ? 'bg-gradient-to-br from-[#FFF1F7] via-rose-50 to-[#EFF6FF] text-slate-900'
          : 'bg-gradient-to-br from-[#090d16] via-[#0f172a] to-[#172554] text-slate-100'
      }`}
    >
      {/* Top Global Command Bar (Simulator Controls & Viewport Switcher) */}
      <div className="w-full bg-slate-950/80 backdrop-blur-md border-b border-pink-500/20 px-4 py-2 z-50 text-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand Badge */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-pink-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold tracking-tight bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
              SURAKSHA MESH
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              · Pink & Electric Blue Glassmorphism System
            </span>
          </div>

          {/* Quick Toolbar Navigation / Modifiers */}
          <div className="flex items-center gap-2">
            {/* Viewport frame toggle */}
            <div className="flex items-center bg-slate-900 border border-blue-400/20 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-gradient-to-r from-pink-500 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden sm:inline">Phone Frame</span>
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-gradient-to-r from-pink-500 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span className="hidden sm:inline">Full Desktop</span>
              </button>
            </div>

            {/* Kotlin Code Viewer Shortcut */}
            <button
              onClick={() => navigateTo('code_viewer')}
              className="px-2.5 py-1 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-400/30 text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              <FileCode2 className="w-3 h-3 text-pink-400" />
              <span className="hidden sm:inline">Kotlin Source</span>
            </button>

            {/* Limitations shortcut */}
            <button
              onClick={() => navigateTo('limitations')}
              className="px-2 py-1 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-white/10 text-[11px] font-bold transition-all"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto py-4 px-2 sm:px-4">
        {viewMode === 'mobile' ? (
          /* Phone Frame Viewport */
          <div className="flex justify-center items-center py-2 sm:py-6">
            <div className="relative w-full max-w-[420px] rounded-[42px] p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl shadow-pink-950/40 border-4 border-slate-700/60 ring-1 ring-blue-400/20">
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-slate-950 flex items-center justify-center z-50 pointer-events-none">
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800" />
              </div>

              {/* Inner Screen Viewport Container */}
              <div className="relative overflow-hidden rounded-[32px] bg-slate-950 border border-blue-400/20 min-h-[680px] max-h-[820px] h-[86vh] flex flex-col justify-between">
                {/* Screen Top Bar */}
                <GlassTopBar
                  title={screenMeta.title}
                  subtitle={screenMeta.subtitle}
                  showBack={
                    currentScreen !== 'home' &&
                    currentScreen !== 'onboarding' &&
                    currentScreen !== 'countdown'
                  }
                  onBack={() => navigateTo(previousScreen || 'home')}
                  onTriggerDiscreet={() => setIsDiscreetModalOpen(true)}
                  bleActive={bleActive}
                  gpsActive={!userLocation.isStale}
                  batteryLevel={batteryLevel}
                />

                {/* Scrollable Screen Content */}
                <div className="flex-1 overflow-y-auto">
                  {currentScreen === 'onboarding' && (
                    <OnboardingScreen onContinue={() => navigateTo('permissions')} />
                  )}

                  {currentScreen === 'permissions' && (
                    <PermissionsScreen
                      onContinue={() => navigateTo('profile_setup')}
                      onBack={() => navigateTo('onboarding')}
                    />
                  )}

                  {currentScreen === 'profile_setup' && (
                    <ProfileSetupScreen
                      initialProfile={profile}
                      onSaveAndComplete={(p) => {
                        setProfile(p);
                        StorageService.saveProfile(p);
                        navigateTo('home');
                      }}
                      onBack={() => navigateTo('permissions')}
                    />
                  )}

                  {currentScreen === 'home' && (
                    <HomeScreen
                      location={userLocation}
                      bleActive={bleActive}
                      peers={peers}
                      relayConsent={relayConsent}
                      batteryLevel={batteryLevel}
                      nearestSafeHaven={nearestSafeHaven}
                      onTriggerSos={handleTriggerSos}
                      onNavigateToMap={() => navigateTo('map')}
                      onNavigateToDiagnostics={() => navigateTo('diagnostics')}
                      onNavigateToSafeHavens={() => navigateTo('safe_havens')}
                      soundEnabled={soundEnabled}
                      onToggleSound={() => {
                        const next = !soundEnabled;
                        setSoundEnabled(next);
                        StorageService.setSoundEnabled(next);
                      }}
                    />
                  )}

                  {currentScreen === 'countdown' && (
                    <CountdownScreen
                      onCountdownComplete={handleCountdownComplete}
                      onCancel={() => navigateTo('home')}
                    />
                  )}

                  {currentScreen === 'active_sos' && activeAlert && (
                    <ActiveSosScreen
                      alert={activeAlert}
                      onCancelAlert={handleCancelActiveAlert}
                      onNavigateToMap={() => navigateTo('map')}
                      onNavigateToDiagnostics={() => navigateTo('diagnostics')}
                      isSirenPlaying={isSirenPlaying}
                      onToggleSiren={handleToggleSiren}
                    />
                  )}

                  {currentScreen === 'helper_dashboard' && (
                    <HelperDashboardScreen
                      incomingAlerts={incomingAlerts}
                      onAcknowledgeAlert={handleAcknowledgeAlert}
                      onIgnoreAlert={(id) =>
                        setIncomingAlerts((prev) => prev.filter((a) => a.alertId !== id))
                      }
                      onBlockDevice={(id) => {
                        meshSimulator.addTrace({
                          sourceNodeId: 'LOCAL_HELPER',
                          destNodeId: id,
                          packetType: 'ERROR_DROP',
                          hopCount: 0,
                          bytes: 0,
                          description: `Hardware ID ${id} placed on local blacklist.`,
                          status: 'DROPPED',
                        });
                        setIncomingAlerts((prev) =>
                          prev.filter((a) => a.senderId !== id)
                        );
                      }}
                      onSimulateIncomingAlert={handleSimulateIncomingAlert}
                      onNavigateToMap={() => navigateTo('map')}
                    />
                  )}

                  {currentScreen === 'contacts' && (
                    <TrustedContactsScreen
                      contacts={contacts}
                      onAddContact={(newContact) => {
                        const updated = [newContact, ...contacts];
                        setContacts(updated);
                        StorageService.saveContacts(updated);
                      }}
                      onDeleteContact={(id) => {
                        const updated = contacts.filter((c) => c.contactId !== id);
                        setContacts(updated);
                        StorageService.saveContacts(updated);
                      }}
                      onToggleContactNotify={(id) => {
                        const updated = contacts.map((c) =>
                          c.contactId === id ? { ...c, notifyOnSos: !c.notifyOnSos } : c
                        );
                        setContacts(updated);
                        StorageService.saveContacts(updated);
                      }}
                    />
                  )}

                  {currentScreen === 'profile' && (
                    <EmergencyProfileScreen
                      profile={profile}
                      onSaveProfile={(p) => {
                        setProfile(p);
                        StorageService.saveProfile(p);
                      }}
                    />
                  )}

                  {currentScreen === 'map' && (
                    <OfflineMapScreen
                      userLocation={userLocation}
                      safeHavens={safeHavens}
                      onSelectSafeHaven={(haven) => {
                        setSelectedHaven(haven);
                        navigateTo('safe_haven_detail');
                      }}
                      onNavigateToDownloadManager={() => navigateTo('map_downloads')}
                      isAirplaneMode={isAirplaneMode}
                    />
                  )}

                  {currentScreen === 'safe_havens' && (
                    <SafeHavenDirectoryScreen
                      safeHavens={safeHavens}
                      userLocation={userLocation}
                      onSelectHaven={(h) => {
                        setSelectedHaven(h);
                        navigateTo('safe_haven_detail');
                      }}
                      onNavigateToMap={() => navigateTo('map')}
                    />
                  )}

                  {currentScreen === 'safe_haven_detail' && selectedHaven && (
                    <SafeHavenDetailScreen
                      haven={selectedHaven}
                      onBack={() => navigateTo('safe_havens')}
                      onNavigateToMap={() => navigateTo('map')}
                    />
                  )}

                  {currentScreen === 'map_downloads' && (
                    <MapDownloadManagerScreen
                      packs={mapPacks}
                      onDownloadPack={(id) => {
                        const updated = mapPacks.map((p) =>
                          p.regionId === id
                            ? {
                                ...p,
                                isDownloaded: true,
                                downloadProgress: 100,
                                lastDownloadedAt: new Date().toLocaleDateString(),
                              }
                            : p
                        );
                        setMapPacks(updated);
                        StorageService.saveMapPacks(updated);
                      }}
                      onDeletePack={(id) => {
                        const updated = mapPacks.map((p) =>
                          p.regionId === id
                            ? { ...p, isDownloaded: false, downloadProgress: 0 }
                            : p
                        );
                        setMapPacks(updated);
                        StorageService.saveMapPacks(updated);
                      }}
                      isAirplaneMode={isAirplaneMode}
                      onToggleAirplaneMode={handleToggleAirplaneMode}
                      onBack={() => navigateTo('map')}
                    />
                  )}

                  {currentScreen === 'settings' && (
                    <PrivacySettingsScreen
                      keypair={keypair}
                      relayConsent={relayConsent}
                      onToggleRelayConsent={() => {
                        const next = !relayConsent;
                        setRelayConsent(next);
                        StorageService.setRelayConsent(next);
                      }}
                      locationSharing={locationSharing}
                      onToggleLocationSharing={() => {
                        const next = !locationSharing;
                        setLocationSharing(next);
                        StorageService.setLocationSharingEnabled(next);
                      }}
                      soundEnabled={soundEnabled}
                      onToggleSound={() => {
                        const next = !soundEnabled;
                        setSoundEnabled(next);
                        StorageService.setSoundEnabled(next);
                      }}
                      onPurgeAllData={handlePurgeAllData}
                      onNavigateToCodeViewer={() => navigateTo('code_viewer')}
                    />
                  )}

                  {currentScreen === 'diagnostics' && (
                    <BluetoothDiagnosticsScreen
                      bleEnabled={bleActive}
                      onToggleBle={handleToggleBle}
                      peers={peers}
                      onTogglePeerConsent={(id) =>
                        meshSimulator.togglePeerRelayConsent(id)
                      }
                    />
                  )}

                  {currentScreen === 'limitations' && (
                    <LimitationsAboutScreen
                      onNavigateToCodeViewer={() => navigateTo('code_viewer')}
                    />
                  )}

                  {currentScreen === 'code_viewer' && (
                    <AndroidCodeExplorer onBack={() => navigateTo(previousScreen || 'home')} />
                  )}
                </div>

                {/* Persistent Bottom Tab Bar (hidden during active countdown & code viewer) */}
                {currentScreen !== 'countdown' && currentScreen !== 'code_viewer' && (
                  <GlassNavigationBar
                    currentScreen={currentScreen}
                    onNavigate={navigateTo}
                    incomingAlertCount={incomingAlerts.length}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Full Desktop Viewport */
          <div className="space-y-4">
            <GlassTopBar
              title={screenMeta.title}
              subtitle={screenMeta.subtitle}
              showBack={currentScreen !== 'home'}
              onBack={() => navigateTo(previousScreen || 'home')}
              onTriggerDiscreet={() => setIsDiscreetModalOpen(true)}
              bleActive={bleActive}
              gpsActive={!userLocation.isStale}
              batteryLevel={batteryLevel}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Primary Active Screen */}
              <div className="lg:col-span-8">
                {currentScreen === 'home' && (
                  <HomeScreen
                    location={userLocation}
                    bleActive={bleActive}
                    peers={peers}
                    relayConsent={relayConsent}
                    batteryLevel={batteryLevel}
                    nearestSafeHaven={nearestSafeHaven}
                    onTriggerSos={handleTriggerSos}
                    onNavigateToMap={() => navigateTo('map')}
                    onNavigateToDiagnostics={() => navigateTo('diagnostics')}
                    onNavigateToSafeHavens={() => navigateTo('safe_havens')}
                    soundEnabled={soundEnabled}
                    onToggleSound={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      StorageService.setSoundEnabled(next);
                    }}
                  />
                )}

                {currentScreen === 'countdown' && (
                  <CountdownScreen
                    onCountdownComplete={handleCountdownComplete}
                    onCancel={() => navigateTo('home')}
                  />
                )}

                {currentScreen === 'active_sos' && activeAlert && (
                  <ActiveSosScreen
                    alert={activeAlert}
                    onCancelAlert={handleCancelActiveAlert}
                    onNavigateToMap={() => navigateTo('map')}
                    onNavigateToDiagnostics={() => navigateTo('diagnostics')}
                    isSirenPlaying={isSirenPlaying}
                    onToggleSiren={handleToggleSiren}
                  />
                )}

                {currentScreen === 'map' && (
                  <OfflineMapScreen
                    userLocation={userLocation}
                    safeHavens={safeHavens}
                    onSelectSafeHaven={(haven) => {
                      setSelectedHaven(haven);
                      navigateTo('safe_haven_detail');
                    }}
                    onNavigateToDownloadManager={() => navigateTo('map_downloads')}
                    isAirplaneMode={isAirplaneMode}
                  />
                )}

                {currentScreen === 'safe_havens' && (
                  <SafeHavenDirectoryScreen
                    safeHavens={safeHavens}
                    userLocation={userLocation}
                    onSelectHaven={(h) => {
                      setSelectedHaven(h);
                      navigateTo('safe_haven_detail');
                    }}
                    onNavigateToMap={() => navigateTo('map')}
                  />
                )}

                {currentScreen === 'safe_haven_detail' && selectedHaven && (
                  <SafeHavenDetailScreen
                    haven={selectedHaven}
                    onBack={() => navigateTo('safe_havens')}
                    onNavigateToMap={() => navigateTo('map')}
                  />
                )}

                {currentScreen === 'helper_dashboard' && (
                  <HelperDashboardScreen
                    incomingAlerts={incomingAlerts}
                    onAcknowledgeAlert={handleAcknowledgeAlert}
                    onIgnoreAlert={(id) =>
                      setIncomingAlerts((prev) => prev.filter((a) => a.alertId !== id))
                    }
                    onBlockDevice={(id) =>
                      setIncomingAlerts((prev) => prev.filter((a) => a.senderId !== id))
                    }
                    onSimulateIncomingAlert={handleSimulateIncomingAlert}
                    onNavigateToMap={() => navigateTo('map')}
                  />
                )}

                {currentScreen === 'contacts' && (
                  <TrustedContactsScreen
                    contacts={contacts}
                    onAddContact={(newContact) => {
                      const updated = [newContact, ...contacts];
                      setContacts(updated);
                      StorageService.saveContacts(updated);
                    }}
                    onDeleteContact={(id) => {
                      const updated = contacts.filter((c) => c.contactId !== id);
                      setContacts(updated);
                      StorageService.saveContacts(updated);
                    }}
                    onToggleContactNotify={(id) => {
                      const updated = contacts.map((c) =>
                        c.contactId === id ? { ...c, notifyOnSos: !c.notifyOnSos } : c
                      );
                      setContacts(updated);
                      StorageService.saveContacts(updated);
                    }}
                  />
                )}

                {currentScreen === 'profile' && (
                  <EmergencyProfileScreen
                    profile={profile}
                    onSaveProfile={(p) => {
                      setProfile(p);
                      StorageService.saveProfile(p);
                    }}
                  />
                )}

                {currentScreen === 'settings' && (
                  <PrivacySettingsScreen
                    keypair={keypair}
                    relayConsent={relayConsent}
                    onToggleRelayConsent={() => {
                      const next = !relayConsent;
                      setRelayConsent(next);
                      StorageService.setRelayConsent(next);
                    }}
                    locationSharing={locationSharing}
                    onToggleLocationSharing={() => {
                      const next = !locationSharing;
                      setLocationSharing(next);
                      StorageService.setLocationSharingEnabled(next);
                    }}
                    soundEnabled={soundEnabled}
                    onToggleSound={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      StorageService.setSoundEnabled(next);
                    }}
                    onPurgeAllData={handlePurgeAllData}
                    onNavigateToCodeViewer={() => navigateTo('code_viewer')}
                  />
                )}

                {currentScreen === 'diagnostics' && (
                  <BluetoothDiagnosticsScreen
                    bleEnabled={bleActive}
                    onToggleBle={handleToggleBle}
                    peers={peers}
                    onTogglePeerConsent={(id) =>
                      meshSimulator.togglePeerRelayConsent(id)
                    }
                  />
                )}

                {currentScreen === 'limitations' && (
                  <LimitationsAboutScreen
                    onNavigateToCodeViewer={() => navigateTo('code_viewer')}
                  />
                )}

                {currentScreen === 'code_viewer' && (
                  <AndroidCodeExplorer onBack={() => navigateTo('home')} />
                )}
              </div>

              {/* Right Column: Live Mesh Monitor & Navigation Shortcuts */}
              <div className="lg:col-span-4 space-y-4">
                <BluetoothDiagnosticsScreen
                  bleEnabled={bleActive}
                  onToggleBle={handleToggleBle}
                  peers={peers}
                  onTogglePeerConsent={(id) =>
                    meshSimulator.togglePeerRelayConsent(id)
                  }
                />
              </div>
            </div>

            {currentScreen !== 'countdown' && (
              <GlassNavigationBar
                currentScreen={currentScreen}
                onNavigate={navigateTo}
                incomingAlertCount={incomingAlerts.length}
              />
            )}
          </div>
        )}
      </main>

      {/* Discreet Safety Mode Calculator Modal */}
      <DiscreetModeModal
        isOpen={isDiscreetModalOpen}
        onClose={() => setIsDiscreetModalOpen(false)}
        correctDuressPin={profile.discreetDuressPin || '4921'}
        onSilentSosTriggered={() => {
          setIsDiscreetModalOpen(false);
          handleCountdownComplete(true);
        }}
      />
    </div>
  );
}
