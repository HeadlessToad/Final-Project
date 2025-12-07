// screens/HomeScreen.tsx

import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Platform,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Camera, Coins, Home, Gift, User, Recycle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext'; // To get real user data

// --- THEME COLORS (Derived from your GreenMind design) ---
const COLORS = {
  primary: '#4CAF50', // Main Green (Figma var(--primary))
  secondary: '#8BC34A', // Light Green (Figma var(--secondary))
  background: '#F9F9F9', // Light background for content area
  white: '#FFFFFF',
  text: '#1B5E20', // Dark text color
  onSurfaceVariant: '#616161', // Gray text for subtle details
  outline: '#E0E0E0',
};

// --- MOCK DATA (Replace with Firestore fetch later) ---
const mockRecentClassifications = [
  { id: '1', type: 'Plastic Bottle', points: 15, date: 'Today, 10:30 AM', icon: '🧴' },
  { id: '2', type: 'Aluminum Can', points: 20, date: 'Today, 9:15 AM', icon: '🥫' },
  { id: '3', type: 'Paper', points: 10, date: 'Yesterday, 5:20 PM', icon: '📄' },
  { id: '4', type: 'Glass Bottle', points: 25, date: 'Yesterday, 2:45 PM', icon: '🍾' },
];


type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;
type ActiveTab = 'home' | 'centers' | 'rewards' | 'profile';

// --- NavButton Component (Bottom Tab) ---
interface NavButtonProps {
  IconComponent: React.ElementType;
  label: string;
  active: boolean;
  onPress: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ IconComponent, label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.navButton}
  >
    <IconComponent 
      size={24} 
      color={active ? COLORS.primary : COLORS.onSurfaceVariant} 
    />
    <Text style={[
      styles.navButtonLabel, 
      { color: active ? COLORS.primary : COLORS.onSurfaceVariant }
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// --- Main Component ---
export default function HomeScreen({ navigation }: HomeScreenProps) {
  // Fetch real user and profile data
  const { user, profile } = useAuth(); 
  
  // State to control the visual active tab (not functional router state)
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('home');

  // Helper to navigate based on the button/tab pressed
  const handleNavigation = (route: keyof RootStackParamList) => {
    navigation.navigate(route as any);
    // Note: We use 'as any' because the route name might not be strictly defined for every possible tab 
    // without a full RootStackParamList implementation.
  };

  const handleTabChange = (tabName: ActiveTab) => {
    setActiveTab(tabName);
    if (tabName !== 'home') {
      // Map the simple tab name to the router route name
      const routeMap: Record<ActiveTab, keyof RootStackParamList | null> = {
        'home': null,
        'centers': 'RecyclingCenters', // Placeholder route name
        'rewards': 'Rewards',
        'profile': 'Profile',
      };
      if (routeMap[tabName]) {
        handleNavigation(routeMap[tabName] as keyof RootStackParamList);
      }
    }
  };


  const renderRecentClassification = ({ item }: { item: typeof mockRecentClassifications[0] }) => (
    <View style={styles.recentCard}>
      <View style={styles.recentCardContent}>
        <Text style={styles.recentIcon}>{item.icon}</Text>
        <View style={styles.recentTextContainer}>
          <Text style={styles.recentTitle}>{item.type}</Text>
          <Text style={styles.recentDate}>{item.date}</Text>
        </View>
        <View style={styles.recentPoints}>
          <Coins size={16} color={COLORS.primary} />
          <Text style={styles.recentPointsText}>+{item.points}</Text>
        </View>
      </View>
    </View>
  );

  const userName = profile?.displayName || user?.email?.split('@')[0] || 'Eco Warrior';
  const userPoints = profile?.points ?? 0;


  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- Header Section (Gradient Background) --- */}
        <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]} // Gradient from primary to secondary green
            style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good Morning 👋</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            
            {/* Profile Button (Top Right) */}
            <TouchableOpacity
              onPress={() => handleNavigation('Profile')}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <User size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Points Balance Card (White/Translucent) */}
          <View style={styles.pointsCard}>
            <View style={styles.pointsCardContent}>
              <View>
                <Text style={styles.pointsLabel}>Your Points</Text>
                <View style={styles.pointsValueContainer}>
                  <Coins size={24} color={COLORS.white} />
                  <Text style={styles.pointsValue}>{userPoints}</Text>
                </View>
              </View>
              
              {/* Redeem Button */}
              <TouchableOpacity
                style={styles.redeemButton}
                onPress={() => handleNavigation('Rewards')}
                activeOpacity={0.8}
              >
                <Text style={styles.redeemButtonText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* --- Main Content --- */}
        <View style={styles.mainContent}>
          {/* Scan Waste Button (Primary Action) */}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => handleNavigation('Classify')}
            activeOpacity={0.8}
          >
            <Camera size={24} color={COLORS.white} style={styles.scanButtonIcon} />
            <Text style={styles.scanButtonText}>Scan Waste</Text>
          </TouchableOpacity>

          {/* Recent Classifications */}
          <View style={styles.recentContainer}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Classifications</Text>
              <TouchableOpacity onPress={() => handleNavigation('ClassificationHistory')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={mockRecentClassifications}
              keyExtractor={item => item.id}
              renderItem={renderRecentClassification}
              scrollEnabled={false} 
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
          </View>
        </View>
      </ScrollView>

      {/* --- Bottom Navigation --- */}
      <View style={styles.bottomNav}>
        <NavButton IconComponent={Home} label="Home" active={activeTab === 'home'} onPress={() => handleTabChange('home')} />
        <NavButton IconComponent={Recycle} label="Centers" active={activeTab === 'centers'} onPress={() => handleTabChange('centers')} />
        <NavButton IconComponent={Gift} label="Rewards" active={activeTab === 'rewards'} onPress={() => handleTabChange('rewards')} />
        <NavButton IconComponent={User} label="Profile" active={activeTab === 'profile'} onPress={() => handleTabChange('profile')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 100 }, 
  
  // --- Header Styles ---
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30, // Adjust for status bar/notch
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    // Shadow to emphasize the header lift
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Translucent white circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // --- Points Card Styles ---
  pointsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 10,
  },
  pointsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  pointsLabel: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 14,
  },
  pointsValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  pointsValue: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  redeemButton: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  redeemButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },

  // --- Main Content Styles ---
  mainContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  // --- Scan Button Styles ---
  scanButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    height: 60,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  scanButtonIcon: {
    marginRight: 10,
  },
  scanButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // --- Recent Classifications ---
  recentContainer: {
    paddingBottom: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  recentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  recentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  recentIcon: {
    fontSize: 30, // Large emoji icon
    marginRight: 15,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  recentPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 10,
  },
  recentPointsText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },

  // --- Bottom Navigation ---
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.outline,
    paddingBottom: Platform.OS === 'ios' ? 30 : 5, // Adjust for iOS safe area
    height: Platform.OS === 'ios' ? 90 : 65,
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    paddingVertical: 5,
  },
  navButtonLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
});