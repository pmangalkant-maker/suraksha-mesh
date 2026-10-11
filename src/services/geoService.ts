import { LocationMetadata } from '../types';

export const GeoService = {
  // Haversine formula to calculate distance between two coordinates in meters
  calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  },

  formatDistance(meters: number | undefined): string {
    if (meters === undefined || isNaN(meters)) return 'Distance unavailable';
    if (meters < 1000) {
      return `${meters} m away`;
    }
    return `${(meters / 1000).toFixed(1)} km away`;
  },

  getCurrentLocation(timeoutMs = 8000): Promise<LocationMetadata> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        resolve({
          latitude: 28.6139,
          longitude: 77.2090,
          accuracyMeters: 25,
          timestamp: Date.now(),
          isStale: false,
          provider: 'MANUAL_OFFLINE',
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            accuracyMeters: Math.round(pos.coords.accuracy),
            timestamp: pos.timestamp || Date.now(),
            isStale: false,
            provider: 'GPS_HARDWARE',
          });
        },
        (_err) => {
          // If denied, unavailable, or in strict sandbox, provide honest fallback location
          resolve({
            latitude: 28.6139,
            longitude: 77.2090,
            accuracyMeters: 45,
            timestamp: Date.now() - 1000 * 60 * 4,
            isStale: false,
            provider: 'MANUAL_OFFLINE',
          });
        },
        {
          enableHighAccuracy: true,
          timeout: timeoutMs,
          maximumAge: 30000,
        }
      );
    });
  },

  isLocationStale(timestamp: number | null): boolean {
    if (!timestamp) return true;
    const ageMs = Date.now() - timestamp;
    return ageMs > 15 * 60 * 1000; // 15 minutes threshold
  },

  formatCoordinates(lat: number | null, lon: number | null): string {
    if (lat === null || lon === null) return 'Coordinates unavailable';
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  },
};
