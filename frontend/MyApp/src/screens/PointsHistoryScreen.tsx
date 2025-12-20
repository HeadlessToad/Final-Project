// // screens/PointsHistoryScreen.tsx

// import React from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ScrollView, 
//   FlatList, 
//   Platform,
// } from 'react-native'; 
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../types";
// import { ArrowUpCircle, ArrowDownCircle, Coins } from 'lucide-react-native'; 
// import { LinearGradient } from 'expo-linear-gradient';

// const COLORS = {
//   // Main Theme Colors
//   primary: '#4CAF50', 
//   secondary: '#8BC34A', 
//   background: '#F9F9F9', 
//   white: '#FFFFFF',
//   text: '#1B5E20', 
//   onSurfaceVariant: '#616161', 
//   outline: '#E0E0E0',
  
//   // Specific Colors for Points History (Matching the image)
//   earnedGreen: '#00C853', // Bright Green for points/icons
//   redeemedOrange: '#FF9800', // Orange/Amber for points/icons
//   lightGreenBackground: '#E8F5E9', // Very light green background color
//   lightOrangeBackground: '#FFF3E0', // Very light orange background color
// };

// // --- MOCK DATA (Unchanged) ---
// interface Transaction {
//     id: number;
//     type: 'earn' | 'redeem';
//     description: string;
//     points: number;
//     date: string;
// }

// const transactions: Transaction[] = [
//     { id: 1, type: 'earn', description: 'Scanned Plastic Bottle', points: 15, date: 'Nov 30, 2025 - 10:30 AM' },
//     { id: 2, type: 'earn', description: 'Scanned Aluminum Can', points: 20, date: 'Nov 30, 2025 - 9:15 AM' },
//     { id: 3, type: 'redeem', description: 'Coffee Shop Voucher', points: 200, date: 'Nov 29, 2025 - 8:00 PM' }, 
//     { id: 4, type: 'earn', description: 'Scanned Paper', points: 10, date: 'Nov 29, 2025 - 5:20 PM' },
//     { id: 5, type: 'earn', description: 'Scanned Glass Bottle', points: 25, date: 'Nov 29, 2025 - 2:45 PM' },
//     { id: 6, type: 'earn', description: 'Scanned Cardboard Box', points: 12, date: 'Nov 28, 2025 - 4:10 PM' },
//     { id: 7, type: 'earn', description: 'Scanned Plastic Bag', points: 8, date: 'Nov 28, 2025 - 11:30 AM' },
//     { id: 8, type: 'redeem', description: 'Eco Tote Bag', points: 250, date: 'Nov 27, 2025 - 6:45 PM' }, 
//     { id: 9, type: 'earn', description: 'Scanned Metal Can', points: 18, date: 'Nov 27, 2025 - 3:15 PM' },
//     { id: 10, type: 'earn', description: 'Scanned Magazine', points: 10, date: 'Nov 27, 2025 - 1:20 PM' }
// ];

// type PointsHistoryProps = NativeStackScreenProps<RootStackParamList, "PointsHistory">;


// // --- Transaction Row Renderer (Unchanged) ---
// const TransactionRow: React.FC<{ item: Transaction }> = ({ item }) => {
//     const isEarn = item.type === 'earn';
//     const iconColor = isEarn ? COLORS.earnedGreen : COLORS.redeemedOrange;
//     const IconComponent = isEarn ? ArrowUpCircle : ArrowDownCircle;
//     const pointsValue = item.points; 

//     return (
//         <View style={styles.transactionRow}>
//             <View style={[styles.transactionIconCircle, { backgroundColor: isEarn ? COLORS.lightGreenBackground : COLORS.lightOrangeBackground }]}>
//                 <IconComponent size={20} color={iconColor} />
//             </View>
//             <View style={styles.transactionDetails}>
//                 <Text style={styles.descriptionText}>{item.description}</Text>
//                 <Text style={styles.dateText}>{item.date}</Text>
//             </View>
//             <Text style={[styles.pointsValueText, { color: iconColor }]}>
//                 {isEarn ? '+' : '-'}
//                 {pointsValue}
//             </Text>
//         </View>
//     );
// };


// export default function PointsHistoryScreen({ navigation }: PointsHistoryProps) {
//     const totalEarned = transactions
//         .filter(t => t.type === 'earn')
//         .reduce((sum, t) => sum + t.points, 0);
        
//     const totalRedeemed = transactions
//         .filter(t => t.type === 'redeem')
//         .reduce((sum, t) => sum + t.points, 0);

//     return (
//         <View style={styles.fullContainer}>
//             <ScrollView contentContainerStyle={styles.scrollContent}>
                
//                 {/* --- 1. Summary Cards (Top Section) --- */}
//                 <View style={styles.summaryContainer}>
                    
