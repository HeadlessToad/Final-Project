// // screens/HomeScreen.tsx

// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Platform,
//   FlatList,
// } from 'react-native';
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../types";
// import { Camera, Coins, Home, Gift, User, Recycle } from 'lucide-react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useAuth } from '../context/AuthContext'; // To get real user data
// import { BottomNavBar } from '../navigation/BottomNavBar';

// // --- THEME COLORS (Derived from your GreenMind design) ---
// const COLORS = {
//   primary: '#4CAF50', // Main Green (Figma var(--primary))
//   secondary: '#8BC34A', // Light Green (Figma var(--secondary))
//   background: '#F9F9F9', // Light background for content area
//   white: '#FFFFFF',
//   text: '#1B5E20', // Dark text color
//   onSurfaceVariant: '#616161', // Gray text for subtle details
//   outline: '#E0E0E0',
// };

// // --- MOCK DATA (Replace with Firestore fetch later) ---
// const mockRecentClassifications = [
//   { id: '1', type: 'Plastic Bottle', points: 15, date: 'Today, 10:30 AM', icon: '🧴' },
//   { id: '2', type: 'Aluminum Can', points: 20, date: 'Today, 9:15 AM', icon: '🥫' },
//   { id: '3', type: 'Paper', points: 10, date: 'Yesterday, 5:20 PM', icon: '📄' },
//   { id: '4', type: 'Glass Bottle', points: 25, date: 'Yesterday, 2:45 PM', icon: '🍾' },
// ];


// type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;
// type ActiveTab = 'home' | 'centers' | 'rewards' | 'profile';

// // --- NavButton Component (Bottom Tab) ---
// interface NavButtonProps {
//   IconComponent: React.ElementType;
//   label: string;
//   active: boolean;
//   onPress: () => void;
// }

// const NavButton: React.FC<NavButtonProps> = ({ IconComponent, label, active, onPress }) => (
//   <TouchableOpacity
//     onPress={onPress}
//     style={styles.navButton}
//   >
//     <IconComponent
//       size={24}
//       color={active ? COLORS.primary : COLORS.onSurfaceVariant}
//     />
//     <Text style={[
//       styles.navButtonLabel,
//       { color: active ? COLORS.primary : COLORS.onSurfaceVariant }
//     ]}>
//       {label}
//     </Text>
//   </TouchableOpacity>
// );

// // --- Main Component ---
// export default function HomeScreen({ navigation }: HomeScreenProps) {
//   // Fetch real user and profile data
//   const { user, profile } = useAuth();

//   // State to control the visual active tab (not functional router state)
//   const [activeTab, setActiveTab] = React.useState<ActiveTab>('home');

//   // Helper to navigate based on the button/tab pressed
//   const handleNavigation = (route: keyof RootStackParamList) => {
//     navigation.navigate(route as any);
//     // Note: We use 'as any' because the route name might not be strictly defined for every possible tab 
//     // without a full RootStackParamList implementation.
//   };

//   const handleTabChange = (tabName: ActiveTab) => {
//     setActiveTab(tabName);
//     if (tabName !== 'home') {
//       // Map the simple tab name to the router route name
//       const routeMap: Record<ActiveTab, keyof RootStackParamList | null> = {
//         'home': null,
//         'centers': 'RecyclingCenters', // Placeholder route name
//         'rewards': 'Rewards',
//         'profile': 'Profile',
//       };
//       if (routeMap[tabName]) {
//         handleNavigation(routeMap[tabName] as keyof RootStackParamList);
//       }
//     }
//   };


//   const renderRecentClassification = ({ item }: { item: typeof mockRecentClassifications[0] }) => (
//     <View style={styles.recentCard}>
//       <View style={styles.recentCardContent}>
//         <Text style={styles.recentIcon}>{item.icon}</Text>
//         <View style={styles.recentTextContainer}>
//           <Text style={styles.recentTitle}>{item.type}</Text>
//           <Text style={styles.recentDate}>{item.date}</Text>
//         </View>
//         <View style={styles.recentPoints}>
//           <Coins size={16} color={COLORS.primary} />
//           <Text style={styles.recentPointsText}>+{item.points}</Text>
//         </View>
//       </View>
//     </View>
//   );

//   const userName = profile?.fullName || user?.email?.split('@')[0] || 'Eco Warrior';
//   const userPoints = profile?.points ?? 0;


//   return (
//     <View style={styles.fullContainer}>
//       <ScrollView contentContainerStyle={styles.scrollContent}>

//         {/* --- Header Section (Gradient Background) --- */}
//         <LinearGradient
//           colors={[COLORS.primary, COLORS.secondary]} // Gradient from primary to secondary green
//           style={styles.headerContainer}
//         >
//           <View style={styles.headerContent}>
//             <View>
//               <Text style={styles.greeting}>Good Morning 👋</Text>
//               <Text style={styles.userName}>{userName}</Text>
//             </View>

//             {/* Profile Button (Top Right) */}
//             <TouchableOpacity
//               onPress={() => handleNavigation('Profile')}
//               style={styles.profileButton}
//               activeOpacity={0.7}
//             >
//               <User size={24} color={COLORS.white} />
//             </TouchableOpacity>
//           </View>

//           {/* Points Balance Card (White/Translucent) */}
//           <View style={styles.pointsCard}>
//             <View style={styles.pointsCardContent}>
//               <View>
//                 <Text style={styles.pointsLabel}>Your Points</Text>
//                 <View style={styles.pointsValueContainer}>
//                   <Coins size={24} color={COLORS.white} />
//                   <Text style={styles.pointsValue}>{userPoints}</Text>
//                 </View>
//               </View>

