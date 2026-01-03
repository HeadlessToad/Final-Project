// screens/HomeScreen.tsx

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
import { Camera, Coins, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { BottomNavBar } from '../navigation/BottomNavBar';

// 🔥 FIREBASE IMPORTS
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const COLORS = {
  primary: '#4CAF50',
  secondary: '#8BC34A',
  background: '#F9F9F9',
  white: '#FFFFFF',
  text: '#1B5E20',
  onSurfaceVariant: '#616161',
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

// Flexible Interface to handle the 'class_name' field from your DB
interface ScanItem {
  id: string;
  class_name?: string; // 🔥 This is the missing field!
  label?: string;       
  classification?: string; 
  result?: string;         
  name?: string;           
  timestamp: any;
  points?: number;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, profile } = useAuth();
  
  const [recentScans, setRecentScans] = useState<ScanItem[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [greeting, setGreeting] = useState("Good Morning");

  // --- 1. GREETING ---
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // --- 2. FETCH REAL SCANS ---
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "scans", user.uid, "results"),
      orderBy("timestamp", "desc"),
      limit(5)
    );

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

    return () => unsubscribe();
  }, [user]);

  // --- HELPER: Smart Label Finder ---
  const getScanLabel = (item: ScanItem) => {
    // 🔥 Added 'class_name' as the first priority
    const text = item.class_name || item.label || item.classification || item.result || item.name || "Unknown Item";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(); // Capitalize first letter
  };

  // --- HELPER: Icon Finder (Matches your History Screen) ---
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

  const handleNavigation = (route: keyof RootStackParamList) => {
    navigation.navigate(route as any);
  };

  const renderRecentClassification = ({ item }: { item: ScanItem }) => {
    const displayLabel = getScanLabel(item);

    return (
      <View style={styles.recentCard}>
        <View style={styles.recentCardContent}>
          <Text style={styles.recentIcon}>{getIconForType(displayLabel)}</Text>
          <View style={styles.recentTextContainer}>
            <Text style={styles.recentTitle}>{displayLabel}</Text>
            <Text style={styles.recentDate}>{formatDate(item.timestamp)}</Text>
          </View>
          <View style={styles.recentPoints}>
            <Coins size={16} color={COLORS.primary} />
            <Text style={styles.recentPointsText}>+{item.points || 10}</Text>
          </View>
        </View>
      </View>
    );
  };

  const userName = profile?.fullName || user?.email?.split('@')[0] || 'Eco Warrior';
  const userPoints = profile?.points ?? 0;

  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* --- Header --- */}
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

        {/* --- Main Content --- */}
        <View style={styles.mainContent}>
          <TouchableOpacity style={styles.scanButton} onPress={() => handleNavigation('ScanScreen')}>
            <Camera size={24} color={COLORS.white} style={{ marginRight: 10 }} />
            <Text style={styles.scanButtonText}>Scan Waste</Text>
          </TouchableOpacity>

          {/* Recent Scans */}
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
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
            )}
          </View>
        </View>
      </ScrollView>
      <BottomNavBar currentRoute="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 100 },
  headerContainer: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  greeting: { color: COLORS.white, fontSize: 16, opacity: 0.9 },
  userName: { color: COLORS.white, fontSize: 24, fontWeight: 'bold' },
  profileButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  pointsCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  pointsCardContent: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pointsLabel: { color: COLORS.white, fontSize: 14, opacity: 0.9 },
  pointsValueContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  pointsValue: { color: COLORS.white, fontSize: 32, fontWeight: 'bold' },
  redeemButton: { backgroundColor: COLORS.white, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  redeemButtonText: { color: COLORS.primary, fontWeight: 'bold' },
  mainContent: { padding: 20 },
  scanButton: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 15, marginBottom: 30, elevation: 4 },
  scanButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
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
  recentPoints: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recentPointsText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
});