// screens/RecyclingCentersScreen.tsx
// ============================================================================
// COMPONENT PURPOSE:
// An interactive Map and List view showing local recycling centers.
// It calculates the user's distance to each center, allows filtering by waste
// category, and listens to real-time community reports from Firestore.
// If a center is reported missing 3+ times, it is marked as "Blocked".
// ============================================================================

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
  ScrollView,
  BackHandler,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import type { Center } from "../data/recyclingData";
import * as Location from "expo-location";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import {
  MapPin,
  AlertTriangle,
  Eye,
  Navigation,
  XCircle,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react-native";
import { BottomNavBar } from "../navigation/BottomNavBar";
import { REAL_CENTERS } from "../data/recyclingData";
import { usePrefetch } from "../context/PrefetchContext";

// 🔥 FIREBASE IMPORTS
import { db } from "../firebaseConfig";
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";
import Toast from "react-native-toast-message";

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------
// Explanation: This uses the Haversine formula to calculate the "as the crow flies"
// distance between two GPS coordinates on a sphere (Earth) in Kilometers.
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};
const deg2rad = (deg: number) => deg * (Math.PI / 180);

// Centralized color palette
const COLORS = {
  primary: "#4CAF50",
  background: "#F9F9F9",
  white: "#FFFFFF",
  text: "#1B5E20",
  error: "#F44336",
  info: "#2196F3",
  onSurfaceVariant: "#616161",
  disabled: "#9E9E9E",
  chipSelected: "#E8F5E9",
  chipBorder: "#C8E6C9",
};

type RecyclingCentersProps = NativeStackScreenProps<
  RootStackParamList,
  "RecyclingCenters"
>;

