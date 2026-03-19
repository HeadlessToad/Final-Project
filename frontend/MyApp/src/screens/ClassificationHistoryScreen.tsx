// screens/ClassificationHistoryScreen.tsx
// ============================================================================
// COMPONENT PURPOSE:
// This screen fetches and displays the user's history of scanned waste items
// from Firestore. It shows the classification type, date, points earned, 
// and whether the location was verified. It also includes a summary card 
// of total scans and points.
// ============================================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Coins, Calendar, TrendingUp, ArrowLeft, Clock, Navigation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// --- FIREBASE IMPORTS ---
import { getFirestore, collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Centralized color palette for consistent UI styling
const COLORS = {
  primary: '#4CAF50',
  secondary: '#8BC34A',
  background: '#F9F9F9',
  white: '#FFFFFF',
  text: '#1B5E20',
  onSurfaceVariant: '#616161',
};

// --- DATA TYPES ---
// Defines the structure of a single scan history record used in the UI
interface HistoryItem {
  id: string;
  type: string;
  date: string;
  points: number;
  potential_points: number;
  icon: string;
  location_verified: boolean;
  nearest_center?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  } | null;
}

// --- HELPER: Map DB Class Names to Icons/UI ---
// Translates the raw classification string from the database into a user-friendly
// label and an emoji icon for the UI.
const getIconForClass = (className: string) => {
  // Safety check if className is undefined or null
  const name = className ? className.toUpperCase() : "UNKNOWN";

  if (name.includes('PLASTIC')) return { icon: '🧴', label: 'Plastic' };
  if (name.includes('METAL') || name.includes('CAN')) return { icon: '🥫', label: 'Metal' };
  if (name.includes('PAPER')) return { icon: '📄', label: 'Paper' };
  if (name.includes('GLASS')) return { icon: '🍾', label: 'Glass' };
  if (name.includes('CARDBOARD')) return { icon: '📦', label: 'Cardboard' };
  if (name.includes('BIO')) return { icon: '🍂', label: 'Biodegradable' };

  return { icon: '🗑️', label: 'General Waste' };
};

type ClassificationHistoryProps = NativeStackScreenProps<RootStackParamList, "ClassificationHistory">;

