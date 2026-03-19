// screens/RewardsScreen.tsx
// ============================================================================
// COMPONENT PURPOSE:
// Displays the catalog of available rewards. Users can browse items, filter 
// them by category using horizontal chips, or search by text. Selecting an 
// item navigates to the detailed reward screen.
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, TextInput } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Coins, Search } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext'; 
import { BottomNavBar } from '../navigation/BottomNavBar';

// IMPORT THE DATA
import { REWARDS_DATA, CATEGORIES, RewardItem } from '../data/rewardsData';

// ----------------------------------------------------------------------------
// CONSTANTS & CALCULATIONS
// ----------------------------------------------------------------------------
// Dynamically calculate item width based on screen size so exactly 2 items 
// fit per row with proper spacing/padding (48 = 16px padding on left/right + 16px gap)
const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; 

// Centralized color palette
const COLORS = {
    primary: '#4CAF50', 
    background: '#F5F7FA',
    text: '#1B5E20', 
    white: '#FFFFFF',
    grey: '#9E9E9E',
    lightGrey: '#E0E0E0'
};

type RewardsScreenProps = NativeStackScreenProps<RootStackParamList, "Rewards">;

export default function RewardsCatalogScreen({ navigation }: RewardsScreenProps) {
    // Fetch the user's live profile to display their current points balance
    const { profile } = useAuth();
    
    // --------------------------------------------------------------------------
    // STATE MANAGEMENT
    // --------------------------------------------------------------------------
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // --------------------------------------------------------------------------
    // FILTER LOGIC
    // --------------------------------------------------------------------------
    // Re-evaluates every time the user types in the search bar or taps a category chip.
    // It filters the static REWARDS_DATA array based on both criteria simultaneously.
    const filteredRewards = REWARDS_DATA.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // --------------------------------------------------------------------------
    // HANDLERS
    // --------------------------------------------------------------------------
    // Navigates to the detailed view of the clicked reward
    const handleRewardClick = (reward: RewardItem) => {
        // @ts-ignore
        navigation.navigate('RewardDetails', { selectedReward: reward }); 
    };

    // --------------------------------------------------------------------------
    // RENDERERS
    // --------------------------------------------------------------------------
    // Renders a single chip in the horizontal categories list
    const renderCategoryItem = ({ item }: { item: string }) => (
        <TouchableOpacity 
            onPress={() => setSelectedCategory(item)}
            style={[
                styles.categoryChip, 
                selectedCategory === item && styles.categoryChipActive // Highlight if selected
            ]}
        >
            <Text style={[
                styles.categoryText, 
                selectedCategory === item && styles.categoryTextActive
            ]}>
                {item}
            </Text>
        </TouchableOpacity>
    );

    // Renders a single reward card in the 2-column grid
    const renderRewardItem = ({ item }: { item: RewardItem }) => (
        <TouchableOpacity onPress={() => handleRewardClick(item)} style={styles.rewardTile} activeOpacity={0.9}>
            <Image source={{ uri: item.image }} style={styles.rewardImage} />
            <View style={styles.rewardContent}>
                <Text style={styles.categoryLabel}>{item.category}</Text>
                {/* numberOfLines={2} prevents long titles from breaking the grid layout */}
                <Text style={styles.rewardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.pointsBadge}>
                    <Coins size={14} color={COLORS.white} />
                    <Text style={styles.pointsText}>{item.points}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // --------------------------------------------------------------------------
    // MAIN RENDER
    // --------------------------------------------------------------------------
    return (
        <View style={styles.fullContainer}>
            
            {/* 1. Header Section (Balance & Search) */}
            <View style={styles.header}>
                <View style={styles.balanceContainer}>
                   <Text style={styles.balanceLabel}>Your Balance</Text>
                   <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                        <Coins size={24} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.balanceValue}>{profile?.points || 0}</Text>
                   </View>
                </View>

                {/* Text Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={20} color={COLORS.grey} />
                    <TextInput 
                        placeholder="Search for gifts..." 
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery} // Automatically updates the filter logic above
                    />
                </View>
            </View>

            {/* 2. Categories Horizontal Scroll */}
            <View style={{ height: 60 }}>
                <FlatList
                    data={CATEGORIES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={renderCategoryItem}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            {/* 3. Rewards Grid */}
            <FlatList
                data={filteredRewards}
                keyExtractor={(item) => item.id}
                numColumns={2} // Creates the 2-column layout
                columnWrapperStyle={styles.columnWrapper} // Spaces out the 2 columns evenly
                contentContainerStyle={styles.rewardsGrid}
                renderItem={renderRewardItem}
                ListEmptyComponent={
                    // Displayed if the search/filter combination yields no results
                    <Text style={styles.emptyText}>No items found matching "{searchQuery}"</Text>
                }
            />

            {/* Global Bottom Navigation Bar */}
            <BottomNavBar currentRoute="Rewards" />
        </View>
    );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    
    // Header
    header: { padding: 20, backgroundColor: COLORS.white, paddingBottom: 10 },
    balanceContainer: { marginBottom: 15 },
    balanceLabel: { fontSize: 14, color: COLORS.grey },
    balanceValue: { fontSize: 32, fontWeight: '800', color: COLORS.text },
    
    // Search Bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },

    // Categories
    categoriesList: { paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGrey,
        marginRight: 8, // Adds spacing between chips
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryText: { fontWeight: '600', color: COLORS.grey },
    categoryTextActive: { color: COLORS.white },

    // Grid Container
    rewardsGrid: { padding: 16, paddingBottom: 80 },
    columnWrapper: { justifyContent: 'space-between' },
    emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.grey },

    // Individual Reward Tile
    rewardTile: {
        width: ITEM_WIDTH,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden'
    },
    rewardImage: { width: '100%', height: 120, resizeMode: 'cover' },
    rewardContent: { padding: 12 },
    categoryLabel: { fontSize: 10, color: COLORS.primary, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
    rewardTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, height: 40 },
    pointsBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: COLORS.primary, 
        alignSelf: 'flex-start', 
        paddingVertical: 4, 
        paddingHorizontal: 8, 
        borderRadius: 8, 
        gap: 4 
    },
    pointsText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 }
});