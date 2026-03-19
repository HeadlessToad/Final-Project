// screens/HomeScreen.tsx
// ============================================================================
// COMPONENT PURPOSE:
// The main dashboard of the application. It displays the user's current points,
// a dynamic greeting, primary call-to-action buttons (Scan, Community Review), 
// and a real-time feed of their 5 most recent recycling scans from Firestore.
// ============================================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Camera, Coins, User, Navigation, Clock, HelpCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { BottomNavBar } from '../navigation/BottomNavBar';

// 🔥 FIREBASE IMPORTS
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

// Centralized color palette
const COLORS = {
  primary: '#4CAF50',
  secondary: '#8BC34A',
  background: '#F9F9F9',
  white: '#FFFFFF',
  text: '#1B5E20',
  onSurfaceVariant: '#616161',
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

// Flexible Interface to handle the 'class_name' field from the DB.
// It supports multiple fallback fields (label, classification, result) to maintain
// backward compatibility with older scans saved under different schema versions.
interface ScanItem {
  id: string;
  class_name?: string;
  label?: string;
  classification?: string;
  result?: string;
  name?: string;
  timestamp: any;
  points?: number;
  potential_points?: number;
  location_verified?: boolean;
  nearest_center?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  } | null;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  // Pull user authentication and profile data (which contains real-time points)
  const { user, profile } = useAuth();
  
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [recentScans, setRecentScans] = useState<ScanItem[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [greeting, setGreeting] = useState("Good Morning");

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------

  // --- 1. DYNAMIC GREETING ---
  // Sets the greeting text based on the user's local device time.
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // --- 2. FETCH REAL-TIME SCANS ---
  // Sets up a Firestore real-time listener (onSnapshot). 
  // Whenever a user completes a new scan, this list updates automatically without refreshing.
  useEffect(() => {
    if (!user) return;

    // Query: Get the 5 most recent scans for the current user
    const q = query(
      collection(db, "scans", user.uid, "results"),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    // Listen to changes in real-time
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scansData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      }) as ScanItem[];
      
      setRecentScans(scansData);
      setLoadingScans(false);
    }, (error) => {
      console.error("Error fetching scans:", error);
      setLoadingScans(false);
    });

    // Cleanup: Stop listening when the component unmounts to prevent memory leaks
    return () => unsubscribe();
  }, [user]);

  // --------------------------------------------------------------------------
  // HELPER FUNCTIONS
  // --------------------------------------------------------------------------

  // --- HELPER: Smart Label Finder ---
  // Extracts the best available name for the scan item and formats it nicely (e.g., "plastic" -> "Plastic")
  const getScanLabel = (item: ScanItem) => {
    // 🔥 Added 'class_name' as the first priority
    const text = item.class_name || item.label || item.classification || item.result || item.name || "Unknown Item";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(); // Capitalize first letter
  };

  // --- HELPER: Icon Finder ---
  // Maps the string label to a relevant UI emoji
  const getIconForType = (label: string) => {
    const l = label.toUpperCase();
    if (l.includes('PLASTIC') || l.includes('BOTTLE')) return '🧴';
    if (l.includes('METAL') || l.includes('CAN') || l.includes('ALUMINUM')) return '🥫';
    if (l.includes('PAPER')) return '📄';
    if (l.includes('GLASS')) return '🍾';
    if (l.includes('CARDBOARD') || l.includes('BOX')) return '📦';
    if (l.includes('BIO')) return '🍂';
    return '♻️'; // Fallback
  };

  // --- HELPER: Date Formatter ---
  // Converts Firestore timestamps to readable strings. 
  // If the scan happened today, it prints "Today, HH:MM". Otherwise, "MM/DD/YYYY HH:MM".
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // Check if it's today
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString()} ${timeStr}`;
  };

  // Type-safe navigation helper
  const handleNavigation = (route: keyof RootStackParamList) => {
    navigation.navigate(route as any);
  };

  // --------------------------------------------------------------------------
  // RENDERERS
  // --------------------------------------------------------------------------

  // Renders a single row in the "Recent Scans" list
  const renderRecentClassification = ({ item }: { item: ScanItem }) => {
    const displayLabel = getScanLabel(item);
    const isVerified = item.location_verified !== false; // Default to true for legacy items
    const displayPoints = isVerified ? (item.points || 10) : (item.potential_points || 10);

    return (
      <View style={styles.recentCard}>
        <View style={styles.recentCardContent}>
          {/* Icon */}
          <Text style={styles.recentIcon}>{getIconForType(displayLabel)}</Text>
          
          {/* Details */}
          <View style={styles.recentTextContainer}>
            <Text style={styles.recentTitle}>{displayLabel}</Text>
            <Text style={styles.recentDate}>{formatDate(item.timestamp)}</Text>
          </View>
          
          {/* Points & Navigation Button */}
          <View style={styles.recentPointsContainer}>
            {isVerified ? (
              // Verified: Show earned points in green
              <View style={styles.recentPoints}>
                <Coins size={16} color={COLORS.primary} />
                <Text style={styles.recentPointsText}>+{displayPoints}</Text>
              </View>
            ) : (
              // Unverified: Show potential points in orange, with navigation button
              <>
                <View style={styles.potentialPoints}>
                  <Clock size={14} color="#FF9800" />
                  <Text style={styles.potentialPointsText}>+{displayPoints}</Text>
                </View>
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

  // Derived user values for the header
  const userName = profile?.fullName || user?.email?.split('@')[0] || 'Eco Warrior';
  const userPoints = profile?.points ?? 0;

  // --------------------------------------------------------------------------
  // MAIN COMPONENT RENDER
  // --------------------------------------------------------------------------
  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* --- Header & Points Card --- */}
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{greeting} 👋</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            <TouchableOpacity onPress={() => handleNavigation('Profile')} style={styles.profileButton}>
              <User size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Points Card */}
          <View style={styles.pointsCard}>
            <View style={styles.pointsCardContent}>
              <View>
                <Text style={styles.pointsLabel}>Your Points</Text>
                <View style={styles.pointsValueContainer}>
                  <Coins size={24} color={COLORS.white} />
                  <Text style={styles.pointsValue}>{userPoints}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.redeemButton} onPress={() => handleNavigation('Rewards')}>
                <Text style={styles.redeemButtonText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* --- Main Content (Action Buttons & List) --- */}
        <View style={styles.mainContent}>
          
          {/* Primary Action: Scan Waste */}
          <TouchableOpacity style={styles.scanButton} onPress={() => handleNavigation('ScanScreen')}>
            <Camera size={24} color={COLORS.white} style={{ marginRight: 10 }} />
            <Text style={styles.scanButtonText}>Scan Waste</Text>
          </TouchableOpacity>

          {/* Secondary Action: Help Us Improve (Community Review) */}
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => handleNavigation('CommunityReview')}
          >
            <HelpCircle size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.helpButtonText}>Help Us Improve</Text>
          </TouchableOpacity>

          {/* Recent Scans Section */}
          <View style={styles.recentContainer}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Scans</Text>
              <TouchableOpacity onPress={() => handleNavigation('ClassificationHistory')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {loadingScans ? (
               <ActivityIndicator size="small" color={COLORS.primary} />
            ) : recentScans.length === 0 ? (
               <Text style={{ textAlign: 'center', color: '#999', marginTop: 10 }}>No scans yet.</Text>
            ) : (
                <FlatList
                  data={recentScans}
                  keyExtractor={item => item.id}
                  renderItem={renderRecentClassification}
                  scrollEnabled={false} // Disabled since it's nested in a ScrollView
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Absolute positioned Bottom Navigation Bar */}
      <BottomNavBar currentRoute="Home" />
    </View>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  // Extra padding bottom ensures content isn't hidden behind the absolute Bottom NavBar
  scrollContent: { paddingBottom: 100 },
  
  // Header Styles
  headerContainer: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  greeting: { color: COLORS.white, fontSize: 16, opacity: 0.9 },
  userName: { color: COLORS.white, fontSize: 24, fontWeight: 'bold' },
  profileButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  
  // Points Card Styles
  pointsCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  pointsCardContent: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pointsLabel: { color: COLORS.white, fontSize: 14, opacity: 0.9 },
  pointsValueContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  pointsValue: { color: COLORS.white, fontSize: 32, fontWeight: 'bold' },
  redeemButton: { backgroundColor: COLORS.white, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  redeemButtonText: { color: COLORS.primary, fontWeight: 'bold' },
  
  // Main Content Styles
  mainContent: { padding: 20 },
  scanButton: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 15, marginBottom: 15, elevation: 4 },
  scanButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  helpButton: { backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 15, marginBottom: 30, borderWidth: 2, borderColor: COLORS.primary },
  helpButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  
  // Recent Scans List Styles
  recentContainer: { paddingBottom: 20 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  viewAllText: { color: COLORS.primary },
  recentCard: { backgroundColor: COLORS.white, padding: 15, borderRadius: 12, elevation: 1 },
  recentCardContent: { flexDirection: 'row', alignItems: 'center' },
  recentIcon: { fontSize: 30, marginRight: 15 },
  recentTextContainer: { flex: 1 },
  recentTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  recentDate: { fontSize: 12, color: COLORS.onSurfaceVariant },
  recentPointsContainer: { alignItems: 'flex-end', gap: 4 },
  recentPoints: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recentPointsText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  potentialPoints: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  potentialPointsText: { color: '#FF9800', fontWeight: 'bold', fontSize: 14 },
  navButton: { backgroundColor: COLORS.primary, padding: 6, borderRadius: 12, marginTop: 4 },
});