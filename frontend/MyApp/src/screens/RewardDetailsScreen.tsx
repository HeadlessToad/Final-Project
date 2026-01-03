// import React, { useState, useMemo } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ScrollView, 
//   TouchableOpacity, 
//   Image, 
//   ActivityIndicator, 
//   Alert, 
//   Dimensions 
// } from 'react-native';
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { Coins, CheckCircle, ArrowLeft } from 'lucide-react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// // Internal Imports
// import { RootStackParamList, RewardItem } from "../types";
// import { useAuth } from '../context/AuthContext';
// import { redeemRewardTransaction } from '../services/pointsService';
// import { REWARDS_DATA } from '../data/rewardsData';

// const COLORS = {
//   primary: '#4CAF50',
//   primaryDark: '#388E3C',
//   background: '#F9F9F9',
//   white: '#FFFFFF',
//   text: '#1B5E20',
//   textSecondary: '#616161',
//   surfaceVariant: '#F0F0F0',
//   error: '#F44335',
//   outline: '#E0E0E0',
//   successBackground: '#E8F5E9',
// };

// type Props = NativeStackScreenProps<RootStackParamList, "RewardDetails">;

// export default function RewardDetailsScreen({ navigation, route }: Props) {
//   const insets = useSafeAreaInsets();
//   const { profile, user, refreshProfile } = useAuth();
  
//   const selectedReward: RewardItem | undefined = route.params?.selectedReward;

//   const [redeemed, setRedeemed] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const userPoints = profile?.points ?? 0;
//   const rewardCost = selectedReward?.points ?? 0;
//   const canAfford = userPoints >= rewardCost;

//   // --- RELATED PRODUCTS LOGIC (WITH SHUFFLE) ---
//   const relatedRewards = useMemo(() => {
//     if (!selectedReward) return [];
    
//     // 1. Get all items in the same category, excluding the current one
//     const sameCategory = REWARDS_DATA.filter(
//       item => item.category === selectedReward.category && item.id !== selectedReward.id
//     );

//     // 2. Shuffle the array randomly
//     const shuffled = sameCategory.sort(() => 0.5 - Math.random());

//     // 3. Take the first 10 items from the shuffled list
//     return shuffled.slice(0, 10);
//   }, [selectedReward]);

//   const handleRedeem = async () => {
//     if (loading || !canAfford || !user || !selectedReward) return;
//     setLoading(true);
//     try {
//       const result = await redeemRewardTransaction(
//         user.uid,
//         profile?.fullName || "Anonymous",
//         selectedReward
//       );
//       if (result.success) {
//         await refreshProfile();
//         setRedeemed(true);
//       } else {
//         Alert.alert("Redemption Failed", result.error || "Please try again later.");
//       }
//     } catch (error) {
//       console.error("Redemption Error:", error);
//       Alert.alert("Connection Error", "Could not complete transaction. Please check your internet.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleNavigationAfterRedeem = (target: 'Rewards' | 'Home') => {
//     setRedeemed(false);
//     // @ts-ignore 
//     navigation.navigate(target);
//   };

//   if (!selectedReward) {
//     return (
//       <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
//         <Text style={styles.errorText}>Reward details unavailable.</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonSimple}>
//           <Text style={styles.backButtonText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // --- SUCCESS VIEW ---
//   if (redeemed) {
//     return (
//       <View style={[styles.successContainer, { paddingTop: insets.top }]}>
//         <View style={styles.successContent}>
//           <View style={styles.successIconCircle}>
//             <CheckCircle size={60} color={COLORS.primary} />
//           </View>
//           <Text style={styles.successTitle}>Reward Redeemed!</Text>
//           <Text style={styles.successSubtitle}>
//             You successfully claimed {selectedReward.title}.
//             {"\n"}Check your email for instructions.
//           </Text>
//           <View style={styles.remainingPointsCard}>
//             <Text style={styles.remainingPointsLabel}>Remaining Points</Text>
//             <View style={styles.row}>
//               <Coins size={24} color={COLORS.primary} />
//               <Text style={styles.remainingPointsValue}>{profile?.points}</Text>
//             </View>
//           </View>
//           <View style={styles.buttonGroup}>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.primaryButton]}
//               onPress={() => handleNavigationAfterRedeem('Rewards')}
//             >
//               <Text style={styles.primaryButtonText}>Browse More Rewards</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.outlineButton]}
//               onPress={() => handleNavigationAfterRedeem('Home')}
//             >
//               <Text style={styles.outlineButtonText}>Back to Home</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     );
//   }

