// src/screens/RecyclingCentersScreen.tsx

import * as React from 'react';
import { View, Text, FlatList, Pressable, PressableProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Home, Gift, User, Recycle, MapPin } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from '../components/ui/utils';

// --- Import Converted UI Components ---
import { Header } from '../components/Header';
import { CenterListItem } from '../components/CenterListItem'; // Custom component

// --- Context Hooks and Types (Assumed to be functional) ---
import { RecyclingCenter } from '../types';

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);

// --- Dummy Data (Adapted to RecyclingCenter type) ---
const centers: (RecyclingCenter & { distance: string })[] = [
  { id: '1', name: 'EcoCenter Downtown', address: '123 Green Street', distance: '0.5 km away', wasteTypes: ['plastic', 'paper', 'glass'], latitude: 32.0853, longitude: 34.7818 },
  { id: '2', name: 'City Recycling Hub', address: '456 Recycle Avenue', distance: '1.2 km away', wasteTypes: ['electronics', 'metal', 'hazardous'], latitude: 32.0800, longitude: 34.7700 },
  { id: '3', name: 'GreenLife Collection Point', address: '789 Eco Boulevard', distance: '2.1 km away', wasteTypes: ['plastic', 'aluminum', 'cardboard'], latitude: 32.0900, longitude: 34.7850 },
  { id: '4', name: 'Community Recycling Station', address: '321 Earth Lane', distance: '3.5 km away', wasteTypes: ['organic', 'compost', 'trash'], latitude: 32.0750, longitude: 34.7900 },
];

/**
 * @function RecyclingCentersScreen
 * @description Displays a map view and a list of nearby recycling centers.
 */
export function RecyclingCentersScreen() {
  const navigation = useNavigation();

  // Map CSS variables to NativeWind classes:
  const PRIMARY_COLOR = 'text-green-600 dark:text-green-400';
  const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400';
  const PRIMARY_GRADIENT = 'from-green-200 to-blue-200';


  return (
    <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header title="Recycling Centers" />

      {/* --- Map Placeholder (Replaced by react-native-maps in production) --- */}
      <StyledView className={cn(`w-full h-48 relative overflow-hidden bg-gradient-to-br ${PRIMARY_GRADIENT}`)}>
        <StyledView className="absolute inset-0 flex items-center justify-center">
          <StyledView className="text-center">
            <StyledView className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Recycle size={32} className={PRIMARY_COLOR} />
            </StyledView>
            <StyledText className="text-sm text-gray-700">Map View (Requires Location Service)</StyledText>
          </StyledView>
        </StyledView>
        
        {/* Mock map pins */}
        <StyledView className="absolute top-12 left-16 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <StyledView className="absolute top-20 right-20 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <StyledView className="absolute bottom-16 left-24 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      </StyledView>

      {/* --- Centers List --- */}
      <FlatList
        data={centers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
        ItemSeparatorComponent={() => <StyledView className="h-4" />}
        ListHeaderComponent={() => (
            <StyledView className="flex flex-row items-center justify-between mb-2">
                <StyledText className="text-xl font-semibold text-gray-900 dark:text-gray-100">Nearby Centers</StyledText>
                <StyledText className={cn("text-sm", ON_SURFACE_VARIANT)}>{centers.length} found</StyledText>
            </StyledView>
        )}
        renderItem={({ item }) => (
          <CenterListItem
            key={item.id}
            name={item.name}
            address={item.address}
            distance={item.distance}
            wasteTypes={item.wasteTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1))} // Capitalize types for display
            // On click, navigate to a map app or details screen
            onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
                // Linking.openURL(url); // Actual RN method
                console.log(`Opening Google Maps for: ${item.name}`);
            }}
          />
        )}
        ListFooterComponent={() => <StyledView className="h-8" />}
        ListEmptyComponent={() => (
            <StyledText className="text-center text-gray-500 mt-12">
                No recycling centers found nearby.
            </StyledText>
        )}
      />

      {/* NOTE: Bottom Navigation is handled by the Expo Router tabs structure (app/(tabs)) */}
    </StyledView>
  );
}