// screens/PointsHistoryScreen.tsx

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  Platform,
} from 'react-native'; 
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { ArrowUpCircle, ArrowDownCircle, Coins } from 'lucide-react-native'; 
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  // Main Theme Colors
  primary: '#4CAF50', 
  secondary: '#8BC34A', 
  background: '#F9F9F9', 
  white: '#FFFFFF',
  text: '#1B5E20', 
  onSurfaceVariant: '#616161', 
  outline: '#E0E0E0',
  
  // Specific Colors for Points History (Matching the image)
  earnedGreen: '#00C853', // Bright Green for points/icons
  redeemedOrange: '#FF9800', // Orange/Amber for points/icons
  lightGreenBackground: '#E8F5E9', // Very light green background color
  lightOrangeBackground: '#FFF3E0', // Very light orange background color
};

// --- MOCK DATA (Unchanged) ---
interface Transaction {
    id: number;
    type: 'earn' | 'redeem';
    description: string;
    points: number;
    date: string;
}

const transactions: Transaction[] = [
    { id: 1, type: 'earn', description: 'Scanned Plastic Bottle', points: 15, date: 'Nov 30, 2025 - 10:30 AM' },
    { id: 2, type: 'earn', description: 'Scanned Aluminum Can', points: 20, date: 'Nov 30, 2025 - 9:15 AM' },
    { id: 3, type: 'redeem', description: 'Coffee Shop Voucher', points: 200, date: 'Nov 29, 2025 - 8:00 PM' }, 
    { id: 4, type: 'earn', description: 'Scanned Paper', points: 10, date: 'Nov 29, 2025 - 5:20 PM' },
    { id: 5, type: 'earn', description: 'Scanned Glass Bottle', points: 25, date: 'Nov 29, 2025 - 2:45 PM' },
    { id: 6, type: 'earn', description: 'Scanned Cardboard Box', points: 12, date: 'Nov 28, 2025 - 4:10 PM' },
    { id: 7, type: 'earn', description: 'Scanned Plastic Bag', points: 8, date: 'Nov 28, 2025 - 11:30 AM' },
    { id: 8, type: 'redeem', description: 'Eco Tote Bag', points: 250, date: 'Nov 27, 2025 - 6:45 PM' }, 
    { id: 9, type: 'earn', description: 'Scanned Metal Can', points: 18, date: 'Nov 27, 2025 - 3:15 PM' },
    { id: 10, type: 'earn', description: 'Scanned Magazine', points: 10, date: 'Nov 27, 2025 - 1:20 PM' }
];

type PointsHistoryProps = NativeStackScreenProps<RootStackParamList, "PointsHistory">;


// --- Transaction Row Renderer (Unchanged) ---
const TransactionRow: React.FC<{ item: Transaction }> = ({ item }) => {
    const isEarn = item.type === 'earn';
    const iconColor = isEarn ? COLORS.earnedGreen : COLORS.redeemedOrange;
    const IconComponent = isEarn ? ArrowUpCircle : ArrowDownCircle;
    const pointsValue = item.points; 

    return (
        <View style={styles.transactionRow}>
            <View style={[styles.transactionIconCircle, { backgroundColor: isEarn ? COLORS.lightGreenBackground : COLORS.lightOrangeBackground }]}>
                <IconComponent size={20} color={iconColor} />
            </View>
            <View style={styles.transactionDetails}>
                <Text style={styles.descriptionText}>{item.description}</Text>
                <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <Text style={[styles.pointsValueText, { color: iconColor }]}>
                {isEarn ? '+' : '-'}
                {pointsValue}
            </Text>
        </View>
    );
};


export default function PointsHistoryScreen({ navigation }: PointsHistoryProps) {
    const totalEarned = transactions
        .filter(t => t.type === 'earn')
        .reduce((sum, t) => sum + t.points, 0);
        
    const totalRedeemed = transactions
        .filter(t => t.type === 'redeem')
        .reduce((sum, t) => sum + t.points, 0);

    return (
        <View style={styles.fullContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* --- 1. Summary Cards (Top Section) --- */}
                <View style={styles.summaryContainer}>
                    
                    {/* Earned Card (WITH GRADIENT) */}
                    <LinearGradient
                        colors={[COLORS.lightGreenBackground, COLORS.white]} // Subtle green to white gradient
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.summaryCardGradient}
                    >
                        <View style={styles.summaryCardContent}>
                            <ArrowUpCircle size={32} color={COLORS.earnedGreen} style={styles.summaryIcon} />
                            <Text style={[styles.summaryLabel, { color: COLORS.earnedGreen }]}>Earned</Text>
                            <View style={styles.summaryPointsValue}>
                                <Coins size={20} color={COLORS.earnedGreen} />
                                <Text style={[styles.summaryTotal, { color: COLORS.earnedGreen }]}>
                                    {totalEarned}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Redeemed Card (WITH GRADIENT) */}
                    <LinearGradient
                        colors={[COLORS.lightOrangeBackground, COLORS.white]} // Subtle orange to white gradient
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
                    <Text style={styles.listTitle}>All Transactions</Text>
                    
                    <FlatList
                        data={transactions}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => <TransactionRow item={item} />}
                        scrollEnabled={false}
                    />
                </View>
                
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 30, paddingHorizontal: 20 }, 

  // --- 1. Summary Card Styles ---
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
    marginHorizontal: -5, // Compensate for card margin
  },
  summaryCardGradient: { // Applied to LinearGradient wrapper
    flex: 1,
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryCardContent: { // Content inside the gradient card
    backgroundColor: COLORS.white, // Ensure content is white to see the gradient edge
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    // We add a slight margin/padding to push the content away from the gradient edge
  },
  summaryIcon: {
    marginBottom: 5,
  },
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

  // --- 2. List Styles (Unchanged) ---
  listSection: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  
  // --- Transaction Row Styles (Unchanged) ---
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
  transactionDetails: {
    flex: 1,
  },
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