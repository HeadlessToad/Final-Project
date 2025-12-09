// screens/RewardsScreen.tsx (The Catalog Page)

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Coins, Gift } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext'; 
import { BottomNavBar } from '../navigation/BottomNavBar';

// Note: We use 'Rewards' as the screen name in AppNavigator

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2; // 20 padding left + 20 padding right + 20 gap = 60

const COLORS = {
    primary: '#4CAF50', 
    background: '#F9F9F9',
    text: '#1B5E20', 
    onSurfaceVariant: '#616161', 
    white: '#FFFFFF',
};

// --- INTERFACES (from types.ts, included here for context) ---
export interface RewardItem {
    id: number;
    title: string;
    points: number;
    image: string; // URL
    description: string;
}

// --- MOCK DATA (from Figma code) ---
const rewards: RewardItem[] = [
    { id: 1, title: 'Coffee Shop Voucher', points: 200, image: 'https://images.unsplash.com/photo-1757136486127-8127c5267a06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjB2b3VjaGVyJTIwZ2lmdCUyMGNhcmR8ZW58MXx8fHwxNzY0NTA1NzY1fDA&ixlib=rb-4.1.0&q=80&w=1080', description: '$5 voucher at participating coffee shops' },
    { id: 2, title: 'Plant a Tree', points: 500, image: 'https://images.unsplash.com/photo-1636116305751-dd062664d4a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMHNlZWRsaW5nJTIwZWNvfGVufDF8fHx8MTc2NDUwNTc2NXww&ixlib=rb-4.1.0&q=80&w=1080', description: 'We\'ll plant a tree in your name' },
    { id: 3, title: 'Shopping Discount', points: 300, image: 'https://images.unsplash.com/photo-1644370644949-b175294cbceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxzaG9wcGluZyUyMGRpc2NvdW50JTIwY291cG9ufGVufDF8fHx8MTc2NDUwNTc2Nnww&ixlib=rb-4.1.0&q=80&w=1080', description: '10% off at eco-friendly stores' },
    { id: 4, title: 'Reusable Water Bottle', points: 400, image: 'https://images.unsplash.com/photo-1623684194967-48075185a58c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyZXVzYWJsZSUyMHdhdGVyJTIwYm90dGxlfGVufDF8fHx8MTc2NDUwNTc2Nnww&ixlib=rb-4.1.0&q=80&w=1080', description: 'Premium stainless steel water bottle' },
    // Add all 6 items here...
    { id: 5, title: 'Eco Tote Bag', points: 250, image: 'https://images.unsplash.com/photo-1764033789435-8d27429b13cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3RlJTIwYmFnJTIwZWNvJTIwZnJpZW5kbHl8ZW58MXx8fHwxNzY0NDE4MDk0fDA&ixlib=rb-4.1.0&q=80&w=1080', description: 'Organic cotton reusable bag' },
    { id: 6, title: 'Green Energy Credit', points: 1000, image: 'https://images.unsplash.com/photo-1749805339958-4b1d0f16423d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWN5Y2xpbmclMjBlY28lMjBlbnZpcm9ubWVudHxlbnwxfHx8fDE3NjQ1MDU3NjR8MA&ixlib=rb-4.1.0&q=80&w=1080', description: '$20 credit towards renewable energy' }
];

type RewardsScreenProps = NativeStackScreenProps<RootStackParamList, "Rewards">;


// --- Reward Tile Component ---
const RewardTile: React.FC<{ reward: RewardItem, onPress: () => void }> = ({ reward, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.rewardTile} activeOpacity={0.8}>
        <Image source={{ uri: reward.image }} style={styles.rewardImage} />
        <View style={styles.rewardTextContainer}>
            <Text style={styles.rewardTitle} numberOfLines={2}>{reward.title}</Text>
            <View style={styles.rewardPointsContainer}>
                <Coins size={16} color={COLORS.primary} />
                <Text style={styles.rewardPointsText}>{reward.points}</Text>
            </View>
        </View>
    </TouchableOpacity>
);


export default function RewardsCatalogScreen({ navigation }: RewardsScreenProps) {
    const { profile } = useAuth();
    
    // Function to navigate to the details screen, passing the selected reward data
    const handleRewardClick = (reward: RewardItem) => {
        // 🔥 Navigate to the RewardDetails screen, passing the reward object
        navigation.navigate('RewardDetails', { selectedReward: reward }); 
    };

    return (
        <View style={styles.fullContainer}>
            {/* Header title is set by AppNavigator: "Rewards Catalog" */}
            
            <View style={styles.headerTextContainer}>
                <Text style={styles.headerSubtitle}>
                    Redeem your points for eco-friendly rewards and make a difference!
                </Text>
            </View>

            {/* Rewards Grid */}
            <FlatList
                data={rewards}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.rewardsGrid}
                renderItem={({ item }) => (
                    <RewardTile 
                        reward={item} 
                        onPress={() => handleRewardClick(item)} 
                    />
                )}
            />

            {/* --- Bottom Navigation (Required for persistent tabs) --- */}
            <BottomNavBar currentRoute="Rewards" />

        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    headerTextContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS.onSurfaceVariant,
    },
    rewardsGrid: {
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    
    // --- Reward Tile Styles ---
    rewardTile: {
        width: ITEM_WIDTH,
        backgroundColor: COLORS.white,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    rewardImage: {
        width: '100%',
        height: ITEM_WIDTH, 
        backgroundColor: COLORS.surfaceVariant,
    },
    rewardTextContainer: {
        padding: 10,
    },
    rewardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
        minHeight: 35, 
    },
    rewardPointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 5,
    },
    rewardPointsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
});