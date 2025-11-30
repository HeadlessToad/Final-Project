// src/screens/RewardsCatalogScreen.tsx

import * as React from 'react';
import { View, Text, FlatList, Pressable, PressableProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Gift } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from '../components/ui/utils';

// --- Import Converted UI Components ---
import { Header } from '../components/Header';
import { RewardTile } from '../components/RewardTile'; // Custom component
import { Separator } from '../components/ui/seperator';

// --- Context Hooks and Types (Assumed to be functional) ---
import { useAuth } from '../context/AuthContext'; 
import { Reward } from '../types';

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);

// --- Dummy Reward Data (Adapted to Reward type) ---
const rewards: (Reward & { image: string })[] = [
  { id: '1', name: 'Coffee Shop Voucher', costPoints: 200, inventoryCount: 50, image: 'https://via.placeholder.com/600x600/34D399/FFFFFF?text=Coffee+Voucher' },
  { id: '2', name: 'Plant a Tree', costPoints: 500, inventoryCount: 100, image: 'https://via.placeholder.com/600x600/34D399/FFFFFF?text=Plant+a+Tree' },
  { id: '3', name: 'Shopping Discount', costPoints: 300, inventoryCount: 200, image: 'https://via.placeholder.com/600x600/34D399/FFFFFF?text=Discount+Coupon' },
  { id: '4', name: 'Reusable Water Bottle', costPoints: 400, inventoryCount: 75, image: 'https://via.placeholder.com/600x600/34D399/FFFFFF?text=Water+Bottle' },
  { id: '5', name: 'Eco Tote Bag', costPoints: 250, inventoryCount: 150, image: 'https://via.placeholder.com/600x600/34D399/FFFFFF?text=Tote+Bag' },
  { id: '6', name: 'Green Energy Credit', costPoints: 1000, inventoryCount: 30, image: 'https://via.placeholder.com/600x600/34D399/FFFFFF?text=Energy+Credit' }
];

/**
 * @function RewardsCatalogScreen
 * @description Displays the catalog of rewards redeemable with points.
 */
export function RewardsCatalogScreen() {
    const navigation = useNavigation();
    const { profile } = useAuth();

    // Map CSS variables to NativeWind classes:
    const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400';
    const BACKGROUND_COLOR = 'bg-gray-50 dark:bg-gray-900';

    const handleRewardClick = (reward: Reward) => {
        // Navigate to the reward details screen, passing the reward object as a parameter
        navigation.navigate('RewardDetailsScreen' as never, { reward } as never);
    };

    return (
        <StyledView className="flex-1" style={{ backgroundColor: BACKGROUND_COLOR }}>
            <Header title="Rewards" />

            <FlatList
                data={rewards}
                keyExtractor={(item) => item.id}
                numColumns={2} // Creates the grid layout
                columnWrapperStyle={{ justifyContent: 'space-between' }} // Ensures even spacing between columns
                contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
                ItemSeparatorComponent={() => <StyledView className="h-4" />}
                
                ListHeaderComponent={() => (
                    <StyledView className="mb-6">
                        <StyledText className={cn("text-base mb-4", ON_SURFACE_VARIANT)}>
                            Redeem your points for eco-friendly rewards and make a difference!
                        </StyledText>
                        <Separator className="my-2" />
                        <StyledText className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Available Rewards ({rewards.length})
                        </StyledText>
                    </StyledView>
                )}
                
                renderItem={({ item }) => (
                    // We need a wrapper view to handle spacing correctly in FlatList columns
                    <StyledView style={{ width: '48%' }}>
                        <RewardTile
                            key={item.id}
                            image={item.image}
                            title={item.name}
                            points={item.costPoints}
                            onClick={() => handleRewardClick(item)}
                        />
                    </StyledView>
                )}
                
                ListFooterComponent={() => <StyledView className="h-8" />}
                ListEmptyComponent={() => (
                    <StyledText className="text-center text-gray-500 mt-12">
                        No rewards currently available.
                    </StyledText>
                )}
            />

            {/* NOTE: Bottom Navigation is handled by the Expo Router tabs structure (app/(tabs)) */}
        </StyledView>
    );
}