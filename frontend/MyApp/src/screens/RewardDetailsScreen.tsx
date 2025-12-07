// screens/RewardDetailsScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RewardItem } from "../types";
import { Coins, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
// import { logPointTransaction } from '../services/firestoreService'; // Service for logging points

const { height } = Dimensions.get('window');

const COLORS = {
    primary: '#4CAF50', 
    primaryLight: '#8BC34A',
    background: '#F9F9F9',
    white: '#FFFFFF',
    text: '#1B5E20', 
    onSurfaceVariant: '#616161', 
    surfaceVariant: '#F0F0F0',
    error: '#F44335',
    outline: '#E0E0E0',
    successBackground: '#E8F5E9',
};

type RewardDetailsProps = NativeStackScreenProps<RootStackParamList, "RewardDetails">;

export default function RewardDetailsScreen({ navigation, route }: RewardDetailsProps) {
    const { profile, user } = useAuth();
    
    // Safety check for route parameters
    const selectedReward: RewardItem = route.params?.selectedReward;

    

    // Local state for redemption success screen
    const [redeemed, setRedeemed] = useState(false);
    const [loading, setLoading] = useState(false);

    // Get user points (mocked or from context)
    // NOTE: In a real app, this should be the final, live value from Firestore/Context
    const userPoints = profile?.points ?? 750; 
    const canAfford = userPoints >= selectedReward.points;

    // --- Redemption Handler (Placeholder Logic) ---
    const handleRedeem = async () => {
        if (loading || !canAfford) return;

        setLoading(true);
        
        // 🔥 ACTUAL FIRESTORE/STATE UPDATE LOGIC GOES HERE (Atomic Transaction)
        
        setTimeout(() => {
            // Simulate successful transaction:
            setRedeemed(true); 
            setLoading(false);
            // In a real app, the AuthContext would detect the points change.
        }, 1500); 
    };

    // Helper for navigation after redemption
    const navigateAfterRedeem = (screen: keyof RootStackParamList) => {
        navigation.navigate(screen as any);
    };

    const remainingPoints = userPoints - selectedReward.points;


    if (!selectedReward) {
        return <Text style={styles.errorText}>Reward details not found.</Text>;
    }

    // --- Success Screen (Redeemed) ---
    if (redeemed) {
        return (
            <View style={styles.successContainer}>
                <View style={styles.successContent}>
                    <View style={styles.successIconCircle}>
                        <CheckCircle size={60} color={COLORS.primary} />
                    </View>
                    <Text style={styles.successTitle}>Reward Redeemed!</Text>
                    <Text style={styles.successSubtitle}>
                        Check your email for instructions on how to claim your reward.
                    </Text>
                    
                    <View style={styles.remainingPointsCard}>
                        <Text style={styles.remainingPointsLabel}>Remaining Points</Text>
                        <View style={styles.remainingPointsValueContainer}>
                            <Coins size={24} color={COLORS.primary} />
                            <Text style={styles.remainingPointsValue}>{remainingPoints}</Text> 
                        </View>
                    </View>
                    
                    <View style={styles.successButtonContainer}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.primaryButton]} 
                            onPress={() => navigateAfterRedeem('Rewards')}
                        >
                            <Text style={styles.primaryButtonText}>Browse More Rewards</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.outlineButton]} 
                            onPress={() => navigateAfterRedeem('Home')}
                        >
                            <Text style={styles.outlineButtonText}>Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
    
    // --- Detail Screen (Pre-Redemption) ---
    return (
        <ScrollView style={styles.fullContainer} contentContainerStyle={styles.detailContent}>
            
            {/* Reward Image */}
            <Image 
                source={{ uri: selectedReward.image }} 
                style={styles.rewardImage} 
                accessibilityLabel={selectedReward.title}
            />

            <View style={styles.detailsSection}>
                {/* Title & Points Cost */}
                <Text style={styles.detailTitle}>{selectedReward.title}</Text>
                <View style={styles.pointsCostContainer}>
                    <Coins size={24} color={COLORS.primary} />
                    <Text style={styles.pointsCostText}>{selectedReward.points} Points</Text>
                </View>
                <Text style={styles.detailDescription}>{selectedReward.description}</Text>

                {/* Your Points */}
                <View style={styles.yourPointsCard}>
                    <Text style={styles.yourPointsLabel}>Your Points</Text>
                    <View style={styles.pointsValueContainer}>
                        <Coins size={20} color={COLORS.primary} />
                        <Text style={styles.yourPointsValue}>{userPoints}</Text>
                    </View>
                </View>

                {/* Terms & Conditions */}
                <View style={styles.termsCard}>
                    <Text style={styles.termsTitle}>Terms & Conditions</Text>
                    <Text style={styles.termsListItem}>• Reward is non-transferable</Text>
                    <Text style={styles.termsListItem}>• Valid for 30 days from redemption</Text>
                    <Text style={styles.termsListItem}>• Cannot be exchanged for cash</Text>
                    <Text style={styles.termsListItem}>• Subject to availability</Text>
                </View>

                {/* Redeem Button */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton, !canAfford && styles.disabledButton]}
                    onPress={handleRedeem}
                    disabled={!canAfford || loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.primaryButtonText}>
                            {canAfford ? 'Redeem Now' : `Not Enough Points`}
                        </Text>
                    )}
                </TouchableOpacity>

                {!canAfford && (
                    <Text style={styles.canAffordText}>
                        You need {selectedReward.points - userPoints} more points
                    </Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    detailContent: { paddingBottom: 50 },
    
    // --- Image Section ---
    rewardImage: {
        width: '100%',
        height: 300, 
        backgroundColor: COLORS.surfaceVariant,
    },
    
    // --- Details Section ---
    detailsSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 15,
    },
    detailTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    pointsCostContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    pointsCostText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    detailDescription: {
        fontSize: 16,
        color: COLORS.onSurfaceVariant,
        marginBottom: 10,
    },
    
    // --- Your Points Card ---
    yourPointsCard: {
        backgroundColor: COLORS.surfaceVariant,
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    yourPointsLabel: {
        color: COLORS.onSurfaceVariant,
        fontSize: 16,
    },
    yourPointsValue: {
        fontWeight: 'bold',
        color: COLORS.primary,
        fontSize: 18,
    },
    
    // --- Terms Card ---
    termsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        gap: 5,
    },
    termsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    termsListItem: {
        fontSize: 14,
        color: COLORS.onSurfaceVariant,
        marginLeft: 10,
    },

    // --- Buttons ---
    actionButton: {
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        marginBottom: 10,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    disabledButton: {
        backgroundColor: COLORS.outline,
    },
    canAffordText: {
        textAlign: 'center',
        fontSize: 14,
        color: COLORS.error,
        marginBottom: 20,
    },
    
    // --- Success Screen Styles ---
    successContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        minHeight: height, // Ensures success screen fills full height
    },
    successContent: {
        alignItems: 'center',
        width: '100%',
    },
    successIconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: COLORS.successBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    successSubtitle: {
        textAlign: 'center',
        color: COLORS.onSurfaceVariant,
        marginBottom: 30,
        fontSize: 16,
    },
    remainingPointsCard: {
        backgroundColor: COLORS.surfaceVariant,
        borderRadius: 10,
        padding: 15,
        width: '100%',
        alignItems: 'center',
        marginBottom: 25,
    },
    remainingPointsLabel: {
        fontSize: 14,
        color: COLORS.onSurfaceVariant,
        marginBottom: 5,
    },
    remainingPointsValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    remainingPointsValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    successButtonContainer: {
        width: '100%',
        gap: 15,
    },
    outlineButton: {
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.outline,
    },
    outlineButtonText: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontSize: 18,
    },
    // Shared containers/values
    pointsValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    errorText: {
        color: COLORS.error,
        textAlign: 'center',
        padding: 20,
    }
});