//                     {/* Earned Card (WITH GRADIENT) */}
//                     <LinearGradient
//                         colors={[COLORS.lightGreenBackground, COLORS.white]} // Subtle green to white gradient
//                         start={{ x: 0, y: 0.5 }}
//                         end={{ x: 1, y: 0.5 }}
//                         style={styles.summaryCardGradient}
//                     >
//                         <View style={styles.summaryCardContent}>
//                             <ArrowUpCircle size={32} color={COLORS.earnedGreen} style={styles.summaryIcon} />
//                             <Text style={[styles.summaryLabel, { color: COLORS.earnedGreen }]}>Earned</Text>
//                             <View style={styles.summaryPointsValue}>
//                                 <Coins size={20} color={COLORS.earnedGreen} />
//                                 <Text style={[styles.summaryTotal, { color: COLORS.earnedGreen }]}>
//                                     {totalEarned}
//                                 </Text>
//                             </View>
//                         </View>
//                     </LinearGradient>

//                     {/* Redeemed Card (WITH GRADIENT) */}
//                     <LinearGradient
//                         colors={[COLORS.lightOrangeBackground, COLORS.white]} // Subtle orange to white gradient
//                         start={{ x: 0, y: 0.5 }}
//                         end={{ x: 1, y: 0.5 }}
//                         style={styles.summaryCardGradient}
//                     >
//                          <View style={styles.summaryCardContent}>
//                             <ArrowDownCircle size={32} color={COLORS.redeemedOrange} style={styles.summaryIcon} />
//                             <Text style={[styles.summaryLabel, { color: COLORS.redeemedOrange }]}>Redeemed</Text>
//                             <View style={styles.summaryPointsValue}>
//                                 <Coins size={20} color={COLORS.redeemedOrange} />
//                                 <Text style={[styles.summaryTotal, { color: COLORS.redeemedOrange }]}>
//                                     {totalRedeemed}
//                                 </Text>
//                             </View>
//                         </View>
//                     </LinearGradient>
//                 </View>

//                 {/* --- 2. Transactions List --- */}
//                 <View style={styles.listSection}>
//                     <Text style={styles.listTitle}>All Transactions</Text>
                    
//                     <FlatList
//                         data={transactions}
//                         keyExtractor={item => item.id.toString()}
//                         renderItem={({ item }) => <TransactionRow item={item} />}
//                         scrollEnabled={false}
//                     />
//                 </View>
                
//             </ScrollView>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//   fullContainer: { flex: 1, backgroundColor: COLORS.background },
//   scrollContent: { paddingBottom: 30, paddingHorizontal: 20 }, 

//   // --- 1. Summary Card Styles ---
//   summaryContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     paddingTop: 10,
//     marginHorizontal: -5, // Compensate for card margin
//   },
//   summaryCardGradient: { // Applied to LinearGradient wrapper
//     flex: 1,
//     borderRadius: 12,
//     marginHorizontal: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   summaryCardContent: { // Content inside the gradient card
//     backgroundColor: COLORS.white, // Ensure content is white to see the gradient edge
//     borderRadius: 12,
//     padding: 15,
//     alignItems: 'center',
//     // We add a slight margin/padding to push the content away from the gradient edge
//   },
//   summaryIcon: {
//     marginBottom: 5,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   summaryPointsValue: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 5,
//   },
//   summaryTotal: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },

//   // --- 2. List Styles (Unchanged) ---
//   listSection: {
//     marginBottom: 20,
//   },
//   listTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginBottom: 15,
//   },
  
//   // --- Transaction Row Styles (Unchanged) ---
//   transactionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     borderRadius: 8,
//     marginBottom: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   transactionIconCircle: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   transactionDetails: {
//     flex: 1,
//   },
//   descriptionText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   dateText: {
//     fontSize: 12,
//     color: COLORS.onSurfaceVariant,
//     marginTop: 2,
//   },
//   pointsValueText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// screens/PointsHistoryScreen.tsx

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  ActivityIndicator,
  RefreshControl
} from 'react-native'; 
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { ArrowUpCircle, ArrowDownCircle, Coins, ShoppingBag } from 'lucide-react-native'; 
import { LinearGradient } from 'expo-linear-gradient';

// Firebase Imports
// NOTE: We removed 'orderBy' from here to fix the missing index issue
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust this path if needed
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const COLORS = {
  primary: '#4CAF50', 
  secondary: '#8BC34A', 
  background: '#F9F9F9', 
  white: '#FFFFFF',
  text: '#1B5E20', 
  onSurfaceVariant: '#616161', 
  outline: '#E0E0E0',
  
  earnedGreen: '#00C853', 
  redeemedOrange: '#FF9800', 
  lightGreenBackground: '#E8F5E9', 
  lightOrangeBackground: '#FFF3E0', 
};

// --- TYPES ---
interface PurchaseTransaction {
    id: string;
    productName: string; // From DB
    pointsPaid: number;  // From DB
    purchaseDate: string; // From DB (ISO String)
}

type PointsHistoryProps = NativeStackScreenProps<RootStackParamList, "PointsHistory">;

