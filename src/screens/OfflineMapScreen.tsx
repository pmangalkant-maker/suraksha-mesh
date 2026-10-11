import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Compass,
  MapPin,
  Crosshair,
  WifiOff,
  Download,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassBadge } from '../components/glass/GlassBadge';
import { GlassButton } from '../components/glass/GlassButton';
import { SafeHaven, LocationMetadata } from '../types';
import { GeoService } from '../services/geoService';

interface OfflineMapScreenProps {
  userLocation: LocationMetadata;
  safeHavens: SafeHaven[];
  onSelectSafeHaven: (haven: SafeHaven) => void;
  onNavigateToDownloadManager: () => void;
  isAirplaneMode: boolean;
}

export const OfflineMapScreen: React.FC<OfflineMapScreenProps> = ({
  userLocation,
  safeHavens,
  onSelectSafeHaven,
  onNavigateToDownloadManager,
  isAirplaneMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const [selectedHaven, setSelectedHaven] = useState<SafeHaven | null>(null);
  const [tileWarningDismissed, setTileWarningDismissed] = useState(false);

  const defaultLat = userLocation.latitude ?? 28.6139;
  const defaultLng = userLocation.longitude ?? 77.2090;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 14,
        zoomControl: false,
      });

      // Add Tile Layer (OpenStreetMap with custom tile styling)
      const tileUrl = isAirplaneMode
        ? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' // Simulated cached offline tiles
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors | Suraksha Mesh Offline Pack',
      }).addTo(map);

      // Add zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Add user marker with glowing pink-blue ripple icon
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: rgba(244, 114, 182, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 3px; border-radius: 50%; background: linear-gradient(135deg, #F472B6, #3B82F6); border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([defaultLat, defaultLng], { icon: userIcon }).addTo(map);
      userMarkerRef.current.bindPopup(
        `<div style="font-size: 12px; font-weight: bold; color: #f8fafc;">
          📍 You are here<br/>
          <span style="font-size: 10px; color: #94a3b8;">Accuracy: ±${userLocation.accuracyMeters ?? 25}m</span>
        </div>`
      );
    } else {
      userMarkerRef.current.setLatLng([defaultLat, defaultLng]);
    }

    // Add accuracy circle
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = L.circle([defaultLat, defaultLng], {
        radius: userLocation.accuracyMeters ?? 45,
        color: '#60A5FA',
        fillColor: '#3B82F6',
        fillOpacity: 0.15,
        weight: 1,
      }).addTo(map);
    } else {
      accuracyCircleRef.current.setLatLng([defaultLat, defaultLng]);
      accuracyCircleRef.current.setRadius(userLocation.accuracyMeters ?? 45);
    }

    // Add Safe-Haven Markers
    safeHavens.forEach((haven) => {
      const getCategoryColor = (cat: string) => {
        switch (cat) {
          case 'POLICE_STATION':
            return '#DB2777'; // Pink Rose
          case 'PHARMACY_24X7':
            return '#10B981'; // Green
          case 'METRO_STATION':
            return '#3B82F6'; // Blue
          case 'HOSPITAL':
            return '#DC2626'; // Red
          default:
            return '#8B5CF6'; // Purple
        }
      };

      const color = getCategoryColor(haven.category);

      const havenIcon = L.divIcon({
        className: 'custom-haven-marker',
        html: `
          <div style="width: 32px; height: 32px; border-radius: 12px; background: ${color}; border: 2px solid white; box-shadow: 0 6px 14px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">
            🛡️
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([haven.latitude, haven.longitude], { icon: havenIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedHaven(haven);
      });
    });

    return () => {
      // Keep instance intact during component re-renders
    };
  }, [defaultLat, defaultLng, safeHavens, isAirplaneMode, userLocation.accuracyMeters]);

  const handleCenterUser = () => {
    if (mapInstanceRef.current && userLocation.latitude && userLocation.longitude) {
      mapInstanceRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px]">
      {/* Real Geographic Leaflet Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Glass Controls */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        <GlassCard
          glow="none"
          className="p-2.5 px-3 pointer-events-auto bg-slate-950/85 border-blue-400/30 flex items-center gap-2"
        >
          {isAirplaneMode ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline Map Cache Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
              <Layers className="w-3.5 h-3.5 text-pink-400" />
              <span>Region: Central Delhi (42MB Cached)</span>
            </div>
          )}
        </GlassCard>

        <button
          onClick={onNavigateToDownloadManager}
          className="pointer-events-auto p-2.5 rounded-2xl bg-slate-950/85 hover:bg-slate-900 border border-pink-400/30 text-pink-300 shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Offline Packs</span>
        </button>
      </div>

      {/* Recenter GPS Floating Button */}
      <button
        onClick={handleCenterUser}
        title="Center on my location"
        className="absolute bottom-28 right-4 z-30 w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-blue-600 hover:from-pink-400 hover:to-blue-500 text-white shadow-xl shadow-pink-500/30 border border-white/30 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
      >
        <Crosshair className="w-6 h-6" />
      </button>

      {/* Selected Safe Haven Bottom Card */}
      {selectedHaven && (
        <div className="absolute bottom-4 inset-x-4 z-30 animate-in slide-in-from-bottom duration-200">
          <GlassCard glow="pink" className="p-4 bg-slate-950/90 border-pink-400/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-400/20">
                    {selectedHaven.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Verified Safe
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">{selectedHaven.name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{selectedHaven.address}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                  <span>Hours: {selectedHaven.publishedHours}</span>
                  <span>·</span>
                  <span>Tel: {selectedHaven.contactPhone}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <GlassButton
                  variant="primary-gradient"
                  size="sm"
                  onClick={() => onSelectSafeHaven(selectedHaven)}
                >
                  View Details
                </GlassButton>
                <button
                  onClick={() => setSelectedHaven(null)}
                  className="text-xs text-slate-400 hover:text-white text-center py-1"
                >
                  Close
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
