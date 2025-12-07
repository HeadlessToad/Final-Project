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
import { Camera, Coins, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

// 🔥 NEW IMPORT: Import the reusable Bottom Nav Component
import CustomBottomNavBar from '../components/CustomBottomNavBar';

// --- THEME COLORS (Unchanged) ---
const COLORS = { /* ... */ };

// --- MOCK DATA (Unchanged) ---
const mockRecentClassifications = [
    { id: '1', type: 'Plastic Bottle', points: 15, date: 'Today, 10:30 AM', icon: '🧴' },
    // ...
];


type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

// ❌ DELETE NavButton interface and component (It's now in CustomBottomNavBar)
// ❌ DELETE type ActiveTab and handleTabChange logic

// --- Main Component ---
export default function HomeScreen({ navigation }: HomeScreenProps) {
    const { user, profile } = useAuth();

    // Helper to navigate based on the button/tab pressed
    const handleNavigation = (route: keyof RootStackParamList) => {
        navigation.navigate(route as any);
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
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.headerContainer}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.greeting}>Good Morning 👋</Text>
                            <Text style={styles.userName}>{userName}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleNavigation('Profile')} style={styles.profileButton} activeOpacity={0.7}>
                            <User size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    {/* Points Balance Card */}
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
                            <TouchableOpacity style={styles.redeemButton} onPress={() => handleNavigation('Rewards')} activeOpacity={0.8}>
                                <Text style={styles.redeemButtonText}>Redeem</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>

                {/* --- Main Content (Unchanged) --- */}
                <View style={styles.mainContent}>
                    <TouchableOpacity style={styles.scanButton} onPress={() => handleNavigation('Classify')} activeOpacity={0.8}>
                        <Camera size={24} color={COLORS.white} style={styles.scanButtonIcon} />
                        <Text style={styles.scanButtonText}>Scan Waste</Text>
                    </TouchableOpacity>
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

            {/* 🔥 NEW: Use the reusable component */}
            <CustomBottomNavBar navigation={navigation as any} activeRoute={'Home'} />
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    // ❌ Updated scrollContent padding to account for fixed bottom nav
    scrollContent: { paddingBottom: 60 },

    // --- Header Styles (Unchanged) ---
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 30, // Adjust for status bar/notch
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- Points Card Styles (Unchanged) ---
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

    // --- Main Content Styles (Unchanged) ---
    mainContent: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },

    // --- Scan Button Styles (Unchanged) ---
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

    // --- Recent Classifications (Unchanged) ---
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

    // ❌ DELETE all old bottomNav styles!
});