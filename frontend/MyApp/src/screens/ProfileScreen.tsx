// src/screens/ProfileScreen.tsx

import * as React from 'react';
import { View, Text, ScrollView, Pressable, PressableProps, ViewProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Coins, ChevronRight, History, TrendingUp, Settings, MessageSquare, Home, Gift, Recycle } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from '../components/ui/utils';

// --- Import Converted UI Components ---
import { Header } from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/seperator';

// --- Context Hooks and Types (Assumed to be functional) ---
import { useAuth } from '../context/AuthContext'; 

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

// --- Menu Item Definition (Internal) ---
interface MenuItem {
    icon: React.ReactNode;
    label: string;
    screen: string; // Screen name for navigation
}

// The menu items list
const menuItems: MenuItem[] = [
    { icon: <User size={20} />, label: 'Edit Profile', screen: 'EditProfileScreen' },
    { icon: <History size={20} />, label: 'Classification History', screen: 'ClassificationHistoryScreen' },
    { icon: <TrendingUp size={20} />, label: 'Points History', screen: 'PointsHistoryScreen' },
    { icon: <MessageSquare size={20} />, label: 'Feedback', screen: 'FeedbackScreen' },
    { icon: <Settings size={20} />, label: 'Settings', screen: 'SettingsScreen' } // Assumed SettingsScreen
];


/**
 * @function ProfileScreen
 * @description The user's profile hub displaying personal stats and navigation links.
 */
export function ProfileScreen() {
    const navigation = useNavigation();
    const { profile, user } = useAuth(); // Get user data from context
    
    // Default user data (for type safety and initial render)
    const userData = {
        name: profile?.displayName || 'Eco Warrior',
        email: profile?.email || 'N/A',
        points: profile?.points || 0,
        photo: profile?.profilePhotoUrl || '', // Will be used for AvatarImage
    };

    // Map CSS variables to NativeWind classes:
    const PRIMARY_COLOR = 'text-green-600 dark:text-green-400';
    const PRIMARY_BG = 'bg-green-600 dark:bg-green-700';
    const SECONDARY_BG = 'bg-blue-600 dark:bg-blue-700';
    const PRIMARY_GRADIENT = `from-green-600 to-blue-600`;
    const PRIMARY_BG_LIGHT = 'bg-green-100 dark:bg-green-800/50';
    const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400';
    const ON_SURFACE_TEXT = 'text-gray-900 dark:text-gray-100';
    const OUTLINE_COLOR = 'border-gray-200 dark:border-gray-700';


    return (
        <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Header title="Profile" />

            <StyledScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 100 }}>
                <StyledView className="space-y-6">
                    
                    {/* --- 1. Profile Card (User Info & Points) --- */}
                    <Card>
                        <StyledView className="flex flex-row items-center gap-4 mb-4">
                            
                            {/* Avatar */}
                            <Avatar className="size-20">
                                <StyledView className={`size-full rounded-full flex items-center justify-center bg-gradient-to-br ${PRIMARY_GRADIENT}`}>
                                    {userData.photo ? (
                                        // Placeholder for AvatarImage once integrated
                                        <StyledText>IMG</StyledText> 
                                    ) : (
                                        <AvatarFallback>
                                            <User size={40} className="text-white" />
                                        </AvatarFallback>
                                    )}
                                </StyledView>
                            </Avatar>

                            {/* Name and Email */}
                            <StyledView className="flex-1">
                                <StyledText className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">{userData.name}</StyledText>
                                <StyledText className={cn("text-sm", ON_SURFACE_VARIANT)}>{userData.email}</StyledText>
                            </StyledView>
                        </StyledView>

                        <Separator className={OUTLINE_COLOR} />

                        {/* Points Display & Redeem Button */}
                        <StyledView className={cn("rounded-xl p-4 mt-4", PRIMARY_BG_LIGHT)}>
                            <StyledView className="flex flex-row items-center justify-between">
                                <StyledView>
                                    <StyledText className={cn("text-sm mb-1", ON_SURFACE_VARIANT)}>Total Points</StyledText>
                                    <StyledView className="flex flex-row items-center gap-2">
                                        <Coins size={24} className={PRIMARY_COLOR} />
                                        <StyledText className={cn("text-3xl font-bold", PRIMARY_COLOR)}>{userData.points}</StyledText>
                                    </StyledView>
                                </StyledView>
                                
                                <Button
                                    onClick={() => navigation.navigate('RewardsCatalogScreen' as never)}
                                    className={cn("px-4 py-2 rounded-full", PRIMARY_BG, "text-white active:bg-green-700")}
                                >
                                    <StyledText className="text-white font-semibold">Redeem</StyledText>
                                </Button>
                            </StyledView>
                        </StyledView>
                    </Card>

                    {/* --- 2. Stats Cards (Items Scanned & CO2 Saved) --- */}
                    <StyledView className="flex flex-row gap-4">
                        <Card className="flex-1 text-center p-4">
                            <StyledText className="text-2xl mb-2">♻️</StyledText>
                            <StyledText className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">47</StyledText>
                            <StyledText className={cn("text-sm", ON_SURFACE_VARIANT)}>Items Scanned</StyledText>
                        </Card>
                        <Card className="flex-1 text-center p-4">
                            <StyledText className="text-2xl mb-2">🌱</StyledText>
                            <StyledText className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">12.5 kg</StyledText>
                            <StyledText className={cn("text-sm", ON_SURFACE_VARIANT)}>CO₂ Saved</StyledText>
                        </Card>
                    </StyledView>

                    {/* --- 3. Menu Items List --- */}
                    <Card padding="none">
                        <StyledView className="flex flex-col">
                            {menuItems.map((item, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => navigation.navigate(item.screen as never)}
                                    className={cn(
                                        "w-full flex flex-row items-center gap-4 p-4 active:bg-gray-100 dark:active:bg-gray-700 transition-colors",
                                        index < menuItems.length - 1 && `border-b ${OUTLINE_COLOR}` // Apply border to all but the last item
                                    )}
                                >
                                    <StyledView className={cn(ON_SURFACE_VARIANT)}>{item.icon}</StyledView>
                                    <StyledText className="flex-1 text-base text-left text-gray-900 dark:text-gray-100">{item.label}</StyledText>
                                    <ChevronRight size={20} className={ON_SURFACE_VARIANT} />
                                </Pressable>
                            ))}
                        </StyledView>
                    </Card>
                </StyledView>
            </StyledScrollView>

            {/* NOTE: Bottom Navigation is handled by the Expo Router tabs structure (app/(tabs)) 
                and should not be manually implemented inside a screen component.
            */}
        </StyledView>
    );
}