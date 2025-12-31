// screens/RecyclingCentersScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Linking
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { MapPin, ChevronRight } from 'lucide-react-native';
import { BottomNavBar } from '../navigation/BottomNavBar';
import { REAL_CENTERS, Center } from '../data/recyclingData';

// --- 🔥 ROBUST NAVIGATION FUNCTION ---
const openNavigation = (lat: number, lng: number, label: string) => {
  // We use a universal Google Maps link. 
  // This works on Android, iOS, and Web automatically.
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  Linking.openURL(url).catch(err => {
    Alert.alert("Error", "Could not open map app.");
    console.error("Navigation Error:", err);
  });
};

// --- Distance Calculation ---
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const deg2rad = (deg: number) => deg * (Math.PI / 180);

const COLORS = {
  primary: '#4CAF50',
  background: '#F9F9F9',
  white: '#FFFFFF',
  text: '#1B5E20',
  onSurfaceVariant: '#616161',
  distanceColor: '#00C853',
};

type RecyclingCentersProps = NativeStackScreenProps<RootStackParamList, "RecyclingCenters">;

export default function RecyclingCentersScreen({ navigation }: RecyclingCentersProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [sortedCenters, setSortedCenters] = useState<Center[]>(REAL_CENTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);

      const userLat = userLocation.coords.latitude;
      const userLon = userLocation.coords.longitude;

      const sorted = [...REAL_CENTERS].sort((a, b) => {
        const distA = parseFloat(getDistance(userLat, userLon, a.latitude, a.longitude));
        const distB = parseFloat(getDistance(userLat, userLon, b.latitude, b.longitude));
        return distA - distB;
      });

      setSortedCenters(sorted);
      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.fullContainer}>
      
      {/* --- MAP SECTION --- */}
      <View style={styles.mapContainer}>
        {loading || !location ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Locating you...</Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            showsUserLocation={true}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {sortedCenters.map((center) => (
              <Marker
                key={center.id}
                coordinate={{ latitude: center.latitude, longitude: center.longitude }}
                // Fallback for marker press
                onCalloutPress={() => openNavigation(center.latitude, center.longitude, center.name)}
              >
                {/* 🔥 CLICKABLE BUBBLE */}
                <Callout 
                  tooltip 
                  onPress={() => openNavigation(center.latitude, center.longitude, center.name)}
                >
                  <View style={styles.calloutBubble}>
                    <Text style={styles.calloutTitle}>{center.name}</Text>
                    <Text style={styles.calloutSubtitle}>{center.wasteTypes.join(', ')}</Text>
                    <View style={styles.calloutButton}>
                        <Text style={styles.calloutButtonText}>Click to Navigate 🚗</Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        )}
      </View>

      {/* --- LIST SECTION --- */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Nearby Centers</Text>
        <Text style={styles.subTitle}>Sorted by distance from you</Text>

        <FlatList
          data={sortedCenters}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => {
            const dist = location 
              ? getDistance(location.coords.latitude, location.coords.longitude, item.latitude, item.longitude)
              : '?';

            return (
              <TouchableOpacity 
                style={styles.centerRow} 
                activeOpacity={0.7}
                onPress={() => openNavigation(item.latitude, item.longitude, item.name)}
              >
                  <View style={styles.iconCircle}>
                      <MapPin size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.centerDetails}>
                      <Text style={styles.centerName}>{item.name}</Text>
                      <Text style={styles.centerAddress}>{item.address}</Text>
                      <Text style={styles.centerTypes}>{item.wasteTypes.join(' · ')}</Text>
                  </View>
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>{dist} km</Text>
                  </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <BottomNavBar currentRoute="RecyclingCenters" />
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { height: '40%', width: '100%' },
  map: { width: '100%', height: '100%' },
  
  loadingContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9', height: '100%' },
  loadingText: { marginTop: 10, color: COLORS.text },

  // --- Callout (Bubble) Styles ---
  calloutBubble: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: 200,
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 0.5,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 5, // Lift it slightly
  },
  calloutTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 2, textAlign: 'center' },
  calloutSubtitle: { fontSize: 12, color: '#666', marginBottom: 5, textAlign: 'center' },
  calloutButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginTop: 5
  },
  calloutButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

  // --- List Styles ---
  listContainer: { flex: 1, padding: 20 },
  listTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  subTitle: { fontSize: 14, color: COLORS.onSurfaceVariant, marginBottom: 15 },

  centerRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: 15, borderRadius: 12, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#E0F2F1',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  centerDetails: { flex: 1 },
  centerName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  centerAddress: { fontSize: 12, color: COLORS.onSurfaceVariant },
  centerTypes: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
  
  distanceBadge: {
    backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8
  },
  distanceText: { fontSize: 14, fontWeight: 'bold', color: COLORS.distanceColor },
});