export default function RecyclingCentersScreen({
  navigation,
  route,
}: RecyclingCentersProps) {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const mapRef = useRef<MapView>(null);
  const hasAnimatedToLocationRef = useRef(false);

  const { userLocation: prefetchedLocation } = usePrefetch();

  // If the user was navigated here from the Classification Result screen,
  // this holds the specific center they were directed to.
  const focusCenter = route.params?.focusCenter;

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Firebase Realtime Data: Stores strike counts for missing centers (e.g., { 101: 2, 102: 5 })
  const [reportCounts, setReportCounts] = useState<{ [key: number]: number }>(
    {},
  );

  // Holds the center currently selected by the user (shows the floating card)
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

  // State for toggling between the split map/list view and the full map view
  const [isListCollapsed, setIsListCollapsed] = useState(false);

  // --------------------------------------------------------------------------
  // DATA PROCESSING
  // --------------------------------------------------------------------------
  // 1. EXTRACT CATEGORIES (Memoized)
  // useMemo ensures we only extract the unique categories from REAL_CENTERS ONCE
  // when the app loads, rather than recalculating on every re-render.
  const allCategories = useMemo(() => {
    const types = new Set<string>();
    REAL_CENTERS.forEach((center) => {
      center.wasteTypes.forEach((type) => types.add(type));
    });
    return ["All", ...Array.from(types).sort()];
  }, []);

  // 2. FILTER & SORT LOGIC
  // Takes the raw JSON data, filters it based on the selected chip (e.g., "Plastic"),
  // and then sorts the remaining items so the closest ones appear at the top of the list.
  const displayedCenters = useMemo(() => {
    const filtered = REAL_CENTERS.filter((center) => {
      if (selectedCategory === "All") return true;
      return center.wasteTypes.includes(selectedCategory);
    });

    if (!location) return filtered; // Show all (unsorted) until GPS resolves

    const userLat = location.coords.latitude;
    const userLon = location.coords.longitude;

    return filtered.sort((a, b) => {
      const distA = parseFloat(
        getDistance(userLat, userLon, a.latitude, a.longitude),
      );
      const distB = parseFloat(
        getDistance(userLat, userLon, b.latitude, b.longitude),
      );
      return distA - distB; // Sort ascending (closest first)
    });
  }, [location, selectedCategory]);

  // --------------------------------------------------------------------------
  // EFFECTS & LISTENERS
  // --------------------------------------------------------------------------

  // --- 3. FIREBASE LISTENER (COMMUNITY REPORTS) ---
  // One collection-level listener replaces the old per-center approach.
  // Previously 800+ individual onSnapshot calls caused hundreds of sequential
  // re-renders on mount, freezing the UI. Now a single listener fires once with
  // all report docs and does one setReportCounts update.
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reports"), (snapshot) => {
      const counts: { [key: number]: number } = {};
      snapshot.forEach((docSnap) => {
        const id = parseInt(docSnap.id, 10);
        if (!isNaN(id)) {
          counts[id] = docSnap.data().count || 0;
        }
      });
      setReportCounts(counts);
    });

    // Cleanup: Remove listener when the component unmounts
    return () => unsub();
  }, []);

  // --- 3.5 FOCUS ON SPECIFIC CENTER ---
  // If navigating from ClassificationResultScreen with a target center,
  // animate the map to zoom in on that center and open its floating card.
  useEffect(() => {
    if (focusCenter && mapRef.current) {
      // Animate map
      mapRef.current.animateToRegion(
        {
          latitude: focusCenter.latitude,
          longitude: focusCenter.longitude,
          latitudeDelta: 0.01, // Zoom in tight
          longitudeDelta: 0.01,
        },
        1000,
      );

      // Find the full center data locally to populate the card
      const fullCenter = REAL_CENTERS.find((c) => c.id === focusCenter.id);
      if (fullCenter) {
        setSelectedCenter(fullCenter);
      }
    }
  }, [focusCenter]);

  // --- 5. LOCATION SETUP ---
  // If the prefetch already resolved GPS, apply it immediately.
  // Always kick off a fresh high-accuracy fix in the background to update the location.
  useEffect(() => {
    if (prefetchedLocation && !location) {
      setLocation(prefetchedLocation);
    }
  }, [prefetchedLocation]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "We need location to find nearby centers.",
        });
        return;
      }
      let freshLocation = await Location.getCurrentPositionAsync({});
      setLocation(freshLocation);
    })();
  }, []);

  // --- 5.5 ANIMATE TO USER LOCATION ---
  // Once GPS resolves (from prefetch or fresh fix), animate the map to the user's
  // position. Only fires once; focusCenter navigation takes priority.
  useEffect(() => {
    if (
      location &&
      mapRef.current &&
      !focusCenter &&
      !hasAnimatedToLocationRef.current
    ) {
      hasAnimatedToLocationRef.current = true;
      mapRef.current.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        1000,
      );
    }
  }, [location, focusCenter]);

  // Handle hardware back button (Android) or swipe back (iOS).
  // If a floating card is open, close it first instead of leaving the screen.
  useEffect(() => {
    const onBackPress = () => {
      if (selectedCenter) {
        handleCloseCard();
        return true; // Prevent default back behavior
      }
      return false; // Allow normal back navigation
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );
    return () => subscription.remove();
  }, [selectedCenter]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  // --- 4. REPORT HANDLER ---
  // Submits a "Missing/Damaged" report to Firestore.
  // 3 reports = blocked (disabled navigation).
  const handleReport = (
    id: number,
    centerName: string,
    centerAddress: string,
    centerLat: number,
    centerLng: number,
  ) => {
    // Keep Alert here because we WANT to interrupt the user to confirm a destructive action.
    Alert.alert("Report Issue", `Is ${centerName} missing or damaged?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report as Missing",
        onPress: async () => {
          try {
            const docRef = doc(db, "reports", id.toString());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              // Increment the strike count
              await updateDoc(docRef, { count: increment(1) });
            } else {
              // Create the first report for this center
              await setDoc(docRef, {
                id: id,
                count: 1,
                name: centerName,
                address: centerAddress,
                coordinates: { latitude: centerLat, longitude: centerLng },
                firstReportedAt: new Date().toISOString(),
              });
            }

            Toast.show({
              type: "success",
              text1: "Report Sent",
              text2: "Thank you for helping the community! 🌍",
              position: "top",
              topOffset: 60,
            });
          } catch (error) {
            console.error("Error reporting:", error);
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Could not send report. Try again.",
            });
          }
        },
        style: "destructive",
      },
    ]);
  };

  // Opens external Google Maps app or web browser for driving directions
  const handleNavigation = (id: number, lat: number, lng: number) => {
    const strikes = reportCounts[id] || 0;

    // Prevent navigation if the community marked it as missing (3 strikes)
    if (strikes >= 3) {
      Toast.show({
        type: "error",
        text1: "Navigation Disabled",
        text2: "This center has been reported missing by the community.",
        position: "top",
        topOffset: 60,
      });
      return;
    }

    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    );
  };

  // Opens external Google Maps Street View
  const openStreetView = (lat: number, lng: number) => {
    Linking.openURL(
      `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&layer=c&cbll=${lat},${lng}`,
    );
  };

  // Handler for tapping a pin on the map
  const handleMarkerPress = (center: Center) => {
    setSelectedCenter(center);
    setIsListCollapsed(true); // Maximize the map view
  };

  // Handler for closing the floating card
  const handleCloseCard = () => {
    setSelectedCenter(null);
    setIsListCollapsed(false); // Restore the split view
  };

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------
  return (
    <View style={styles.fullContainer}>
      {/* --- MAP SECTION --- */}
      <View
        style={[
          styles.mapContainer,
          isListCollapsed && styles.mapContainerExpanded, // Expands map if list is collapsed
        ]}
      >
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          showsUserLocation={true}
          initialRegion={
            location
              ? {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }
              : {
                  // Default region (Tel Aviv) shown before GPS resolves
                  latitude: 32.08,
                  longitude: 34.78,
                  latitudeDelta: 0.15,
                  longitudeDelta: 0.15,
                }
          }
        >
          {/* Render all center pins */}
          {displayedCenters.map((center) => {
            const isBlocked = (reportCounts[center.id] || 0) >= 3;
            const isSelected = selectedCenter?.id === center.id;

            return (
              <Marker
                key={center.id}
                coordinate={{
                  latitude: center.latitude,
                  longitude: center.longitude,
                }}
                opacity={isBlocked ? 0.5 : 1} // Fade out blocked centers
                pinColor={isSelected ? "blue" : isBlocked ? "grey" : "red"}
                onPress={() => handleMarkerPress(center)}
              >
                {/* Tooltip shown when tapping a marker before it triggers full selection */}
                <Callout
                  tooltip
                  onPress={() =>
                    handleNavigation(
                      center.id,
                      center.latitude,
                      center.longitude,
                    )
                  }
                >
                  <View style={styles.calloutBubble}>
                    <Text style={styles.calloutTitle}>{center.name}</Text>
                    {isBlocked ? (
                      <Text style={{ color: "red", fontWeight: "bold" }}>
                        ⚠️ REPORTED ({reportCounts[center.id]})
                      </Text>
                    ) : (
                      <Text style={styles.navigateText}>Tap to Drive 🚗</Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>

        {/* --- FLOATING DETAIL CARD --- */}
        {/* Shown overlaid on the map when a specific center is selected */}
        {selectedCenter &&
          (() => {
            const item = selectedCenter;
            const dist = location
              ? getDistance(
                  location.coords.latitude,
                  location.coords.longitude,
                  item.latitude,
                  item.longitude,
                )
              : "?";
            const strikes = reportCounts[item.id] || 0;
            const isBlocked = strikes >= 3;

            return (
              <View style={styles.floatingCardContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseCard}
                >
                  <X size={20} color={COLORS.text} />
                </TouchableOpacity>
                <View
                  style={[
                    styles.centerCard,
                    styles.floatingCard,
                    isBlocked && styles.disabledCard,
                  ]}
                >
                  {/* Card Header (Clickable for Navigation) */}
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() =>
                      handleNavigation(item.id, item.latitude, item.longitude)
                    }
                    disabled={isBlocked}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        isBlocked && { backgroundColor: "#EEE" },
                      ]}
                    >
                      {isBlocked ? (
                        <XCircle size={24} color={COLORS.disabled} />
                      ) : (
                        <MapPin size={24} color={COLORS.primary} />
                      )}
                    </View>
                    <View style={styles.centerDetails}>
                      <Text
                        style={[
                          styles.centerName,
                          isBlocked && { color: COLORS.disabled },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.centerTypes}>
                        {item.wasteTypes.map((type, i) => (
                          <Text
                            key={i}
                            style={
                              type === selectedCategory
                                ? { fontWeight: "bold", color: COLORS.primary }
                                : {}
                            }
                          >
                            {type}
                            {i < item.wasteTypes.length - 1 ? " · " : ""}
                          </Text>
                        ))}
                      </Text>
                      <Text style={styles.distanceText}>{dist} km away</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Card Actions (Drive, Photo, Report) */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        handleNavigation(item.id, item.latitude, item.longitude)
                      }
                    >
                      <Navigation
                        size={18}
                        color={isBlocked ? COLORS.disabled : COLORS.primary}
                      />
                      <Text
                        style={[
                          styles.actionText,
                          {
                            color: isBlocked ? COLORS.disabled : COLORS.primary,
                          },
                        ]}
                      >
                        {isBlocked ? "Blocked" : "Drive"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        openStreetView(item.latitude, item.longitude)
                      }
                    >
                      <Eye size={18} color={COLORS.info} />
                      <Text style={[styles.actionText, { color: COLORS.info }]}>
                        Photo
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        handleReport(
                          item.id,
                          item.name,
                          item.address,
                          item.latitude,
                          item.longitude,
                        )
                      }
                    >
                      <AlertTriangle
                        size={18}
                        color={isBlocked ? COLORS.disabled : COLORS.error}
                      />
                      <Text
                        style={[
                          styles.actionText,
                          { color: isBlocked ? COLORS.disabled : COLORS.error },
                        ]}
                      >
                        Report ({strikes})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })()}
      </View>

      {/* --- BOTTOM LIST SECTION --- */}
      {/* Contains Category Chips and the FlatList of all nearby centers */}
      <View
        style={[
          styles.listContainer,
          isListCollapsed && styles.listContainerCollapsed,
        ]}
      >
        {/* Collapse/Expand Handle Toggle */}
        <TouchableOpacity
          style={[
            styles.collapseToggle,
            isListCollapsed && styles.collapseToggleCollapsed,
          ]}
          onPress={() => setIsListCollapsed(!isListCollapsed)}
        >
          <View style={styles.dragHandle} />
          <View style={styles.toggleContent}>
            {isListCollapsed ? (
              <>
                <ChevronUp size={20} color={COLORS.primary} />
                <Text style={styles.toggleText}>Show nearby centers</Text>
              </>
            ) : (
              <ChevronDown size={20} color={COLORS.onSurfaceVariant} />
            )}
          </View>
        </TouchableOpacity>

        {!isListCollapsed && (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.listTitle}>Nearby Centers</Text>
              <Text style={styles.resultCount}>
                {displayedCenters.length} found
              </Text>
            </View>

            {/* Filter Chips (Horizontal Scroll) */}
            <View style={styles.filterContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {allCategories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* List of centers */}
            <FlatList
              data={displayedCenters}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const dist = location
                  ? getDistance(
                      location.coords.latitude,
                      location.coords.longitude,
                      item.latitude,
                      item.longitude,
                    )
                  : "?";

                const strikes = reportCounts[item.id] || 0;
                const isBlocked = strikes >= 3;

                return (
                  <View
                    style={[
                      styles.centerCard,
                      isBlocked && styles.disabledCard,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.cardHeader}
                      onPress={() =>
                        handleNavigation(item.id, item.latitude, item.longitude)
                      }
                      disabled={isBlocked}
                    >
                      <View
                        style={[
                          styles.iconCircle,
                          isBlocked && { backgroundColor: "#EEE" },
                        ]}
                      >
                        {isBlocked ? (
                          <XCircle size={24} color={COLORS.disabled} />
                        ) : (
                          <MapPin size={24} color={COLORS.primary} />
                        )}
                      </View>
                      <View style={styles.centerDetails}>
                        <Text
                          style={[
                            styles.centerName,
                            isBlocked && { color: COLORS.disabled },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.centerTypes}>
                          {item.wasteTypes.map((type, i) => (
                            <Text
                              key={i}
                              style={
                                type === selectedCategory
                                  ? {
                                      fontWeight: "bold",
                                      color: COLORS.primary,
                                    }
                                  : {}
                              }
                            >
                              {type}
                              {i < item.wasteTypes.length - 1 ? " · " : ""}
                            </Text>
                          ))}
                        </Text>
                        <Text style={styles.distanceText}>{dist} km away</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          handleNavigation(
                            item.id,
                            item.latitude,
                            item.longitude,
                          )
                        }
                      >
                        <Navigation
                          size={18}
                          color={isBlocked ? COLORS.disabled : COLORS.primary}
                        />
                        <Text
                          style={[
                            styles.actionText,
                            {
                              color: isBlocked
                                ? COLORS.disabled
                                : COLORS.primary,
                            },
                          ]}
                        >
                          {isBlocked ? "Blocked" : "Drive"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          openStreetView(item.latitude, item.longitude)
                        }
                      >
                        <Eye size={18} color={COLORS.info} />
                        <Text
                          style={[styles.actionText, { color: COLORS.info }]}
                        >
                          Photo
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          handleReport(
                            item.id,
                            item.name,
                            item.address,
                            item.latitude,
                            item.longitude,
                          )
                        }
                      >
                        <AlertTriangle
                          size={18}
                          color={isBlocked ? COLORS.disabled : COLORS.error}
                        />
                        <Text
                          style={[
                            styles.actionText,
                            {
                              color: isBlocked ? COLORS.disabled : COLORS.error,
                            },
                          ]}
                        >
                          Report ({strikes})
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          </>
        )}
      </View>

      {/* Global Bottom Navigation */}
      <BottomNavBar currentRoute="RecyclingCenters" />
    </View>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { height: "35%", width: "100%", position: "relative" },
  mapContainerExpanded: { flex: 1, height: "auto" },
  map: { width: "100%", height: "100%" },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    height: "100%",
  },
  loadingText: { marginTop: 10, color: COLORS.text },

  // Floating card styles
  floatingCardContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  floatingCard: {
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: -12,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 11,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  calloutBubble: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    width: 180,
    alignItems: "center",
    elevation: 5,
  },
  calloutTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 5 },
  navigateText: { color: COLORS.primary, fontWeight: "bold", fontSize: 12 },

  // List section styles
  listContainer: {
    flex: 1,
    padding: 15,
    paddingBottom: 0,
    backgroundColor: COLORS.background,
  },
  listContainerCollapsed: {
    flex: 0,
    padding: 0,
    backgroundColor: COLORS.white,
  },
  collapseToggle: {
    alignItems: "center",
    paddingVertical: 8,
  },
  collapseToggleCollapsed: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
    marginTop: -10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
    marginBottom: 4,
  },
  toggleContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  listTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.text },
  resultCount: { fontSize: 12, color: COLORS.onSurfaceVariant },

  // Filter Chips
  filterContainer: { marginBottom: 15, height: 40 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 8,
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: COLORS.chipSelected,
    borderColor: COLORS.chipBorder,
  },
  chipText: { fontSize: 13, color: COLORS.onSurfaceVariant },
  chipTextActive: { color: COLORS.primary, fontWeight: "bold" },

  // List Cards
  centerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
  },
  disabledCard: { backgroundColor: "#F5F5F5", opacity: 0.8 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  centerDetails: { flex: 1 },
  centerName: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
  centerTypes: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
  distanceText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 2,
  },

  // Action Buttons row inside cards
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 10,
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  actionText: { fontSize: 13, fontWeight: "600" },
});