//   // --- MAIN VIEW ---
//   return (
//     <View style={styles.container}>
//       <TouchableOpacity 
//         style={[styles.floatingBackButton, { top: insets.top + 10 }]} 
//         onPress={() => navigation.goBack()}
//       >
//         <ArrowLeft size={24} color="#FFF" />
//       </TouchableOpacity>

//       <ScrollView 
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         bounces={false}
//       >
//         <Image
//           source={{ uri: selectedReward.image }}
//           style={styles.rewardImage}
//           resizeMode="cover"
//         />

//         <View style={styles.detailsBody}>
//           <Text style={styles.detailTitle}>{selectedReward.title}</Text>
          
//           <View style={styles.costBadge}>
//             <Coins size={20} color={COLORS.primary} />
//             <Text style={styles.costText}>{selectedReward.points} Points</Text>
//           </View>

//           <Text style={styles.detailDescription}>
//             {selectedReward.description}
//           </Text>

//           <View style={styles.userPointsCard}>
//             <Text style={styles.userPointsLabel}>Your Balance</Text>
//             <View style={styles.row}>
//               <Coins size={20} color={COLORS.primary} />
//               <Text style={styles.userPointsValue}>{userPoints}</Text>
//             </View>
//           </View>

//           <View style={styles.termsContainer}>
//             <Text style={styles.termsHeader}>Terms & Conditions</Text>
//             <View style={styles.bulletPoint}>
//               <Text style={styles.bullet}>•</Text>
//               <Text style={styles.termText}>Reward is non-transferable.</Text>
//             </View>
//             <View style={styles.bulletPoint}>
//               <Text style={styles.bullet}>•</Text>
//               <Text style={styles.termText}>Valid for 30 days from redemption.</Text>
//             </View>
//           </View>

//           {/* --- VERTICAL LIST RELATED PRODUCTS (SHUFFLED) --- */}
//           {relatedRewards.length > 0 && (
//             <View style={styles.relatedSection}>
//               <Text style={styles.relatedTitle}>More in {selectedReward.category}</Text>
              
//               <View style={styles.verticalListContainer}>
//                 {relatedRewards.map((item) => (
//                   <TouchableOpacity 
//                     key={item.id} 
//                     style={styles.verticalCard}
//                     // Using push to stack screens so "Back" works correctly
//                     onPress={() => navigation.push("RewardDetails", { selectedReward: item })}
//                   >
//                     {/* Image on Left */}
//                     <Image source={{ uri: item.image }} style={styles.verticalCardImage} />
                    
//                     {/* Text on Right */}
//                     <View style={styles.verticalCardContent}>
//                       <Text style={styles.verticalCardTitle} numberOfLines={2}>{item.title}</Text>
//                       <View style={styles.relatedPointsRow}>
//                         <Coins size={14} color={COLORS.primary} />
//                         <Text style={styles.relatedCardPoints}>{item.points}</Text>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           )}

//         </View>
//       </ScrollView>

//       <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
//         <TouchableOpacity
//           style={[
//             styles.actionButton, 
//             styles.primaryButton, 
//             (!canAfford || loading) && styles.disabledButton
//           ]}
//           onPress={handleRedeem}
//           disabled={!canAfford || loading}
//           activeOpacity={0.8}
//         >
//           {loading ? (
//             <ActivityIndicator color={COLORS.white} />
//           ) : (
//             <Text style={styles.primaryButtonText}>
//               {canAfford 
//                 ? 'Redeem Now' 
//                 : `Need ${rewardCost - userPoints} More Points`}
//             </Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.background },
//   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   scrollContent: { paddingBottom: 100 }, // Space for sticky footer
//   row: { flexDirection: 'row', alignItems: 'center', gap: 6 },

//   // Header & Body
//   rewardImage: { width: '100%', height: 300, backgroundColor: COLORS.surfaceVariant },
//   floatingBackButton: { position: 'absolute', left: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
//   detailsBody: { padding: 24, backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20 },
//   detailTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
//   costBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceVariant, alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, gap: 6, marginBottom: 16 },
//   costText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
//   detailDescription: { fontSize: 16, lineHeight: 24, color: COLORS.textSecondary, marginBottom: 24 },

//   // User Status
//   userPointsCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.outline, marginBottom: 24 },
//   userPointsLabel: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
//   userPointsValue: { fontSize: 18, fontWeight: '700', color: COLORS.primary },

