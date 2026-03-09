// src/services/locationVerificationService.ts
// Location verification for recycling points - users must be at a relevant recycling center

import * as Location from 'expo-location';
import { Center, REAL_CENTERS } from '../data/recyclingData';

// Verification radius in meters (25m for GPS reliability)
export const VERIFICATION_RADIUS_METERS = 25;

// Maps ML prediction labels to recycling center wasteTypes
export const ML_TO_CENTER_TYPE_MAP: Record<string, string[]> = {
  'PLASTIC': ['Plastic'],
  'GLASS': ['Glass'],
  'PAPER': ['Paper'],
  'CARDBOARD': ['Paper'],  // Cardboard goes to paper recycling
  'METAL': ['Cans'],
  'TRASH': [],             // General waste - no recycling points
};

export interface LocationVerificationResult {
  success: boolean;           // Did the verification process complete?
  isVerified: boolean;        // Is user at a valid recycling center?
  nearestCenter: Center | null;
  distanceMeters: number | null;
  errorMessage: string | null;
  hasMatchingCenters: boolean; // Are there any centers for this waste type?
}

// Convert degrees to radians
const deg2rad = (deg: number): number => deg * (Math.PI / 180);

// Haversine formula - returns distance in METERS
export const getDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
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

// Format distance for display
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

// Find all centers that accept the given ML category
export const findRelevantCenters = (mlLabel: string): Center[] => {
  const upperLabel = mlLabel.toUpperCase();
  const acceptedTypes = ML_TO_CENTER_TYPE_MAP[upperLabel] || [];

  if (acceptedTypes.length === 0) {
    return [];
  }

  return REAL_CENTERS.filter((center) =>
    center.wasteTypes.some((type) => acceptedTypes.includes(type))
  );
};

// Find the nearest center that accepts the waste type
export const findNearestRelevantCenter = (
  userLat: number,
  userLon: number,
  mlLabel: string
): { center: Center | null; distanceMeters: number } => {
  const relevantCenters = findRelevantCenters(mlLabel);

  if (relevantCenters.length === 0) {
    return { center: null, distanceMeters: Infinity };
  }

  let nearestCenter: Center | null = null;
  let minDistance = Infinity;

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

// Main verification function
export const verifyLocationForRecycling = async (
  mlLabel: string
): Promise<LocationVerificationResult> => {
  const upperLabel = mlLabel.toUpperCase();
  const acceptedTypes = ML_TO_CENTER_TYPE_MAP[upperLabel] || [];

  // Check if this waste type has matching recycling centers
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

  // Request location permission
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

  // Get current location with high accuracy
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

  // Find nearest relevant center
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