export default function ClassificationHistoryScreen({ navigation }: ClassificationHistoryProps) {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  // 1. NAVIGATION CONFIGURATION (Back Button)
  // Hide the default React Navigation header so we can use our custom one below
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, 
    });
  }, [navigation]);

  // 2. FETCH DATA ON LOAD
  // Triggers the Firestore data fetch when the component mounts
  useEffect(() => {
    fetchHistory();
  }, []);

  // Fetches the user's scan history from the 'scans/{userId}/results' subcollection
  const fetchHistory = async () => {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "User not logged in");
      setLoading(false);
      return;
    }

    try {
      // Query: scans -> userId -> results (ordered by timestamp, newest first)
      const q = query(
        collection(db, "scans", user.uid, "results"),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const fetchedItems: HistoryItem[] = [];
      let pointsSum = 0;

      // Loop through all documents and format them for the UI
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Format Date (Handle both Firebase Timestamp objects and standard JS Dates)
        let dateStr = "Unknown Date";
        if (data.timestamp) {
          const dateObj = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp);
          dateStr = dateObj.toLocaleDateString() + ' - ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Get Icon and clean Name using our helper function
        const uiDetails = getIconForClass(data.class_name);
        // Default to true for legacy items that might not have this field
        const isVerified = data.location_verified !== false; 

        fetchedItems.push({
          id: doc.id,
          type: uiDetails.label,
          date: dateStr,
          points: data.points || 0,
          potential_points: data.potential_points || data.points || 10,
          icon: uiDetails.icon,
          location_verified: isVerified,
          nearest_center: data.nearest_center || null,
        });

        // Accumulate total points earned across all history items
        pointsSum += (data.points || 0);
      });

      setHistoryItems(fetchedItems);
      setTotalPoints(pointsSum);

    } catch (error) {
      console.error("Error fetching history:", error);
      Alert.alert("Error", "Could not load history. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // 3. RENDER SINGLE ROW
  // Sub-component to render a single scan record in the FlatList
  const HistoryItemRow = ({ item }: { item: HistoryItem }) => {
    // If location is verified, show actual points earned. Otherwise, show potential points.
    const displayPoints = item.location_verified ? item.points : item.potential_points;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {/* Left: Emoji Icon */}
          <Text style={styles.itemIcon}>{item.icon}</Text>
          
          {/* Middle: Text Details */}
          <View style={styles.itemDetails}>
            <Text style={styles.itemType}>{item.type}</Text>
            <View style={styles.metaRow}>
              <Calendar size={14} color={COLORS.onSurfaceVariant} style={styles.metaIcon} />
              <Text style={styles.metaText}>{item.date}</Text>
            </View>
          </View>

          {/* Right: Points & Status */}
          <View style={styles.pointsContainer}>
            {item.location_verified ? (
              // User was at a recycling center -> Points earned (Green)
              <View style={styles.pointsEarned}>
                <TrendingUp size={16} color={COLORS.primary} />
                <Text style={styles.pointsText}>+{displayPoints}</Text>
              </View>
            ) : (
              // User was NOT at a recycling center -> Potential points (Orange) + Nav button
              <>
                <View style={styles.potentialPoints}>
                  <Clock size={14} color="#FF9800" />
                  <Text style={styles.potentialPointsText}>+{displayPoints}</Text>
                </View>
                {/* If the DB saved a nearest center, provide a button to navigate there */}
                {item.nearest_center && (
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('RecyclingCenters', {
                      focusCenter: item.nearest_center!
                    })}
                  >
                    <Navigation size={14} color={COLORS.white} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------
  return (
    <View style={styles.fullContainer}>
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan History</Text>
        {/* Empty view to balance the flex space with the back button */}
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* --- SUMMARY CARD --- */}
        {/* Displays total scans and accumulated points using a nice gradient background */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.summaryCard}
        >
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Scans</Text>
              <Text style={styles.summaryValue}>{historyItems.length}</Text>
            </View>
            <View style={styles.pointsSummary}>
              <Text style={styles.summaryLabel}>Total Points</Text>
              <View style={styles.pointsValueContainer}>
                <Coins size={24} color={COLORS.white} />
                <Text style={styles.summaryValue}>{totalPoints}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* --- LIST SECTION --- */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Recent Activity</Text>

          {loading ? (
            // Show spinner while fetching data from Firestore
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : historyItems.length === 0 ? (
            // Show empty state if the user hasn't scanned anything yet
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No scans yet.</Text>
              <Text style={styles.emptySubText}>Start scanning waste to earn points!</Text>
            </View>
          ) : (
            // Render the list of history items
            <FlatList
              data={historyItems}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <HistoryItemRow item={item} />}
              scrollEnabled={false} // Disabled because it's wrapped inside a ScrollView
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
          )}
        </View>

      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 30 },

  // Custom Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    // Adjust top padding for iOS notch / Android status bar
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },

  // Summary Card
  summaryCard: { padding: 20, marginHorizontal: 20, marginBottom: 20, borderRadius: 15, marginTop: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: COLORS.white, opacity: 0.9, fontSize: 14, marginBottom: 5 },
  summaryValue: { color: COLORS.white, fontSize: 32, fontWeight: 'bold' },
  pointsSummary: { alignItems: 'flex-end' },
  pointsValueContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // List
  listContainer: { paddingHorizontal: 20 },
  listTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },

  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 40, opacity: 0.6 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.onSurfaceVariant },
  emptySubText: { fontSize: 14, color: COLORS.onSurfaceVariant, marginTop: 5 },

  // Card Item (Individual Row)
  card: { backgroundColor: COLORS.white, borderRadius: 12, elevation: 2, padding: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 15 },
  itemIcon: { fontSize: 30 },
  itemDetails: { flex: 1 },
  itemType: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaIcon: { opacity: 0.6 },
  metaText: { fontSize: 13, color: COLORS.onSurfaceVariant },

  // Points UI inside Card
  pointsContainer: { alignItems: 'flex-end', gap: 4 },
  pointsEarned: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pointsText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  potentialPoints: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  potentialPointsText: { color: '#FF9800', fontWeight: 'bold', fontSize: 16 },
  navButton: { backgroundColor: COLORS.primary, padding: 8, borderRadius: 12, marginTop: 4 },
});