//   // Terms
//   termsContainer: { backgroundColor: COLORS.surfaceVariant, padding: 16, borderRadius: 12, marginBottom: 24 },
//   termsHeader: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
//   bulletPoint: { flexDirection: 'row', marginBottom: 6 },
//   bullet: { fontSize: 14, color: COLORS.textSecondary, marginRight: 8 },
//   termText: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },

//   // --- NEW: VERTICAL LIST STYLES ---
//   relatedSection: { marginBottom: 20 },
//   relatedTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
//   verticalListContainer: { gap: 12 },
//   verticalCard: {
//     flexDirection: 'row', // Side by side
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: COLORS.outline,
//     height: 90, // Fixed height for consistency
//     alignItems: 'center',
//   },
//   verticalCardImage: {
//     width: 90,
//     height: '100%',
//     backgroundColor: COLORS.surfaceVariant,
//   },
//   verticalCardContent: {
//     flex: 1,
//     paddingHorizontal: 12,
//     justifyContent: 'center',
//   },
//   verticalCardTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginBottom: 6,
//   },
//   relatedPointsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   relatedCardPoints: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },

//   // Footer & Buttons
//   footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.outline },
//   actionButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', width: '100%' },
//   primaryButton: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
//   primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
//   outlineButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.outline },
//   outlineButtonText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '700' },
//   disabledButton: { backgroundColor: COLORS.outline, shadowOpacity: 0, elevation: 0 },
//   backButtonSimple: { marginTop: 20, padding: 10 },
//   backButtonText: { color: COLORS.primary, fontWeight: '600' },
//   errorText: { fontSize: 16, color: COLORS.textSecondary },

//   // Success
//   successContainer: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
//   successContent: { width: '100%', alignItems: 'center' },
//   successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.successBackground, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
//   successTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
//   successSubtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
//   remainingPointsCard: { backgroundColor: COLORS.surfaceVariant, paddingVertical: 20, paddingHorizontal: 40, borderRadius: 16, alignItems: 'center', marginBottom: 40, width: '100%' },
//   remainingPointsLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
//   remainingPointsValue: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
//   buttonGroup: { width: '100%', gap: 12 },
// });


// screens/RewardDetailsScreen.tsx

