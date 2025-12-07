// // screens/ProfileScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { 
    User, Coins, ChevronRight, History, TrendingUp, Settings, MessageSquare, 
    Recycle, LogOut 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';


const COLORS = {
    primary: '#4CAF50', // Green
    primaryLight: '#8BC34A', // Lighter Green
    secondary: '#00B8D4', // Blue/Teal for profile circle
    background: '#F9F9F9',
    white: '#FFFFFF',
    text: '#1B5E20', // Dark Green Text
    onSurfaceVariant: '#616161', // Gray text
    outline: '#E0E0E0',
    surfaceVariant: '#F0F0F0', // Card surface
    error: '#F44336',
};

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

// --- Menu Item Interface ---
interface MenuItem {
    icon: React.ReactNode;
    label: string;
    screen: keyof RootStackParamList;
}

// --- Menu Item Row Component (for the list below the stats) ---
const MenuItemRow: React.FC<{ item: MenuItem, navigation: ProfileScreenProps['navigation'] }> = ({ item, navigation }) => (
    <TouchableOpacity
        onPress={() => navigation.navigate(item.screen as any)}
        style={styles.menuItemRow}
        activeOpacity={0.6}
    >
        <View style={styles.menuItemIconContainer}>
            {item.icon}
        </View>
        <Text style={styles.menuItemLabel}>{item.label}</Text>
        <ChevronRight size={20} color={COLORS.onSurfaceVariant} />
    </TouchableOpacity>
);


export default function ProfileScreen({ navigation }: ProfileScreenProps) {
    const { user, profile } = useAuth();

    // Placeholder or actual data access
    const userName = profile?.displayName || user?.email?.split('@')[0] || 'Eco Warrior';
    const userEmail = user?.email || 'N/A';
    const userPoints = profile?.points ?? 0;
    
    // --- Data for Menu Items (Fixed syntax error and routes) ---
    const menuItems: MenuItem[] = [
        { 
            icon: <User size={20} color={COLORS.onSurfaceVariant} />, 
            label: 'Edit Profile', 
            screen: 'PersonalDetails' as keyof RootStackParamList
        }, // <-- FIX: COMMA IS HERE
        { 
            icon: <History size={20} color={COLORS.onSurfaceVariant} />, 
            label: 'Classification History', 
            screen: 'ClassificationHistory' 
        },
        { icon: <TrendingUp size={20} color={COLORS.onSurfaceVariant} />, label: 'Points History', screen: 'PointsHistory' as keyof RootStackParamList }, 
        { icon: <MessageSquare size={20} color={COLORS.onSurfaceVariant} />, label: 'Feedback', screen: 'Profile' as keyof RootStackParamList },
        { icon: <Settings size={20} color={COLORS.onSurfaceVariant} />, label: 'Settings', screen: 'Profile' as keyof RootStackParamList }
    ];

    const handleLogout = () => {
        signOut(auth); 
    };

    return (
        <View style={styles.fullContainer}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* --- 1. Header and Logout --- */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.7}>
                        <LogOut size={24} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
                
                {/* --- 2. Profile Card --- */}
                <View style={styles.card}>
                    {/* User Info Section */}
                    <View style={styles.userInfoSection}>
                        <LinearGradient
                            colors={['#00B8D4', COLORS.primary]} // Secondary blue/teal to primary green
                            style={styles.profilePhotoPlaceholder}
                        >
                            <User size={40} color={COLORS.white} />
                        </LinearGradient>
                        <View style={styles.userInfoText}>
                            <Text style={styles.userName}>{userName}</Text>
                            <Text style={styles.userEmail}>{userEmail}</Text>
                        </View>
                    </View>

{/* Points Display Section */}
                    <View style={styles.pointsDisplayBox}>
                        <View style={styles.pointsContent}>
                            
                            {/* BLOCK 1: Points History Touch Area (Correctly links to PointsHistory) */}
                            <TouchableOpacity 
                                onPress={() => navigation.navigate('PointsHistory')}
                                activeOpacity={0.7}
                                // We apply flex: 1 style here, as intended, to make it the main touch area
                                style={styles.pointsHistoryTouchArea} 
                            >
                                <Text style={styles.pointsLabel}>Total Points</Text>
                                <View style={styles.pointsValueContainer}>
                                    <Coins size={24} color={COLORS.primary} />
                                    <Text style={styles.pointsValue}>{userPoints}</Text>
                                </View>
                            </TouchableOpacity>
                            
                            BLOCK 2: Redeem Button (Correctly links to Rewards)
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Rewards')}
                                style={styles.redeemButton}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.redeemButtonText}>Redeem</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>

                {/* --- 3. Stats Cards --- */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsIcon}>♻️</Text>
                        <Text style={styles.statsNumber}>47</Text>
                        <Text style={styles.statsLabel}>Items Scanned</Text>
                    </View>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsIcon}>🌱</Text>
                        <Text style={styles.statsNumber}>12.5 kg</Text>
                        <Text style={styles.statsLabel}>CO₂ Saved</Text>
                    </View>
                </View>

                {/* --- 4. Menu Items --- */}
                <View style={[styles.card, styles.menuCard]}>
                    {menuItems.map((item, index) => (
                        <MenuItemRow 
                            key={index} 
                            item={item} 
                            navigation={navigation} 
                        />
                    ))}
                </View>
                
            </ScrollView>

            {/* --- Bottom Navigation (Required for persistent tabs) --- */}
            <View style={styles.bottomNav}>
                {/* Note: This is usually rendered by a Tab Navigator, but included here for full design reference */}
                <Text style={styles.navText}>Bottom Navigation (Home, Centers, Rewards, Profile) goes here.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20, paddingBottom: 150 }, 

    // --- Header & Logout ---
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: Platform.OS === 'ios' ? 0 : 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    logoutButton: {
        padding: 5,
    },

    // --- 2. Profile Card ---
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    userInfoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 20,
    },
    profilePhotoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfoText: {
        flex: 1,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.onSurfaceVariant,
    },

    // Points Display
    pointsDisplayBox: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)', // primary-light opacity 20%
        borderRadius: 10,
        padding: 15,
    },
    pointsContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointsHistoryTouchArea: {
        flex: 1, 
        flexDirection: 'column',
        justifyContent: 'center',
    },
    pointsLabel: {
        fontSize: 14,
        color: COLORS.onSurfaceVariant,
        marginBottom: 5,
    },
    pointsValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pointsValue: {
        fontSize: 30,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    redeemButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    redeemButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },

    // --- 3. Stats Cards ---
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
        marginBottom: 20,
    },
    statsCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    statsIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    statsNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    statsLabel: {
        fontSize: 12,
        color: COLORS.onSurfaceVariant,
        textAlign: 'center',
    },

    // --- 4. Menu Items ---
    menuCard: {
        padding: 0,
        overflow: 'hidden', // Ensures border radius is applied to contents
    },
    menuItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        gap: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.outline,
        backgroundColor: COLORS.white,
    },
    menuItemLabel: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    menuItemIconContainer: {
        width: 24, // Ensures alignment
        alignItems: 'center',
    },
    
    // --- Bottom Navigation Placeholder ---
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: COLORS.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.outline,
    },
    navText: {
        fontSize: 12,
        color: COLORS.onSurfaceVariant,
    }
});