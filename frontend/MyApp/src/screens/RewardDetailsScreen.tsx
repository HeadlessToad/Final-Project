
// // screens/RewardDetailsScreen.tsx

// import React, { useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { RootStackParamList, RewardItem } from "../types";
// import { Coins, CheckCircle } from 'lucide-react-native';
// import { useAuth } from '../context/AuthContext';
// import { redeemRewardTransaction } from '../services/pointsService'; // 🔥 Import the service

// const { height } = Dimensions.get('window');

// const COLORS = {
//     primary: '#4CAF50',
//     primaryLight: '#8BC34A',
//     background: '#F9F9F9',
//     white: '#FFFFFF',
//     text: '#1B5E20',
//     onSurfaceVariant: '#616161',
//     surfaceVariant: '#F0F0F0',
//     error: '#F44335',
//     outline: '#E0E0E0',
//     successBackground: '#E8F5E9',
// };

// type RewardDetailsProps = NativeStackScreenProps<RootStackParamList, "RewardDetails">;

// export default function RewardDetailsScreen({ navigation, route }: RewardDetailsProps) {
//     // 🔥 Get user, profile, and the refresh function from context
//     const { profile, user, refreshProfile } = useAuth();

//     const selectedReward: RewardItem = route.params?.selectedReward;

//     const [redeemed, setRedeemed] = useState(false);
//     const [loading, setLoading] = useState(false);

//     // Use live profile points, fallback to 0 safely
//     const userPoints = profile?.points ?? 0;
//     const canAfford = userPoints >= (selectedReward?.points || 0);

//     // --- Redemption Handler ---
//     const handleRedeem = async () => {
//         if (loading || !canAfford || !user) return;

//         setLoading(true);

//         try {
//             // 1. Call the transaction service
//             const result = await redeemRewardTransaction(
//                 user.uid,
//                 selectedReward.id,
//                 selectedReward.points,
//                 selectedReward.title
//             );

//             if (result.success) {
//                 // 2. If successful, refresh the local context so the UI updates globally
//                 await refreshProfile();
                
//                 // 3. Show success screen
//                 setRedeemed(true);
//             } else {
//                 Alert.alert("Redemption Failed", result.error || "An unknown error occurred.");
//             }
//         } catch (error) {
//             console.error(error);
//             Alert.alert("Error", "Something went wrong. Please check your connection.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Helper for navigation after redemption
//     const navigateAfterRedeem = (screen: keyof RootStackParamList) => {
//         // Reset state so if they come back, it's fresh
//         setRedeemed(false);
//         navigation.navigate(screen as any);
//     };

//     if (!selectedReward) {
//         return <Text style={styles.errorText}>Reward details not found.</Text>;
//     }

//     const remainingPoints = userPoints; // This will be updated automatically via refreshProfile()

//     // --- Success Screen (Redeemed) ---
//     if (redeemed) {
//         return (
//             <View style={styles.successContainer}>
//                 <View style={styles.successContent}>
//                     <View style={styles.successIconCircle}>
//                         <CheckCircle size={60} color={COLORS.primary} />
//                     </View>
//                     <Text style={styles.successTitle}>Reward Redeemed!</Text>
//                     <Text style={styles.successSubtitle}>
//                         You successfully claimed {selectedReward.title}.
//                         Check your email for instructions.
//                     </Text>

//                     <View style={styles.remainingPointsCard}>
//                         <Text style={styles.remainingPointsLabel}>Remaining Points</Text>
//                         <View style={styles.remainingPointsValueContainer}>
//                             <Coins size={24} color={COLORS.primary} />
//                             {/* Points are now updated live from context */}
//                             <Text style={styles.remainingPointsValue}>{profile?.points}</Text>
//                         </View>
//                     </View>

//                     <View style={styles.successButtonContainer}>
//                         <TouchableOpacity
//                             style={[styles.actionButton, styles.primaryButton]}
//                             onPress={() => navigateAfterRedeem('Rewards')}
//                         >
//                             <Text style={styles.primaryButtonText}>Browse More Rewards</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                             style={[styles.actionButton, styles.outlineButton]}
//                             onPress={() => navigateAfterRedeem('Home')}
//                         >
//                             <Text style={styles.outlineButtonText}>Back to Home</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </View>
//         );
//     }

