// src/services/locationVerificationService.ts
// ============================================================================
// SERVICE PURPOSE:
// This service handles the core geofencing and location verification logic.
// It determines if a user is physically standing near a valid recycling center
// that accepts the specific type of waste they just scanned.
// ============================================================================

import * as Location from 'expo-location';
import { Center, REAL_CENTERS } from '../data/recyclingData';

// Verification radius in meters. 
// 25m accounts for standard civilian GPS inaccuracies while ensuring the user is genuinely at the bin.
export const VERIFICATION_RADIUS_METERS = 25;

// Maps the raw machine learning prediction labels (from YOLO/Backend) 
// to the localized categories used in our database.
export const ML_TO_CENTER_TYPE_MAP: Record<string, string[]> = {
  'PLASTIC': ['Plastic'],
  'GLASS': ['Glass'],
  'PAPER': ['Paper'],
  'CARDBOARD': ['Cardboard'],
  'METAL': ['Metal'],        
  'TRASH': [],                // General waste - no recycling points available
};

// Represents the detailed outcome of a location verification attempt
export interface LocationVerificationResult {
  success: boolean;           // Did the verification process complete without app/GPS errors?
  isVerified: boolean;        // Is the user actually within the 25m radius?
  nearestCenter: Center | null; // Data of the closest matching bin
  distanceMeters: number | null; // Distance to that bin
  errorMessage: string | null;   // User-facing error message (if any)
  hasMatchingCenters: boolean;   // True if the waste type is recyclable in this city at all
}

// ----------------------------------------------------------------------------
// MATHEMATICAL HELPERS
// ----------------------------------------------------------------------------

// Convert degrees to radians (needed for trigonometry in distance calculation)
const deg2rad = (deg: number): number => deg * (Math.PI / 180);

// Haversine formula implementation
// Calculates the "great-circle" distance between two points on a sphere (the Earth).
// Returns the exact distance in METERS.
export const getDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's mean radius in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Formats a raw meter value into a clean, human-readable string (e.g., "150m" or "2.3km")
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

// ----------------------------------------------------------------------------
// CENTER MATCHING LOGIC
// ----------------------------------------------------------------------------

// Filters the master database to find all centers that accept the scanned waste type
export const findRelevantCenters = (mlLabel: string): Center[] => {
  const upperLabel = mlLabel.toUpperCase();
  const acceptedTypes = ML_TO_CENTER_TYPE_MAP[upperLabel] || [];

  // If it's trash or an unknown item, return an empty array immediately
  if (acceptedTypes.length === 0) {
    return [];
  }

  // Filter centers where at least one of their accepted waste types matches our list
  return REAL_CENTERS.filter((center) =>
    center.wasteTypes.some((type) => acceptedTypes.includes(type))
  );
};

// Iterates through all relevant centers to find the absolute closest one to the user
export const findNearestRelevantCenter = (
  userLat: number,
  userLon: number,
  mlLabel: string
): { center: Center | null; distanceMeters: number } => {
  const relevantCenters = findRelevantCenters(mlLabel);

  // If no bins accept this item, return infinity
  if (relevantCenters.length === 0) {
    return { center: null, distanceMeters: Infinity };
  }

  let nearestCenter: Center | null = null;
  let minDistance = Infinity;

  // Calculate distance for every valid bin and keep the minimum
  for (const center of relevantCenters) {
    const distance = getDistanceMeters(
      userLat,
      userLon,
      center.latitude,
      center.longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestCenter = center;
    }
  }

  return { center: nearestCenter, distanceMeters: minDistance };
};

// ----------------------------------------------------------------------------
// MAIN ORCHESTRATOR
// ----------------------------------------------------------------------------

// Main verification function called by the UI.
// It handles permissions, GPS fetching, calculations, and generates the final result object.
export const verifyLocationForRecycling = async (
  mlLabel: string
): Promise<LocationVerificationResult> => {
  const upperLabel = mlLabel.toUpperCase();
  const acceptedTypes = ML_TO_CENTER_TYPE_MAP[upperLabel] || [];

  // 1. Fast-fail: Check if this waste type has ANY matching recycling centers
  if (acceptedTypes.length === 0) {
    return {
      success: true,
      isVerified: false,
      nearestCenter: null,
      distanceMeters: null,
      errorMessage: `No recycling centers accept ${mlLabel} items.`,
      hasMatchingCenters: false,
    };
  }

  // 2. Request native location permissions from the OS
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    return {
      success: false,
      isVerified: false,
      nearestCenter: null,
      distanceMeters: null,
      errorMessage: 'Location permission is required to verify recycling and earn points.',
      hasMatchingCenters: true,
    };
  }

  // 3. Fetch the current GPS coordinates (High accuracy requires more battery but is needed for 25m precision)
  let userLocation: Location.LocationObject;
  try {
    userLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch (error) {
    return {
      success: false,
      isVerified: false,
      nearestCenter: null,
      distanceMeters: null,
      errorMessage: 'Could not get your location. Please try again.',
      hasMatchingCenters: true,
    };
  }

  const { latitude, longitude } = userLocation.coords;

  // 4. Find the nearest relevant center based on the fetched coordinates
  const { center, distanceMeters } = findNearestRelevantCenter(
    latitude,
    longitude,
    mlLabel
  );

  if (!center) {
    return {
      success: true,
      isVerified: false,
      nearestCenter: null,
      distanceMeters: null,
      errorMessage: `No recycling centers found that accept ${mlLabel}.`,
      hasMatchingCenters: false,
    };
  }

  // 5. Final Evaluation: Check if the distance is within our strict 25m geofence
  const isWithinRange = distanceMeters <= VERIFICATION_RADIUS_METERS;

  return {
    success: true,
    isVerified: isWithinRange,
    nearestCenter: center,
    distanceMeters: Math.round(distanceMeters),
    errorMessage: isWithinRange
      ? null
      : `You are ${formatDistance(distanceMeters)} away from the nearest recycling center.`,
    hasMatchingCenters: true,
  };
};