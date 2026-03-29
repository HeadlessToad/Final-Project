// src/context/PrefetchContext.tsx
// ============================================================================
// COMPONENT PURPOSE:
// Fires background prefetches immediately after login so that data is ready
// by the time the user navigates to RecyclingCentersScreen or CommunityReviewScreen.
// Prefetches: (1) user GPS location, (2) pending images from the Flask API.
// ============================================================================

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';

export interface PendingImage {
  image_id: string;
  image_url: string;
  created_at: string | null;
}

interface PrefetchContextType {
  pendingImages: PendingImage[] | null;
  pendingImagesLoading: boolean;
  userLocation: Location.LocationObject | null;
  locationLoading: boolean;
  refreshPendingImages: () => Promise<void>;
}

const PrefetchContext = createContext<PrefetchContextType>({
  pendingImages: null,
  pendingImagesLoading: false,
  userLocation: null,
  locationLoading: false,
  refreshPendingImages: async () => {},
});

export const usePrefetch = () => useContext(PrefetchContext);

const API_URL = 'https://waste-classifier-eu-89824582784.europe-west1.run.app';

export const PrefetchProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const [pendingImages, setPendingImages] = useState<PendingImage[] | null>(null);
  const [pendingImagesLoading, setPendingImagesLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Prevents double-fetch if the component re-renders while a fetch is in flight
  const prefetchFiredRef = useRef(false);

  const fetchPendingImages = async () => {
    try {
      setPendingImagesLoading(true);
      const response = await fetch(`${API_URL}/pending-images`);
      const data = await response.json();
      if (data.success && data.pending_images) {
        setPendingImages(data.pending_images);
      } else {
        setPendingImages([]);
      }
    } catch {
      // Swallow — CommunityReviewScreen handles its own error state on fallback
      setPendingImages([]);
    } finally {
      setPendingImagesLoading(false);
    }
  };

  // Loads the user's last known location from Firestore (field: lastLocation)
  // and applies it immediately so the map has a region before GPS resolves.
  const loadSavedLocation = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data.lastLocation?.latitude && data.lastLocation?.longitude) {
          // Wrap in a LocationObject shape so consumers don't need special handling
          setUserLocation({
            coords: {
              latitude: data.lastLocation.latitude,
              longitude: data.lastLocation.longitude,
              altitude: null,
              accuracy: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: 0,
          } as Location.LocationObject);
        }
      }
    } catch {
      // Swallow — GPS fetch will still run and provide location
    }
  };

  const fetchLocation = async (uid: string) => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(loc);
      // Persist the fresh location so next login can show it immediately
      await updateDoc(doc(db, 'users', uid), {
        lastLocation: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
      });
    } catch {
      // Swallow — RecyclingCentersScreen handles its own GPS request
    } finally {
      setLocationLoading(false);
    }
  };

  // Re-fetches pending images and resets the cache (called by CommunityReviewScreen after consuming)
  const refreshPendingImages = async () => {
    setPendingImages(null);
    await fetchPendingImages();
  };

  useEffect(() => {
    if (user && !prefetchFiredRef.current) {
      prefetchFiredRef.current = true;
      // Load last saved location immediately (before GPS resolves)
      loadSavedLocation(user.uid);
      // Fire both in parallel — neither blocks the other
      fetchPendingImages();
      fetchLocation(user.uid);
    }

    if (!user) {
      // Clear cached data and allow re-fetch on next login
      prefetchFiredRef.current = false;
      setPendingImages(null);
      setUserLocation(null);
    }
  }, [user]);

  return (
    <PrefetchContext.Provider
      value={{ pendingImages, pendingImagesLoading, userLocation, locationLoading, refreshPendingImages }}
    >
      {children}
    </PrefetchContext.Provider>
  );
};