//     // --- Detail Screen (Pre-Redemption) ---
//     return (
//         <ScrollView style={styles.fullContainer} contentContainerStyle={styles.detailContent}>

//             {/* Reward Image */}
//             <Image
//                 source={{ uri: selectedReward.image }}
//                 style={styles.rewardImage}
//                 accessibilityLabel={selectedReward.title}
//             />

//             <View style={styles.detailsSection}>
//                 {/* Title & Points Cost */}
//                 <Text style={styles.detailTitle}>{selectedReward.title}</Text>
//                 <View style={styles.pointsCostContainer}>
//                     <Coins size={24} color={COLORS.primary} />
//                     <Text style={styles.pointsCostText}>{selectedReward.points} Points</Text>
//                 </View>
//                 <Text style={styles.detailDescription}>{selectedReward.description}</Text>

//                 {/* Your Points */}
//                 <View style={styles.yourPointsCard}>
//                     <Text style={styles.yourPointsLabel}>Your Points</Text>
//                     <View style={styles.pointsValueContainer}>
//                         <Coins size={20} color={COLORS.primary} />
//                         <Text style={styles.yourPointsValue}>{userPoints}</Text>
//                     </View>
//                 </View>

//                 {/* Terms & Conditions */}
//                 <View style={styles.termsCard}>
//                     <Text style={styles.termsTitle}>Terms & Conditions</Text>
//                     <Text style={styles.termsListItem}>• Reward is non-transferable</Text>
//                     <Text style={styles.termsListItem}>• Valid for 30 days from redemption</Text>
//                     <Text style={styles.termsListItem}>• Cannot be exchanged for cash</Text>
//                     <Text style={styles.termsListItem}>• Subject to availability</Text>
//                 </View>

//                 {/* Redeem Button */}
//                 <TouchableOpacity
//                     style={[styles.actionButton, styles.primaryButton, (!canAfford || loading) && styles.disabledButton]}
//                     onPress={handleRedeem}
//                     disabled={!canAfford || loading}
//                     activeOpacity={0.8}
//                 >
//                     {loading ? (
//                         <ActivityIndicator color={COLORS.white} />
//                     ) : (
//                         <Text style={styles.primaryButtonText}>
//                             {canAfford ? 'Redeem Now' : `Need ${selectedReward.points - userPoints} More Points`}
//                         </Text>
//                     )}
//                 </TouchableOpacity>
//             </View>
//         </ScrollView>
//     );
// }

// const styles = StyleSheet.create({
//     fullContainer: { flex: 1, backgroundColor: COLORS.background },
//     detailContent: { paddingBottom: 50 },

//     // --- Image Section ---
//     rewardImage: {
//         width: '100%',
//         height: 300,
//         backgroundColor: COLORS.surfaceVariant,
//     },

//     // --- Details Section ---
//     detailsSection: {
//         paddingHorizontal: 20,
//         paddingTop: 20,
//         gap: 15,
//     },
//     detailTitle: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: COLORS.text,
//         marginBottom: 5,
//     },
//     pointsCostContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//         marginBottom: 10,
//     },
//     pointsCostText: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: COLORS.primary,
//     },
//     detailDescription: {
//         fontSize: 16,
//         color: COLORS.onSurfaceVariant,
//         marginBottom: 10,
//     },

//     // --- Your Points Card ---
//     yourPointsCard: {
//         backgroundColor: COLORS.surfaceVariant,
//         borderRadius: 10,
//         padding: 15,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     yourPointsLabel: {
//         color: COLORS.onSurfaceVariant,
//         fontSize: 16,
//     },
//     yourPointsValue: {
//         fontWeight: 'bold',
//         color: COLORS.primary,
//         fontSize: 18,
//     },

//     // --- Terms Card ---
//     termsCard: {
//         backgroundColor: COLORS.white,
//         borderRadius: 10,
//         padding: 15,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 3,
//         elevation: 2,
//         gap: 5,
//     },
//     termsTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: COLORS.text,
//         marginBottom: 8,
//     },
//     termsListItem: {
//         fontSize: 14,
//         color: COLORS.onSurfaceVariant,
//         marginLeft: 10,
//     },

