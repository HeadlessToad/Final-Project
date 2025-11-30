// src/screens/HomeScreen.tsx

import * as React from 'react';
import { View, Text, ScrollView, Pressable, ViewProps, PressableProps, TextProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, Coins, User, ArrowRight } from 'lucide-react-native'; // Use RN version of lucide icons
import { styled } from 'nativewind';
import { cn } from '../components/ui/utils';

// --- Import Converted UI Components ---
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/seperator';

// --- Context/Types (Assume these interfaces/types are defined globally) ---
// Note: 'Screen' type is replaced by string literals or Expo Router file names.
// type Screen = 'home' | 'scan' | 'rewards-catalog' | 'profile' | 'classification-history'; 

interface UserData {
  name: string;
  points: number;
}

interface HomeScreenProps {
  userData: UserData;
  // onNavigate is replaced by the standard React Navigation/Expo Router navigation object
  onNavigate: (screen: string) => void;
}

interface ClassificationItem {
  id: number;
  type: string;
  points: number;
  date: string;
  icon: string;
}

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

// --- Dummy Data ---
const recentClassifications: ClassificationItem[] = [
  { id: 1, type: 'Plastic Bottle', points: 15, date: 'Today, 10:30 AM', icon: '🧴' },
  { id: 2, type: 'Aluminum Can', points: 20, date: 'Today, 9:15 AM', icon: '🥫' },
  { id: 3, type: 'Paper', points: 10, date: 'Yesterday, 5:20 PM', icon: '📄' },
  { id: 4, type: 'Glass Bottle', points: 25, date: 'Yesterday, 2:45 PM', icon: '🍾' },
];

// --- Navigational Helpers (for internal links) ---
const navigateTo = (navigation: any, screen: string) => {
    // In a real Expo Router app, this maps to the file name
    navigation.navigate(screen as never);
};


/**
 * @function HomeScreen
 * @description The main dashboard screen displaying user points and calls to action.
 */
export function HomeScreen({ userData }: HomeScreenProps) {
  const navigation = useNavigation();
  
  // Map CSS variables to NativeWind classes:
  const PRIMARY_COLOR = 'text-green-600 dark:text-green-400'; 
  const PRIMARY_GRADIENT = `from-green-600 to-blue-600`;
  const SECONDARY_BG = 'bg-blue-600 dark:bg-blue-700'; // For Redeem button
  const SURFACE_VARIANT_TEXT = 'text-gray-500 dark:text-gray-400';
  const PRIMARY_TEXT_WHITE = 'text-white/80';
  const WHITE_BG_10 = 'bg-white/10';
  const BORDER_WHITE_20 = 'border-white/20';

  return (
    <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StyledScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* --- Header & Points Section --- */}
        <StyledView className={cn(
            `bg-gradient-to-br ${PRIMARY_GRADIENT} px-6 pt-12 pb-8 rounded-b-3xl`, // rounded-b-[var(--radius-lg)]
        )}>
          <StyledView className="flex flex-row items-center justify-between mb-6">
            <StyledView>
              <StyledText className={cn("mb-1 text-base", PRIMARY_TEXT_WHITE)}>Good Morning 👋</StyledText>
              <StyledText className="text-3xl font-bold text-white">{userData.name}</StyledText>
            </StyledView>
            
            {/* Profile Button (Icon) */}
            <Pressable
              onPress={() => navigateTo(navigation, 'ProfileScreen')}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 active:bg-white/30"
            >
              <User size={24} className="text-white" />
            </Pressable>
          </StyledView>

          {/* Points Balance Card (Semi-transparent) */}
          <Card 
            className={cn(WHITE_BG_10, `backdrop-blur-sm border ${BORDER_WHITE_20} p-4`)}
            padding="medium"
          >
            <StyledView className="flex flex-row items-center justify-between">
              <StyledView>
                <StyledText className={cn("text-sm mb-1", PRIMARY_TEXT_WHITE)}>Your Points</StyledText>
                <StyledView className="flex flex-row items-center gap-2">
                  <Coins size={24} className="text-white" />
                  <StyledText className="text-4xl font-bold text-white">{userData.points}</StyledText>
                </StyledView>
              </StyledView>
              
              <Button
                variant="secondary"
                size="small"
                // The secondary variant must be converted to the specific primary/secondary color
                className={SECONDARY_BG}
                onClick={() => navigateTo(navigation, 'RewardsCatalogScreen')}
              >
                Redeem
              </Button>
            </StyledView>
          </Card>
        </StyledView>

        {/* --- Main Content --- */}
        <StyledView className="px-6 py-6 space-y-6">
          
          {/* Scan Waste Button (Primary Action) */}
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={() => navigateTo(navigation, 'ScanScreen')}
            icon={<Camera size={24} color="white" />}
            className="shadow-xl"
          >
            Scan Waste
          </Button>

          {/* Recent Classifications Section */}
          <StyledView>
            <StyledView className="flex flex-row items-center justify-between mb-4">
              {/* <h3>Recent Classifications</h3> -> h3 is replaced by StyledText */}
              <StyledText className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Classifications</StyledText>
              
              <Pressable
                onPress={() => navigateTo(navigation, 'ClassificationHistoryScreen')}
                className="active:opacity-80"
              >
                <StyledText className={cn("text-sm font-semibold", PRIMARY_COLOR)}>
                  View All <ArrowRight size={14} className={PRIMARY_COLOR} />
                </StyledText>
              </Pressable>
            </StyledView>

            <StyledView className="space-y-3">
              {recentClassifications.map((item) => (
                <Card key={item.id} onClick={() => navigateTo(navigation, 'ClassificationResultScreen')}>
                  <StyledView className="flex flex-row items-center gap-4">
                    
                    {/* Icon/Emoji */}
                    <StyledText className="text-4xl">{item.icon}</StyledText>
                    
                    {/* Details */}
                    <StyledView className="flex-1">
                      {/* <h4>{item.type}</h4> -> h4 is replaced by StyledText */}
                      <StyledText className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">{item.type}</StyledText>
                      <StyledText className={cn("text-sm", SURFACE_VARIANT_TEXT)}>{item.date}</StyledText>
                    </StyledView>
                    
                    {/* Points */}
                    <StyledView className={cn("flex flex-row items-center gap-1", PRIMARY_COLOR)}>
                      <Coins size={16} />
                      <StyledText className="font-semibold text-inherit">+{item.points}</StyledText>
                    </StyledView>
                    
                  </StyledView>
                </Card>
              ))}
              
              <Separator className="my-4" />

            </StyledView>
          </StyledView>
        </StyledView>
      </StyledScrollView>

      {/* NOTE: Bottom Navigation is handled by the Expo Router tabs structure (app/(tabs)) 
          and should not be manually implemented inside a screen component for a production app.
          The original manual <nav> element is omitted.
      */}
    </StyledView>
  );
}