export default function PointsHistoryScreen({ navigation }: PointsHistoryProps) {
    const { user, profile, refreshProfile } = useAuth();
    const [history, setHistory] = useState<PurchaseTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- 1. Calculate Stats from User Profile ---
    const totalRedeemed = Number(profile?.rewardsRedeemed || 0);
    const currentBalance = Number(profile?.points || 0);
    const totalEarned = currentBalance + totalRedeemed;

    // --- 2. Fetch Purchase History from Firestore ---
    const fetchHistory = async () => {
        if (!user) return;
        
        try {
            // FIX: Removed 'orderBy' to prevent "Missing Index" errors
            const q = query(
                collection(db, "purchase_history"),
                where("userId", "==", user.uid)
            );

            const querySnapshot = await getDocs(q);
            const fetchedData: PurchaseTransaction[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedData.push({
                    id: doc.id,
                    productName: data.productName,
                    pointsPaid: data.pointsPaid,
                    purchaseDate: data.purchaseDate,
                });
            });

            // FIX: Sort the data here in JavaScript (Newest first)
            fetchedData.sort((a, b) => {
                const dateA = new Date(a.purchaseDate).getTime();
                const dateB = new Date(b.purchaseDate).getTime();
                return dateB - dateA; // Descending order
            });

            setHistory(fetchedData);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Reload data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchHistory();
            refreshProfile(); // Also update the top cards (points balance)
        }, [user])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
        refreshProfile();
    };

    // --- Helper: Format Date ---
    const formatDate = (isoString: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // --- Transaction Row Component ---
    const renderItem = ({ item }: { item: PurchaseTransaction }) => (
        <View style={styles.transactionRow}>
            {/* Icon - Always Orange/Redeem for purchase history */}
            <View style={[styles.transactionIconCircle, { backgroundColor: COLORS.lightOrangeBackground }]}>
                <ShoppingBag size={20} color={COLORS.redeemedOrange} />
            </View>
            
            <View style={styles.transactionDetails}>
                <Text style={styles.descriptionText}>{item.productName}</Text>
                <Text style={styles.dateText}>{formatDate(item.purchaseDate)}</Text>
            </View>
            
            <Text style={[styles.pointsValueText, { color: COLORS.redeemedOrange }]}>
                -{item.pointsPaid}
            </Text>
        </View>
    );

    return (
        <View style={styles.fullContainer}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                
                {/* --- 1. Summary Cards (Top Section) --- */}
                <View style={styles.summaryContainer}>
                    
                    {/* Earned Card (Calculated) */}
                    <LinearGradient
                        colors={[COLORS.lightGreenBackground, COLORS.white]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.summaryCardGradient}
                    >
                        <View style={styles.summaryCardContent}>
                            <ArrowUpCircle size={32} color={COLORS.earnedGreen} style={styles.summaryIcon} />
                            <Text style={[styles.summaryLabel, { color: COLORS.earnedGreen }]}>Lifetime Earned</Text>
                            <View style={styles.summaryPointsValue}>
                                <Coins size={20} color={COLORS.earnedGreen} />
                                <Text style={[styles.summaryTotal, { color: COLORS.earnedGreen }]}>
                                    {totalEarned}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Redeemed Card (From DB) */}
                    <LinearGradient
                        colors={[COLORS.lightOrangeBackground, COLORS.white]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.summaryCardGradient}
                    >
                         <View style={styles.summaryCardContent}>
                            <ArrowDownCircle size={32} color={COLORS.redeemedOrange} style={styles.summaryIcon} />
                            <Text style={[styles.summaryLabel, { color: COLORS.redeemedOrange }]}>Redeemed</Text>
                            <View style={styles.summaryPointsValue}>
                                <Coins size={20} color={COLORS.redeemedOrange} />
                                <Text style={[styles.summaryTotal, { color: COLORS.redeemedOrange }]}>
                                    {totalRedeemed}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* --- 2. Transactions List (DB Data) --- */}
                <View style={styles.listSection}>
                    <Text style={styles.listTitle}>Purchase History</Text>
                    
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                    ) : history.length === 0 ? (
                        <Text style={styles.emptyText}>No rewards redeemed yet.</Text>
                    ) : (
                        <FlatList
                            data={history}
                            keyExtractor={item => item.id}
                            renderItem={renderItem}
                            scrollEnabled={false}
                        />
                    )}
                </View>
                
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 30, paddingHorizontal: 20 }, 

  // --- Summary Card Styles ---
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
    marginHorizontal: -5,
  },
  summaryCardGradient: {
    flex: 1,
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryCardContent: { 
    backgroundColor: COLORS.white, 
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  summaryIcon: { marginBottom: 5 },
  summaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryPointsValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summaryTotal: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  // --- List Styles ---
  listSection: { marginBottom: 20 },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.onSurfaceVariant,
    marginTop: 20,
    fontStyle: 'italic',
  },
  
  // --- Transaction Row Styles ---
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: { flex: 1 },
  descriptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  pointsValueText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});