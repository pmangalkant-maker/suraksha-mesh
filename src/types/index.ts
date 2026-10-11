export type ScreenId =
  | 'onboarding'
  | 'permissions'
  | 'profile_setup'
  | 'home'
  | 'countdown'
  | 'active_sos'
  | 'helper_dashboard'
  | 'contacts'
  | 'profile'
  | 'map'
  | 'safe_havens'
  | 'safe_haven_detail'
  | 'map_downloads'
  | 'settings'
  | 'diagnostics'
  | 'limitations'
  | 'code_viewer';

export type AlertDeliveryStatus =
  | 'CREATED'
  | 'STORED_LOCALLY'
  | 'BLE_BROADCASTING'
  | 'NEARBY_DEVICE_RECEIVED'
  | 'RELAYED_HOP_1'
  | 'RELAYED_HOP_2'
  | 'HELPER_ACKNOWLEDGED'
  | 'EXPIRED'
  | 'CANCELLED_SAFE';

export interface LocationMetadata {
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  timestamp: number | null;
  isStale: boolean;
  provider: 'GPS_HARDWARE' | 'NETWORK_ESTIMATE' | 'MANUAL_OFFLINE' | 'UNAVAILABLE';
}

export interface EmergencyAlert {
  alertId: string;
  senderId: string;
  senderName: string;
  createdAt: number;
  expiresAt: number;
  location: LocationMetadata;
  hopCount: number;
  maxHops: number;
  status: AlertDeliveryStatus;
  statusMessage: string;
  signature: string;
  payloadDigest: string;
  emergencyType: 'IMMEDIATE_THREAT' | 'DISCREET_ALERT' | 'MEDICAL' | 'STALKER_REPORT';
  acknowledgedBy?: {
    helperId: string;
    helperName: string;
    ackTimestamp: number;
    estimatedDistanceMeters?: number;
    note?: string;
  };
  relayHistory: {
    nodeId: string;
    nodeName: string;
    timestamp: number;
    hop: number;
    batteryLevel?: number;
  }[];
}

export interface SafeHaven {
  placeId: string;
  name: string;
  category: 'POLICE_STATION' | 'PHARMACY_24X7' | 'METRO_STATION' | 'COMMUNITY_CENTRE' | 'HOSPITAL' | 'VERIFIED_SHOP';
  latitude: number;
  longitude: number;
  address: string;
  distanceMeters?: number;
  verificationSource: string;
  lastVerifiedAt: string;
  publishedHours: string;
  contactPhone: string;
  isOpenNow: boolean;
  hasSecurityPersonnel: boolean;
  hasCctvCoverage: boolean;
  checkInEnabled: boolean;
}

export interface TrustedContact {
  contactId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  optedIn: boolean;
  notifyOnSos: boolean;
  canReceiveBle: boolean;
  lastSeenMeshAt?: number;
}

export interface EmergencyProfile {
  name: string;
  bloodGroup: string;
  allergies: string;
  medicalConditions: string;
  emergencyInstructions: string;
  primaryLanguage: string;
  shareMedicalDataOnSos: boolean;
  discreetDuressPin: string;
}

export interface BlePeerNode {
  nodeId: string;
  deviceName: string;
  rssi: number;
  batteryPercent: number;
  isRelayConsented: boolean;
  isGattConnected: boolean;
  lastPacketTime: number;
  role: 'VICTIM_TRANSMITTER' | 'PASSING_RELAY_PHONE' | 'SAFE_HAVEN_HELPER';
}

export interface MapRegionPack {
  regionId: string;
  name: string;
  sizeMb: number;
  tileCount: number;
  isDownloaded: boolean;
  downloadProgress: number;
  lastDownloadedAt?: string;
  centerCoordinates: [number, number];
  zoomLevels: string;
}

export interface SecurityKeypair {
  publicKeyHex: string;
  keyAlgorithm: 'Ed25519-Keystore-Emulated';
  createdAt: number;
  keystoreAlias: string;
  hardwareBacked: boolean;
}
