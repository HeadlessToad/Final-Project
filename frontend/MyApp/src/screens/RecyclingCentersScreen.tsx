// screens/RecyclingCentersScreen.tsx

import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Platform,
    Dimensions,
    FlatList
} from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { MapPin, ChevronRight, Recycle, Home, Gift, User } from 'lucide-react-native'; 
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

const COLORS = {
    primary: '#4CAF50', 
    secondary: '#8BC34A', 
    background: '#F9F9F9',
    white: '#FFFFFF',
    text: '#1B5E20', 
    onSurfaceVariant: '#616161', 
    outline: '#E0E0E0',
    mapBackground: '#C8E6C9', 
    mapPin: '#F44336', 
    lightPinBg: '#E0F2F1', 
    distanceColor: '#00C853',
};

// --- MOCK DATA (from Figma code) ---
interface Center {
    id: number;
    name: string;
    address: string;
    distance: string;
    wasteTypes: string[];
}

const centers: Center[] = [
    { id: 1, name: 'EcoCenter Downtown', address: '123 Green Street', distance: '0.5 km away', wasteTypes: ['Plastic', 'Paper', 'Glass'] },
    { id: 2, name: 'City Recycling Hub', address: '456 Recycle Avenue', distance: '1.2 km away', wasteTypes: ['Electronics', 'Metal', 'Batteries'] },
    { id: 3, name: 'GreenLife Collection Point', address: '789 Eco Boulevard', distance: '2.1 km away', wasteTypes: ['Plastic', 'Aluminum', 'Cardboard'] },
    { id: 4, name: 'Community Recycling Station', address: '321 Earth Lane', distance: '3.5 km away', wasteTypes: ['Organic', 'Compost', 'Garden Waste'] }
];

type RecyclingCentersProps = NativeStackScreenProps<RootStackParamList, "RecyclingCenters">;

// --- NavButton Component (Reused from Home Screen) ---
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

// --- Center List Item Component ---
const CenterListItem: React.FC<{ center: Center, navigation: RecyclingCentersProps['navigation'] }> = ({ center, navigation }) => (
    <TouchableOpacity 
        style={styles.centerRow} 
        activeOpacity={0.7}
        onPress={() => alert(`Navigating to ${center.name}...`)}
    >
        <View style={styles.centerIconCircle}>
            <MapPin size={24} color={COLORS.primary} />
        </View>
        <View style={styles.centerDetails}>
            <Text style={styles.centerName}>{center.name}</Text>
            <Text style={styles.centerAddress}>{center.address}</Text>
            <Text style={styles.centerTypes}>{center.wasteTypes.join(' · ')}</Text>
        </View>
        <View style={styles.centerDistanceContainer}>
            <Text style={styles.centerDistance}>{center.distance}</Text>
            <ChevronRight size={20} color={COLORS.onSurfaceVariant} />
        </View>
    </TouchableOpacity>
);


export default function RecyclingCentersScreen({ navigation }: RecyclingCentersProps) {
    const [activeTab, setActiveTab] = React.useState<'home' | 'centers' | 'rewards' | 'profile'>('centers');

    const handleTabChange = (tabName: 'home' | 'centers' | 'rewards' | 'profile') => {
        setActiveTab(tabName);
        if (tabName !== 'centers') {
            const routeMap = {
                'home': 'Home' as keyof RootStackParamList,
                'centers': 'RecyclingCenters' as keyof RootStackParamList,
                'rewards': 'Rewards' as keyof RootStackParamList,
                'profile': 'Profile' as keyof RootStackParamList,
            };
            navigation.navigate(routeMap[tabName] as any);
        }
    };


    return (
        <View style={styles.fullContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* --- Map Placeholder Section --- */}
                <LinearGradient
                    colors={['#C8E6C9', '#B2EBF2']} // Light green to light blue gradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.mapPlaceholder}
                >
                    <View style={styles.mapOverlay}>
                        <View style={styles.mapIconCircle}>
                            <Recycle size={32} color={COLORS.primary} />
                        </View>
                        <Text style={styles.mapText}>Map View</Text>
                        
                        {/* Mock Map Pins (Static elements) */}
                        <View style={[styles.mockPin, { top: 40, left: 80 }]} />
                        <View style={[styles.mockPin, { top: 60, right: 60 }]} />
                        <View style={[styles.mockPin, { bottom: 30, left: 100 }]} />
                    </View>
                </LinearGradient>

                {/* --- Centers List --- */}
                <View style={styles.listSection}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>Nearby Centers</Text>
                        <Text style={styles.listCount}>{centers.length} found</Text>
                    </View>

                    <FlatList
                        data={centers}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => <CenterListItem center={item} navigation={navigation} />}
                        scrollEnabled={false}
                    />
                </View>
                
            </ScrollView>

            {/* --- Bottom Navigation (Manual implementation) --- */}
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
    
    // --- Map Placeholder Styles ---
    mapPlaceholder: {
        width: '100%',
        height: 180,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    mapOverlay: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    mapIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    mapText: {
        fontSize: 14,
        color: COLORS.onSurfaceVariant,
    },
    mockPin: {
        position: 'absolute',
        width: 10,
        height: 10,
        backgroundColor: COLORS.mapPin,
        borderRadius: 5,
    },

    // --- Centers List Styles ---
    listSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    listCount: {
        fontSize: 14,
        color: COLORS.onSurfaceVariant,
    },

    // --- Center List Item Styles ---
    centerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    centerIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.lightPinBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        flexShrink: 0,
    },
    centerDetails: {
        flex: 1,
        paddingRight: 10,
    },
    centerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    centerAddress: {
        fontSize: 14,
        color: COLORS.onSurfaceVariant,
        marginBottom: 2,
    },
    centerTypes: {
        fontSize: 12,
        color: COLORS.onSurfaceVariant,
    },
    centerDistanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginLeft: 10,
    },
    centerDistance: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.distanceColor,
    },
    
    // --- Manual Bottom Nav Styles (Copied from Home Screen) ---
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