//               {/* Redeem Button */}
//               <TouchableOpacity
//                 style={styles.redeemButton}
//                 onPress={() => handleNavigation('Rewards')}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.redeemButtonText}>Redeem</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </LinearGradient>

//         {/* --- Main Content --- */}
//         <View style={styles.mainContent}>
//           {/* Scan Waste Button (Primary Action) */}
//           <TouchableOpacity
//             style={styles.scanButton}
//             // 🔥 FIX: Change 'Classify' to 'ScanScreen'
//             onPress={() => handleNavigation('ScanScreen')}
//             activeOpacity={0.8}
//           >
//             <Camera size={24} color={COLORS.white} style={styles.scanButtonIcon} />
//             <Text style={styles.scanButtonText}>Scan Waste</Text>
//           </TouchableOpacity>

//           {/* Recent Classifications */}
//           <View style={styles.recentContainer}>
//             <View style={styles.recentHeader}>
//               <Text style={styles.sectionTitle}>Recent Classifications</Text>
//               <TouchableOpacity onPress={() => handleNavigation('ClassificationHistory')}>
//                 <Text style={styles.viewAllText}>View All</Text>
//               </TouchableOpacity>
//             </View>

//             <FlatList
//               data={mockRecentClassifications}
//               keyExtractor={item => item.id}
//               renderItem={renderRecentClassification}
//               scrollEnabled={false}
//               ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
//             />
//           </View>
//         </View>
//       </ScrollView>

//             {/* --- Bottom Navigation (Required for persistent tabs) --- */}
//             <BottomNavBar currentRoute="Home" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   fullContainer: { flex: 1, backgroundColor: COLORS.background },
//   scrollContent: { paddingBottom: 100 },

//   // --- Header Styles ---
//   headerContainer: {
//     paddingHorizontal: 20,
//     paddingTop: Platform.OS === 'ios' ? 60 : 30, // Adjust for status bar/notch
//     paddingBottom: 40,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     // Shadow to emphasize the header lift
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   greeting: {
//     color: COLORS.white,
//     opacity: 0.8,
//     fontSize: 14,
//     marginBottom: 2,
//   },
//   userName: {
//     color: COLORS.white,
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   profileButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)', // Translucent white circle
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   // --- Points Card Styles ---
//   pointsCard: {
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 15,
//     overflow: 'hidden',
//     marginBottom: 10,
//   },
//   pointsCardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 15,
//   },
//   pointsLabel: {
//     color: COLORS.white,
//     opacity: 0.8,
//     fontSize: 14,
//   },
//   pointsValueContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginTop: 5,
//   },
//   pointsValue: {
//     color: COLORS.white,
//     fontSize: 32,
//     fontWeight: 'bold',
//   },
//   redeemButton: {
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//   },
//   redeemButtonText: {
//     color: COLORS.primary,
//     fontWeight: 'bold',
//     fontSize: 14,
//   },

//   // --- Main Content Styles ---
//   mainContent: {
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//   },

//   // --- Scan Button Styles ---
//   scanButton: {
//     backgroundColor: COLORS.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 15,
//     height: 60,
//     marginBottom: 30,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   scanButtonIcon: {
//     marginRight: 10,
//   },
//   scanButtonText: {
//     color: COLORS.white,
//     fontSize: 18,
//     fontWeight: 'bold',
//   },

//   // --- Recent Classifications ---
//   recentContainer: {
//     paddingBottom: 20,
//   },
//   recentHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   viewAllText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   recentCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 1,
//   },
//   recentCardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 5,
//   },
//   recentIcon: {
//     fontSize: 30, // Large emoji icon
//     marginRight: 15,
//   },
//   recentTextContainer: {
//     flex: 1,
//   },
//   recentTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 2,
//   },
//   recentDate: {
//     fontSize: 12,
//     color: COLORS.onSurfaceVariant,
//   },
//   recentPoints: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginLeft: 10,
//   },
//   recentPointsText: {
//     color: COLORS.primary,
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

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

// Flexible Interface to handle different field names
interface ScanItem {
  id: string;
  label?: string;           // Option A
  classification?: string;  // Option B
  result?: string;          // Option C
  name?: string;            // Option D
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

    // 🔥 DEBUGGING: Trying to find where the data is hidden
    const q = query(
      collection(db, "scans", user.uid, "results"),
      orderBy("timestamp", "desc"), // Ensure you have a field named 'timestamp' in DB
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scansData = snapshot.docs.map(doc => {
        const data = doc.data();
        // 🖨️ This prints your real data to the terminal so you can see the field names!
        console.log("Fetched Scan Data:", data); 
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
  // Tries to find the text in any likely field
  const getScanLabel = (item: ScanItem) => {
    const text = item.label || item.classification || item.result || item.name || "Unknown Item";
    return text.charAt(0).toUpperCase() + text.slice(1); // Capitalize
  };

  const getIconForType = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('plastic') || l.includes('bottle')) return '🧴';
    if (l.includes('can') || l.includes('aluminum') || l.includes('metal')) return '🥫';
    if (l.includes('glass')) return '🍾';
    if (l.includes('paper') || l.includes('box') || l.includes('cardboard')) return '📄';
    return '♻️';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleNavigation = (route: keyof RootStackParamList) => {
    navigation.navigate(route as any);
  };

  const renderRecentClassification = ({ item }: { item: ScanItem }) => {
    // 🔥 Determine the label dynamically
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