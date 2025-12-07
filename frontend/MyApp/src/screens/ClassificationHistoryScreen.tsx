// screens/ClassificationHistoryScreen.tsx

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Platform,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Coins, Calendar, TrendingUp } from 'lucide-react-native'; // TrendingUp for points icon
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#4CAF50', // Main Green
  secondary: '#8BC34A', // Light Green (for gradient end)
  background: '#F9F9F9', 
  white: '#FFFFFF',
  text: '#1B5E20', // Dark Green Text
  onSurfaceVariant: '#616161', // Gray text for subtle details
  outline: '#E0E0E0',
};

// --- MOCK DATA (Matches the structure of the image_ac3738.png) ---
const historyItems = [
  { id: 1, type: 'Plastic Bottle (PET)', date: 'Nov 30, 2025 - 10:30 AM', points: 15, icon: '🧴', confidence: 94 },
  { id: 2, type: 'Aluminum Can', date: 'Nov 30, 2025 - 9:15 AM', points: 20, icon: '🥫', confidence: 98 },
  { id: 3, type: 'Paper', date: 'Nov 29, 2025 - 5:20 PM', points: 10, icon: '📄', confidence: 89 },
  { id: 4, type: 'Glass Bottle', date: 'Nov 29, 2025 - 2:45 PM', points: 25, icon: '🍾', confidence: 92 },
  { id: 5, type: 'Cardboard Box', date: 'Nov 28, 2025 - 4:10 PM', points: 12, icon: '📦', confidence: 96 },
  { id: 6, type: 'Plastic Bag', date: 'Nov 28, 2025 - 11:30 AM', points: 8, icon: '🛍️', confidence: 87 },
  { id: 7, type: 'Metal Can', date: 'Nov 27, 2025 - 3:15 PM', points: 18, icon: '🥫', confidence: 95 },
  { id: 8, type: 'Magazine', date: 'Nov 27, 2025 - 1:20 PM', points: 10, icon: '📰', confidence: 91 }
];

type ClassificationHistoryProps = NativeStackScreenProps<RootStackParamList, "ClassificationHistory">;


// --- History Item Row Renderer ---
const HistoryItemRow: React.FC<{ item: typeof historyItems[0] }> = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <Text style={styles.itemIcon}>{item.icon}</Text>
      <View style={styles.itemDetails}>
        <Text style={styles.itemType}>{item.type}</Text>
        
        {/* Date and Confidence */}
        <View style={styles.metaRow}>
          <Calendar size={14} color={COLORS.onSurfaceVariant} style={styles.metaIcon} />
          <Text style={styles.metaText}>{item.date}</Text>
        </View>
        <Text style={styles.confidenceText}>
          Confidence: {item.confidence}%
        </Text>
      </View>
      
      {/* Points Earned */}
      <View style={styles.pointsEarned}>
        <TrendingUp size={16} color={COLORS.primary} />
        <Text style={styles.pointsText}>+{item.points}</Text>
      </View>
    </View>
  </View>
);


export default function ClassificationHistoryScreen({ navigation }: ClassificationHistoryProps) {
  const totalPoints = historyItems.reduce((sum, item) => sum + item.points, 0);

  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- 1. Summary Card (Gradient Header) --- */}
        <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]} 
            style={styles.summaryCard}
        >
            <View style={styles.summaryRow}>
                {/* Total Classifications */}
                <View>
                    <Text style={styles.summaryLabel}>Total Classifications</Text>
                    <Text style={styles.summaryValue}>{historyItems.length}</Text>
                </View>
                
                {/* Points Earned */}
                <View style={styles.pointsSummary}>
                    <Text style={styles.summaryLabel}>Points Earned</Text>
                    <View style={styles.pointsValueContainer}>
                        <Coins size={24} color={COLORS.white} />
                        <Text style={styles.summaryValue}>{totalPoints}</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>

        {/* --- 2. History List --- */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Recent Activity</Text>
          
          <FlatList
            data={historyItems}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <HistoryItemRow item={item} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 30, }, 

  // --- 1. Summary Card Styles ---
  summaryCard: {
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: COLORS.white,
  },
  summaryLabel: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 14,
    marginBottom: 2,
  },
  summaryValue: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  pointsSummary: {
    alignItems: 'flex-end',
  },
  pointsValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  // --- 2. History List Styles ---
  listContainer: {
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  
  // --- History Row Styles ---
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 15,
  },
  itemIcon: {
    fontSize: 30, // Large emoji icon
  },
  itemDetails: {
    flex: 1,
    paddingRight: 10,
  },
  itemType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  metaIcon: {
    opacity: 0.7,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  confidenceText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  pointsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});