//     // --- Buttons ---
//     actionButton: {
//         padding: 16,
//         borderRadius: 30,
//         alignItems: 'center',
//     },
//     primaryButton: {
//         backgroundColor: COLORS.primary,
//         marginBottom: 10,
//     },
//     primaryButtonText: {
//         color: COLORS.white,
//         fontWeight: 'bold',
//         fontSize: 18,
//     },
//     disabledButton: {
//         backgroundColor: COLORS.outline,
//     },
//     canAffordText: {
//         textAlign: 'center',
//         fontSize: 14,
//         color: COLORS.error,
//         marginBottom: 20,
//     },

//     // --- Success Screen Styles ---
//     successContainer: {
//         flex: 1,
//         backgroundColor: COLORS.background,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 40,
//         minHeight: height,
//     },
//     successContent: {
//         alignItems: 'center',
//         width: '100%',
//     },
//     successIconCircle: {
//         width: 96,
//         height: 96,
//         borderRadius: 48,
//         backgroundColor: COLORS.successBackground,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     successTitle: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: COLORS.text,
//         marginBottom: 10,
//     },
//     successSubtitle: {
//         textAlign: 'center',
//         color: COLORS.onSurfaceVariant,
//         marginBottom: 30,
//         fontSize: 16,
//     },
//     remainingPointsCard: {
//         backgroundColor: COLORS.surfaceVariant,
//         borderRadius: 10,
//         padding: 15,
//         width: '100%',
//         alignItems: 'center',
//         marginBottom: 25,
//     },
//     remainingPointsLabel: {
//         fontSize: 14,
//         color: COLORS.onSurfaceVariant,
//         marginBottom: 5,
//     },
//     remainingPointsValueContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     remainingPointsValue: {
//         fontSize: 28,
//         fontWeight: 'bold',
//         color: COLORS.primary,
//     },
//     successButtonContainer: {
//         width: '100%',
//         gap: 15,
//     },
//     outlineButton: {
//         backgroundColor: COLORS.white,
//         borderWidth: 2,
//         borderColor: COLORS.outline,
//     },
//     outlineButtonText: {
//         color: COLORS.text,
//         fontWeight: 'bold',
//         fontSize: 18,
//     },
//     // Shared containers/values
//     pointsValueContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     errorText: {
//         color: COLORS.error,
//         textAlign: 'center',
//         padding: 20,
//     }
// });

// screens/RewardDetailsScreen.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  Dimensions 
} from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Coins, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Internal Imports
import { RootStackParamList, RewardItem } from "../types";
import { useAuth } from '../context/AuthContext';
import { redeemRewardTransaction } from '../services/pointsService';

// Dimensions & Constants
const { height } = Dimensions.get('window');

const COLORS = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  background: '#F9F9F9',
  white: '#FFFFFF',
  text: '#1B5E20',
  textSecondary: '#616161',
  surfaceVariant: '#F0F0F0',
  error: '#F44335',
  outline: '#E0E0E0',
  successBackground: '#E8F5E9',
};

type Props = NativeStackScreenProps<RootStackParamList, "RewardDetails">;

