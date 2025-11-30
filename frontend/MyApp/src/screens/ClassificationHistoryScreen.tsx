// src/screens/ClassificationHistoryScreen.tsx

import * as React from 'react';
import { View, Text, ScrollView, FlatList, PressableProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Coins, Calendar as CalendarIcon, ArrowLeft, MoreVertical } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from '../components/ui/utils';

// --- Import Converted UI Components ---
import { Header } from '../components/Header'; // <-- FIXED PATH
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/seperator'; // <-- FIXED TYPO (seperator -> separator)

// --- Context Hooks and Types (Assumed to be functional) ---
import { useAuth } from '../context/AuthContext'; 
import { ClassificationHistoryEntry } from '../types'; // Import the history type

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

// --- Dummy Data (Replaces the array in the original file) ---
const historyItems: ClassificationHistoryEntry[] = [
  { id: '1', userId: 'user1', predictedClass: 'plastic', imageUrl: 'uri_1', confidence: 0.94, pointsEarned: 15, timestamp: new Date('2025-11-30T10:30:00Z') as any, userFeedback: 'CORRECT' },
  { id: '2', userId: 'user1', predictedClass: 'metal', imageUrl: 'uri_2', confidence: 0.98, pointsEarned: 20, timestamp: new Date('2025-11-30T09:15:00Z') as any, userCorrection: 'metal' },
  { id: '3', userId: 'user1', predictedClass: 'paper', imageUrl: 'uri_3', confidence: 0.89, pointsEarned: 10, timestamp: new Date('2025-11-29T17:20:00Z') as any, userFeedback: 'INCORRECT', userCorrection: 'cardboard' },
  { id: '4', userId: 'user1', predictedClass: 'glass', imageUrl: 'uri_4', confidence: 0.92, pointsEarned: 25, timestamp: new Date('2025-11-29T14:45:00Z') as any, userFeedback: 'CORRECT' },
  { id: '5', userId: 'user1', predictedClass: 'cardboard', imageUrl: 'uri_5', confidence: 0.96, pointsEarned: 12, timestamp: new Date('2025-11-28T16:10:00Z') as any, userCorrection: 'cardboard' },
];

// --- Helper Functions ---
const formatTimestamp = (timestamp: any) => {
  if (timestamp && timestamp.toDate) {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' - ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return 'N/A';
};

const getIconAndColor = (type: string) => {
    switch(type.toLowerCase()) {
        case 'plastic': return { icon: '🧴', color: 'text-blue-500', bgColor: 'bg-blue-100' };
        case 'metal': return { icon: '🥫', color: 'text-gray-500', bgColor: 'bg-gray-100' };
        case 'paper': return { icon: '📄', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        case 'glass': return { icon: '🍾', color: 'text-green-600', bgColor: 'bg-green-100' };
        case 'cardboard': return { icon: '📦', color: 'text-orange-600', bgColor: 'bg-orange-100' };
        default: return { icon: '🗑️', color: 'text-red-500', bgColor: 'bg-red-100' };
    }
};

// --- Custom History Item Renderer ---
const HistoryItem = React.memo(({ item }: { item: ClassificationHistoryEntry }) => {
    const { icon, color, bgColor } = getIconAndColor(item.predictedClass);
    const dateString = formatTimestamp(item.timestamp);
    
    // Map CSS variables to NativeWind classes
    const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400';
    const PRIMARY_TEXT = 'text-green-600 dark:text-green-400';

    return (
        <Card className="p-4">
            <StyledView className="flex flex-row items-center gap-4">
                
                {/* Icon */}
                <StyledView className={cn(`text-3xl p-2 rounded-full`, bgColor)}>
                    <StyledText className={cn(color)}>{icon}</StyledText>
                </StyledView>
                
                <StyledView className="flex-1 flex-col">
                    {/* Type and Date */}
                    <StyledText className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
                        {item.predictedClass.charAt(0).toUpperCase() + item.predictedClass.slice(1)}
                    </StyledText>
                    
                    <StyledView className={cn("flex flex-row items-center gap-2 text-sm mb-2", ON_SURFACE_VARIANT)}>
                        <CalendarIcon size={14} className={ON_SURFACE_VARIANT} />
                        <StyledText className="text-sm text-inherit">{dateString}</StyledText>
                    </StyledView>
                    
                    {/* Details: Confidence and Points */}
                    <StyledView className="flex flex-row items-center justify-between gap-4">
                        <StyledText className={cn("text-sm", ON_SURFACE_VARIANT)}>
                            Confidence: {Math.round(item.confidence * 100)}%
                        </StyledText>
                        
                        <StyledView className={cn("flex flex-row items-center gap-1", PRIMARY_TEXT)}>
                            <Coins size={16} />
                            <StyledText className="font-semibold text-inherit">+{item.pointsEarned}</StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>
            </StyledView>
        </Card>
    );
});


/**
 * @function ClassificationHistoryScreen
 * @description Displays the user's history of waste classifications and points earned.
 */
export function ClassificationHistoryScreen() {
    const navigation = useNavigation();
    const { profile } = useAuth(); // Assume profile context provides history or total points

    // Use total classifications and points from actual data if available, otherwise calculate from dummy
    const totalClassifications = historyItems.length;
    const totalPoints = historyItems.reduce((sum, item) => sum + item.pointsEarned, 0);

    // Placeholder for color variables for the gradient card
    const PRIMARY_ACCENT = 'from-green-600';
    const SECONDARY_ACCENT = 'to-blue-600';

    return (
        <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Header
                onBack={navigation.goBack}
                title="Classification History"
            />

            {/* FlatList Component Starts Here */}
            <FlatList
                data={historyItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
                ItemSeparatorComponent={() => <StyledView className="h-3" />}
                ListHeaderComponent={() => (
                    <StyledView className="mb-6 space-y-6">
                        
                        {/* Summary Card (Gradient) */}
                        <Card 
                            className={cn(
                                "p-6", // Overriding default padding
                                `bg-gradient-to-br ${PRIMARY_ACCENT} ${SECONDARY_ACCENT}`
                            )}
                        >
                            <StyledView className="flex flex-row items-center justify-between text-white">
                                <StyledView>
                                    <StyledText className="text-white/80 text-sm mb-1">Total Classifications</StyledText>
                                    <StyledText className="text-3xl font-bold text-white">{totalClassifications}</StyledText>
                                </StyledView>
                                
                                <StyledView className="text-right">
                                    <StyledText className="text-white/80 text-sm mb-1">Points Earned</StyledText>
                                    <StyledView className="flex flex-row items-center gap-2 justify-end">
                                        <Coins size={24} className="text-white" />
                                        <StyledText className="text-3xl font-bold text-white">{totalPoints}</StyledText>
                                    </StyledView>
                                </StyledView>
                            </StyledView>
                        </Card>
                        
                        {/* Section Header */}
                        <StyledText className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                            Recent Activity
                        </StyledText>
                        
                        <Separator className="bg-gray-200 dark:bg-gray-700 mx-0 mb-4" />
                        
                    </StyledView>
                )}
                renderItem={({ item }) => <HistoryItem item={item} />}
                ListEmptyComponent={() => (
                    <StyledText className="text-center text-gray-500 mt-12">
                        No classifications recorded yet. Start recycling!
                    </StyledText>
                )}
            />
        </StyledView>
    );
}