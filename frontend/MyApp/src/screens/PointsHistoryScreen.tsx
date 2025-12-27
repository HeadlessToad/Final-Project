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
import { ArrowUpCircle, ArrowDownCircle, Coins, ShoppingBag, Clock, CheckCircle2 } from 'lucide-react-native'; 
import { LinearGradient } from 'expo-linear-gradient';

// Firebase Imports
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; 
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
  
  // Status Colors
  pendingText: '#F57C00',
  pendingBg: '#FFF3E0',
  deliveredText: '#2E7D32',
  deliveredBg: '#E8F5E9',
};

// --- TYPES ---
interface PurchaseTransaction {
    id: string;
    productName: string; 
    pointsPaid: number;  
    purchaseDate: string; 
    status: string; // <--- Added Status Field
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
                    status: data.status || 'DELIVERED', // Default to DELIVERED if field is missing
                });
            });

            // Sort newest first
            fetchedData.sort((a, b) => {
                const dateA = new Date(a.purchaseDate).getTime();
                const dateB = new Date(b.purchaseDate).getTime();
                return dateB - dateA; 
            });

            setHistory(fetchedData);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
            refreshProfile(); 
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
    const renderItem = ({ item }: { item: PurchaseTransaction }) => {
        // Determine Status Style
        const isPending = item.status === 'PENDING_DELIVERY';
        const statusLabel = isPending ? 'Pending' : 'Delivered';
        const statusColor = isPending ? COLORS.pendingText : COLORS.deliveredText;
        const statusBg = isPending ? COLORS.pendingBg : COLORS.deliveredBg;
        const StatusIcon = isPending ? Clock : CheckCircle2;

        return (
            <View style={styles.transactionRow}>
                {/* Icon Circle */}
                <View style={[styles.transactionIconCircle, { backgroundColor: COLORS.lightOrangeBackground }]}>
                    <ShoppingBag size={20} color={COLORS.redeemedOrange} />
                </View>
                
                {/* Details Column */}
                <View style={styles.transactionDetails}>
                    <Text style={styles.descriptionText}>{item.productName}</Text>
                    
                    <View style={styles.metaRow}>
                        <Text style={styles.dateText}>{formatDate(item.purchaseDate)}</Text>
                        
                        {/* Status Badge */}
                        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                            <StatusIcon size={10} color={statusColor} style={{ marginRight: 3 }} />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {statusLabel}
                            </Text>
                        </View>
                    </View>
                </View>
                
                {/* Price */}
                <Text style={[styles.pointsValueText, { color: COLORS.redeemedOrange }]}>
                    -{item.pointsPaid}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.fullContainer}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* --- 1. Summary Cards (Top Section) --- */}
                <View style={styles.summaryContainer}>
                    
                    {/* Earned Card */}
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

                    {/* Redeemed Card */}
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

                {/* --- 2. Transactions List --- */}
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
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  // New Status Badge Styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pointsValueText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});