export default function RewardDetailsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  
  // Context Data
  const { profile, user, refreshProfile } = useAuth();
  
  // Route Params
  const selectedReward: RewardItem | undefined = route.params?.selectedReward;

  // Local State
  const [redeemed, setRedeemed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Derived State
  const userPoints = profile?.points ?? 0;
  const rewardCost = selectedReward?.points ?? 0;
  const canAfford = userPoints >= rewardCost;

  /**
   * Handle the redemption logic via Firebase Transaction
   */
  const handleRedeem = async () => {
    if (loading || !canAfford || !user || !selectedReward) return;

    setLoading(true);

    try {
      const result = await redeemRewardTransaction(
        user.uid,
        profile?.fullName || "Anonymous",
        selectedReward.points,
        selectedReward.title
      );

      if (result.success) {
        // Refresh global context to update UI points instantly
        await refreshProfile();
        setRedeemed(true);
      } else {
        Alert.alert("Redemption Failed", result.error || "Please try again later.");
      }
    } catch (error) {
      console.error("Redemption Error:", error);
      Alert.alert("Connection Error", "Could not complete transaction. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationAfterRedeem = (target: 'Rewards' | 'Home') => {
    setRedeemed(false);
    // @ts-ignore - Simple navigation reset for demo purposes
    navigation.navigate(target);
  };

  // Guard Clause: If no reward data passed
  if (!selectedReward) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Reward details unavailable.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonSimple}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------
  // RENDER: SUCCESS STATE
  // -------------------------
  if (redeemed) {
    return (
      <View style={[styles.successContainer, { paddingTop: insets.top }]}>
        <View style={styles.successContent}>
          <View style={styles.successIconCircle}>
            <CheckCircle size={60} color={COLORS.primary} />
          </View>
          
          <Text style={styles.successTitle}>Reward Redeemed!</Text>
          <Text style={styles.successSubtitle}>
            You successfully claimed {selectedReward.title}.
            {"\n"}Check your email for instructions.
          </Text>

          <View style={styles.remainingPointsCard}>
            <Text style={styles.remainingPointsLabel}>Remaining Points</Text>
            <View style={styles.row}>
              <Coins size={24} color={COLORS.primary} />
              <Text style={styles.remainingPointsValue}>
                {profile?.points /* Updates live via context */}
              </Text>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => handleNavigationAfterRedeem('Rewards')}
            >
              <Text style={styles.primaryButtonText}>Browse More Rewards</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.outlineButton]}
              onPress={() => handleNavigationAfterRedeem('Home')}
            >
              <Text style={styles.outlineButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // -------------------------
  // RENDER: DETAILS STATE
  // -------------------------
  return (
    <View style={styles.container}>
      {/* Floating Back Button */}
      <TouchableOpacity 
        style={[styles.floatingBackButton, { top: insets.top + 10 }]} 
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Image */}
        <Image
          source={{ uri: selectedReward.image }}
          style={styles.rewardImage}
          resizeMode="cover"
        />

        <View style={styles.detailsBody}>
          {/* Title & Cost */}
          <Text style={styles.detailTitle}>{selectedReward.title}</Text>
          
          <View style={styles.costBadge}>
            <Coins size={20} color={COLORS.primary} />
            <Text style={styles.costText}>{selectedReward.points} Points</Text>
          </View>

          <Text style={styles.detailDescription}>
            {selectedReward.description}
          </Text>

          {/* User Status Card */}
          <View style={styles.userPointsCard}>
            <Text style={styles.userPointsLabel}>Your Balance</Text>
            <View style={styles.row}>
              <Coins size={20} color={COLORS.primary} />
              <Text style={styles.userPointsValue}>{userPoints}</Text>
            </View>
          </View>

          {/* Terms Section */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsHeader}>Terms & Conditions</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.termText}>Reward is non-transferable.</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.termText}>Valid for 30 days from redemption.</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.termText}>Subject to availability.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Action Button (Sticky) */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.primaryButton, 
            (!canAfford || loading) && styles.disabledButton
          ]}
          onPress={handleRedeem}
          disabled={!canAfford || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {canAfford 
                ? 'Redeem Now' 
                : `Need ${rewardCost - userPoints} More Points`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100, // Space for sticky footer
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // --- Header ---
  rewardImage: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.surfaceVariant,
  },
  floatingBackButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },

  // --- Body ---
  detailsBody: {
    padding: 24,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20, // Overlap effect
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  costText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },

  // --- User Status ---
  userPointsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outline,
    marginBottom: 24,
  },
  userPointsLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userPointsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // --- Terms ---
  termsContainer: {
    backgroundColor: COLORS.surfaceVariant,
    padding: 16,
    borderRadius: 12,
  },
  termsHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  termText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.outline,
  },
  
  // --- Buttons ---
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.outline,
  },
  outlineButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: COLORS.outline,
    shadowOpacity: 0,
    elevation: 0,
  },
  backButtonSimple: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // --- Success View ---
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  successContent: {
    width: '100%',
    alignItems: 'center',
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.successBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  remainingPointsCard: {
    backgroundColor: COLORS.surfaceVariant,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  remainingPointsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  remainingPointsValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
});