import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Dimensions 
} from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Coins, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Internal Imports
import { RootStackParamList, RewardItem } from "../types";
import { useAuth } from '../context/AuthContext';
import { redeemRewardTransaction } from '../services/pointsService';
import { REWARDS_DATA } from '../data/rewardsData';
import Toast from 'react-native-toast-message'; // 🔥 IMPORT TOAST

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
  const { profile, user, refreshProfile } = useAuth();
  
  const selectedReward: RewardItem | undefined = route.params?.selectedReward;

  const [redeemed, setRedeemed] = useState(false);
  const [loading, setLoading] = useState(false);

  const userPoints = profile?.points ?? 0;
  const rewardCost = selectedReward?.points ?? 0;
  const canAfford = userPoints >= rewardCost;

  // --- RELATED PRODUCTS LOGIC ---
  // Explanation: This shows other rewards from the same category to keep the user engaged.
  const relatedRewards = useMemo(() => {
    if (!selectedReward) return [];
    
    // 1. Get all items in the same category, excluding the current one
    const sameCategory = REWARDS_DATA.filter(
      item => item.category === selectedReward.category && item.id !== selectedReward.id
    );

    // 2. Shuffle the array randomly so it's different every time
    const shuffled = sameCategory.sort(() => 0.5 - Math.random());

    // 3. Take the first 10 items from the shuffled list
    return shuffled.slice(0, 10);
  }, [selectedReward]);

  // --- REDEEM LOGIC ---
  const handleRedeem = async () => {
    if (loading || !canAfford || !user || !selectedReward) return;
    setLoading(true);
    
    try {
      // 1. Transaction Service: Deducts points and adds record to history
      const result = await redeemRewardTransaction(
        user.uid,
        profile?.fullName || "Anonymous",
        selectedReward
      );
      
      if (result.success) {
        // 2. Refresh local data immediately
        await refreshProfile();
        setRedeemed(true);
        
        // 🔥 Success Toast
        Toast.show({
            type: 'success',
            text1: 'Redemption Successful!',
            text2: `You got ${selectedReward.title}`,
            position: 'top',
            topOffset: 60
        });

      } else {
        // Error Toast
        Toast.show({
            type: 'error',
            text1: 'Redemption Failed',
            text2: result.error || "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Redemption Error:", error);
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: 'Could not complete transaction. Check internet.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationAfterRedeem = (target: 'Rewards' | 'Home') => {
    setRedeemed(false);
    // @ts-ignore 
    navigation.navigate(target);
  };

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

  // --- SUCCESS VIEW (Post-Redemption Screen) ---
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
              <Text style={styles.remainingPointsValue}>{profile?.points}</Text>
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

  // --- MAIN VIEW ---
  return (
    <View style={styles.container}>
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
        <Image
          source={{ uri: selectedReward.image }}
          style={styles.rewardImage}
          resizeMode="cover"
        />

        <View style={styles.detailsBody}>
          <Text style={styles.detailTitle}>{selectedReward.title}</Text>
          
          <View style={styles.costBadge}>
            <Coins size={20} color={COLORS.primary} />
            <Text style={styles.costText}>{selectedReward.points} Points</Text>
          </View>

          <Text style={styles.detailDescription}>
            {selectedReward.description}
          </Text>

          {/* Current Balance Card */}
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
          </View>

          {/* --- VERTICAL LIST RELATED PRODUCTS (SHUFFLED) --- */}
          {relatedRewards.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>More in {selectedReward.category}</Text>
              
              <View style={styles.verticalListContainer}>
                {relatedRewards.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.verticalCard}
                    // Using push to stack screens so "Back" works correctly
                    onPress={() => navigation.push("RewardDetails", { selectedReward: item })}
                  >
                    {/* Image on Left */}
                    <Image source={{ uri: item.image }} style={styles.verticalCardImage} />
                    
                    {/* Text on Right */}
                    <View style={styles.verticalCardContent}>
                      <Text style={styles.verticalCardTitle} numberOfLines={2}>{item.title}</Text>
                      <View style={styles.relatedPointsRow}>
                        <Coins size={14} color={COLORS.primary} />
                        <Text style={styles.relatedCardPoints}>{item.points}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Sticky Footer */}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 }, // Space for sticky footer
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  // Header & Body
  rewardImage: { width: '100%', height: 300, backgroundColor: COLORS.surfaceVariant },
  floatingBackButton: { position: 'absolute', left: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
  detailsBody: { padding: 24, backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20 },
  detailTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  costBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceVariant, alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, gap: 6, marginBottom: 16 },
  costText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  detailDescription: { fontSize: 16, lineHeight: 24, color: COLORS.textSecondary, marginBottom: 24 },

  // User Status
  userPointsCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.outline, marginBottom: 24 },
  userPointsLabel: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
  userPointsValue: { fontSize: 18, fontWeight: '700', color: COLORS.primary },

  // Terms
  termsContainer: { backgroundColor: COLORS.surfaceVariant, padding: 16, borderRadius: 12, marginBottom: 24 },
  termsHeader: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  bulletPoint: { flexDirection: 'row', marginBottom: 6 },
  bullet: { fontSize: 14, color: COLORS.textSecondary, marginRight: 8 },
  termText: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },

  // --- NEW: VERTICAL LIST STYLES ---
  relatedSection: { marginBottom: 20 },
  relatedTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  verticalListContainer: { gap: 12 },
  verticalCard: {
    flexDirection: 'row', // Side by side
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.outline,
    height: 90, // Fixed height for consistency
    alignItems: 'center',
  },
  verticalCardImage: {
    width: 90,
    height: '100%',
    backgroundColor: COLORS.surfaceVariant,
  },
  verticalCardContent: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  verticalCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  relatedPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relatedCardPoints: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Footer & Buttons
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.outline },
  actionButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', width: '100%' },
  primaryButton: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.outline },
  outlineButtonText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '700' },
  disabledButton: { backgroundColor: COLORS.outline, shadowOpacity: 0, elevation: 0 },
  backButtonSimple: { marginTop: 20, padding: 10 },
  backButtonText: { color: COLORS.primary, fontWeight: '600' },
  errorText: { fontSize: 16, color: COLORS.textSecondary },

  // Success
  successContainer: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  successContent: { width: '100%', alignItems: 'center' },
  successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.successBackground, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  successSubtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  remainingPointsCard: { backgroundColor: COLORS.surfaceVariant, paddingVertical: 20, paddingHorizontal: 40, borderRadius: 16, alignItems: 'center', marginBottom: 40, width: '100%' },
  remainingPointsLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  remainingPointsValue: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
  buttonGroup: { width: '100%', gap: 12 },
});