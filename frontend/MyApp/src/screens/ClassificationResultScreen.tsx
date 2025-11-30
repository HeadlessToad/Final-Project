// src/screens/ClassificationResultScreen.tsx

import * as React from 'react';
import { View, Text, ScrollView, PressableProps } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Camera, MapPin, Save, CheckCircle, MoreVertical } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from '../components/ui/utils';

// --- Import Converted UI Components ---
import { Header } from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress'; // Use our converted Progress component

// --- Context Hooks and Types (Assumed to be functional) ---
import { ClassificationResponse, WasteCategory } from '../types'; 

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);


// --- Dummy Data (Simulates API response) ---
const result: ClassificationResponse & { icon: string; category: string; points: number } = {
  prediction: 'plastic' as WasteCategory,
  confidence: 0.94,
  instructions: "Remove the cap and rinse the bottle\nCrush the bottle to save space\nPlace in the plastic recycling bin\nCaps can be recycled separately",
  imageUrl: 'path/to/bottle.jpg',
  icon: '🧴', // Used for display
  category: 'Recyclable Plastic',
  points: 15,
};

const instructions = result.instructions.split('\n');


/**
 * @function ClassificationResultScreen
 * @description Displays the results of the AI classification and provides follow-up actions.
 */
export function ClassificationResultScreen() {
  const navigation = useNavigation();
  // In a real app, useRoute().params would pass the result object here
  const { confidence, type, points } = {
    confidence: result.confidence * 100, // Convert to percentage 0-100
    type: result.type,
    points: result.points,
  };
  
  // Map CSS variables to NativeWind classes
  const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400';
  const PRIMARY_TEXT = 'text-green-600 dark:text-green-400';
  const PRIMARY_BG_LIGHT = 'bg-green-100 dark:bg-green-800/50';

  return (
    <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header
        onBack={navigation.goBack}
        title="Classification Result"
        // Placeholder for a potential action button (e.g., Share)
        actions={<MoreVertical size={24} className={ON_SURFACE_VARIANT} onPress={() => console.log('Share')} />}
      />

      <StyledScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 64 }}>
        <StyledView className="space-y-6">
          
          {/* Result Card */}
          <Card className="text-center p-6">
            <StyledText className="text-6xl mb-4">{result.icon}</StyledText>
            <StyledText className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{result.type}</StyledText>
            <StyledText className={cn("text-base mb-4", ON_SURFACE_VARIANT)}>{result.category}</StyledText>
            
            {/* Confidence Meter (Using Progress component) */}
            <StyledView className="mb-4">
              <StyledView className="flex flex-row items-center justify-between mb-2">
                <StyledText className={cn("text-sm", ON_SURFACE_VARIANT)}>Confidence</StyledText>
                <StyledText className={cn("text-sm font-semibold", PRIMARY_TEXT)}>{confidence.toFixed(0)}%</StyledText>
              </StyledView>
              <StyledView className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <Progress 
                    value={confidence} 
                    className="h-full"
                    // Custom gradient styling is complex in RN; we use a single color for simplicity
                    indicatorClassName="bg-gradient-to-r from-green-500 to-blue-500" 
                />
              </StyledView>
            </StyledView>

            {/* Points Earned */}
            <StyledView 
                className={cn(
                    "rounded-xl p-4 mt-4", 
                    PRIMARY_BG_LIGHT,
                )}
            >
              <StyledView className="flex flex-row items-center justify-center gap-2">
                <CheckCircle size={24} className={PRIMARY_TEXT} />
                <StyledView>
                  <StyledText className={cn("text-sm", ON_SURFACE_VARIANT)}>Points Earned</StyledText>
                  <StyledText className={cn("text-xl font-bold", PRIMARY_TEXT)}>+{points}</StyledText>
                </StyledView>
              </StyledView>
            </StyledView>
          </Card>

          {/* Recycling Instructions */}
          <Card className="p-6">
            <StyledText className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Recycling Instructions</StyledText>
            <StyledView className="space-y-4">
              {instructions.map((instruction, index) => (
                <StyledView key={index} className="flex flex-row gap-3 items-start">
                  {/* Numbered Indicator */}
                  <StyledView 
                    className={cn(
                        "w-6 h-6 rounded-full bg-green-600 dark:bg-green-700 text-white flex items-center justify-center flex-shrink-0"
                    )}
                  >
                    <StyledText className="text-sm font-medium text-white">{index + 1}</StyledText>
                  </StyledView>
                  <StyledText className={cn("flex-1 text-base", ON_SURFACE_VARIANT)}>
                    {instruction}
                  </StyledText>
                </StyledView>
              ))}
            </StyledView>
          </Card>

          {/* Actions */}
          <StyledView className="space-y-3 pt-4">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={() => navigation.navigate('ScanScreen' as never)} // Navigation to Scan Screen
              icon={<Camera size={20} color="white" />}
            >
              Scan Again
            </Button>
            <Button
              variant="outline"
              size="large"
              fullWidth
              onPress={() => navigation.navigate('RecyclingCentersScreen' as never)} // Navigation to Centers Screen
              icon={<MapPin size={20} className={PRIMARY_TEXT} />}
            >
              Find Recycling Center
            </Button>
            <Button
              variant="text"
              size="large"
              fullWidth
              onPress={() => { /* Placeholder for Feedback/Save Logic */ console.log("Save Result/Feedback"); }}
              icon={<Save size={20} className={PRIMARY_TEXT} />}
            >
              Save Result
            </Button>
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
}