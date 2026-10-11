import React, { useState, useMemo } from 'react';
import {
  Compass,
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  Phone,
  ShieldCheck,
  ChevronRight,
  Filter,
  ArrowRight,
  QrCode,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassBadge } from '../components/glass/GlassBadge';
import { SafeHaven, LocationMetadata } from '../types';
import { GeoService } from '../services/geoService';

interface SafeHavenDirectoryScreenProps {
  safeHavens: SafeHaven[];
  userLocation: LocationMetadata;
  onSelectHaven: (haven: SafeHaven) => void;
  onNavigateToMap: () => void;
}

export const SafeHavenDirectoryScreen: React.FC<SafeHavenDirectoryScreenProps> = ({
  safeHavens,
  userLocation,
  onSelectHaven,
  onNavigateToMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Compute distances and sort
  const havensWithDistances = useMemo(() => {
    return safeHavens.map((h) => {
      const dist =
        userLocation.latitude && userLocation.longitude
          ? GeoService.calculateDistanceMeters(
              userLocation.latitude,
              userLocation.longitude,
              h.latitude,
              h.longitude
            )
          : h.distanceMeters ?? 500;
      return { ...h, distanceMeters: dist };
    });
  }, [safeHavens, userLocation]);

  const filteredHavens = useMemo(() => {
    return havensWithDistances
      .filter((h) => {
        const matchesCategory =
          selectedCategory === 'ALL' || h.category === selectedCategory;
        const matchesQuery =
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  }, [havensWithDistances, selectedCategory, searchQuery]);

  const categories = [
    { id: 'ALL', label: 'All Safe Places' },
    { id: 'POLICE_STATION', label: 'Pink Booths & Police' },
    { id: 'PHARMACY_24X7', label: '24/7 Pharmacies' },
    { id: 'METRO_STATION', label: 'Metro Help Desks' },
    { id: 'HOSPITAL', label: 'Hospitals' },
    { id: 'COMMUNITY_CENTRE', label: 'Colleges & Hubs' },
  ];

  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-lg mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white">Safe-Haven Network</h1>
          <p className="text-xs text-slate-400">
            Verified offline shelters, security booths & 24/7 safe zones
          </p>
        </div>
        <GlassButton
          variant="glass-outline"
          size="sm"
          onClick={onNavigateToMap}
          icon={<Compass className="w-4 h-4 text-blue-400" />}
        >
          View Map
        </GlassButton>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by street, landmark, or category..."
          className="w-full py-2.5 pl-10 pr-4 bg-slate-900/70 border border-blue-400/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 backdrop-blur-md"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all select-none ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-blue-600 text-white shadow-md shadow-pink-500/20'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-blue-400/10'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Directory List */}
      <div className="space-y-3">
        {filteredHavens.map((haven) => (
          <GlassCard
            key={haven.placeId}
            glow="none"
            className="p-4 hover:border-pink-400/40"
            interactive
            onClick={() => onSelectHaven(haven)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-pink-300 bg-pink-500/15 px-2 py-0.5 rounded border border-pink-400/20">
                    {haven.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-blue-300 font-bold">
                    {GeoService.formatDistance(haven.distanceMeters)}
                  </span>
                  {haven.isOpenNow && (
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Open Now
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white pt-0.5">{haven.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{haven.address}</p>

                <div className="flex flex-wrap items-center gap-3 pt-1.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" /> {haven.publishedHours}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-500" /> {haven.contactPhone}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 text-slate-300 shrink-0 self-center">
                <ChevronRight className="w-5 h-5 text-pink-400" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
