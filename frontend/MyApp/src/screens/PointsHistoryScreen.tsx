// src/screens/PointsHistoryScreen.tsx

import * as React from 'react';
import { View, Text, FlatList, PressableProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowUpCircle, ArrowDownCircle, Coins } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from '../components/ui/utils';

// --- Import Converted UI Components ---
import { Header } from '../components/Header'; // <-- FIXED PATH
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/seperator'; // <-- FIXED TYPO (seperator -> separator)

// --- Context Hooks and Types (Assumed to be functional) ---
import { useAuth } from '../context/AuthContext'; 
import { PointsLedgerEntry } from '../types'; 

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);

// --- Dummy Data (Replaces the array in the original file) ---
// Adapting original structure to PointsLedgerEntry (using 'pointsChange' instead of 'points')
const transactions: (PointsLedgerEntry & { type: 'earn' | 'redeem' })[] = [
  { id: '1', userId: 'u1', type: 'earn', description: 'Scanned Plastic Bottle', pointsChange: 15, date: 'Nov 30, 2025 - 10:30 AM', timestamp: new Date('2025-11-30T10:30:00Z') as any, actionType: 'CLASSIFICATION_CORRECT' },
  { id: '2', userId: 'u1', type: 'earn', description: 'Scanned Aluminum Can', pointsChange: 20, date: 'Nov 30, 2025 - 9:15 AM', timestamp: new Date('2025-11-30T09:15:00Z') as any, actionType: 'CLASSIFICATION_CORRECT' },
  { id: '3', userId: 'u1', type: 'redeem', description: 'Coffee Shop Voucher', pointsChange: -200, date: 'Nov 29, 2025 - 8:00 PM', timestamp: new Date('2025-11-29T20:00:00Z') as any, actionType: 'REWARD_REDEMPTION' },
  { id: '4', userId: 'u1', type: 'earn', description: 'Scanned Paper', pointsChange: 10, date: 'Nov 29, 2025 - 5:20 PM', timestamp: new Date('2025-11-29T17:20:00Z') as any, actionType: 'CLASSIFICATION_CORRECT' },
  { id: '5', userId: 'u1', type: 'redeem', description: 'Eco Tote Bag', pointsChange: -250, date: 'Nov 27, 2025 - 6:45 PM', timestamp: new Date('2025-11-27T18:45:00Z') as any, actionType: 'REWARD_REDEMPTION' },
];

// --- Helper Functions ---
const totalEarned = transactions
  .filter(t => t.type === 'earn')
  .reduce((sum, t) => sum + t.pointsChange, 0);
  
const totalRedeemed = Math.abs(
  transactions
    .filter(t => t.type === 'redeem')
    .reduce((sum, t) => sum + t.pointsChange, 0)
);

const TransactionItem = React.memo(({ transaction }: { transaction: typeof transactions[0] }) => {
    const isEarn = transaction.type === 'earn';
    
    // Conditional styling based on transaction type
    const color = isEarn ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400';
    const bgColor = isEarn ? 'bg-green-100 dark:bg-green-800/50' : 'bg-orange-100 dark:bg-orange-800/50';
    const Icon = isEarn ? ArrowUpCircle : ArrowDownCircle;

    const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400';
    
    return (
        <Card className="p-4">
            <StyledView className="flex flex-row items-center gap-4">
                
                {/* Icon and Background */}
                <StyledView className={cn("w-10 h-10 rounded-full flex items-center justify-center", bgColor)}>
                    <Icon size={20} className={color} />
                </StyledView>
                
                {/* Description and Date */}
                <StyledView className="flex-1">
                    <StyledText className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">{transaction.description}</StyledText>
                    <StyledText className={cn("text-sm", ON_SURFACE_VARIANT)}>
                        {transaction.date}
                    </StyledText>
                </StyledView>
                
                {/* Points Change */}
                <StyledView className={cn("font-medium", color)}>
                    <StyledText className="text-lg font-semibold text-inherit">
                        {isEarn ? '+' : ''}
                        {Math.abs(transaction.pointsChange)}
                    </StyledText>
                </StyledView>
            </StyledView>
        </Card>
    );
});


/**
 * @function PointsHistoryScreen
 * @description Displays the user's history of points earned and redeemed.
 */
export function PointsHistoryScreen() {
    const navigation = useNavigation();
    const { profile } = useAuth();

    // Map CSS variables to NativeWind classes
    const BACKGROUND_COLOR = 'bg-gray-50 dark:bg-gray-900';
    
    // Summary Card Accent Colors
    const EARN_COLOR = 'text-green-600 dark:text-green-400';
    const REDEEM_COLOR = 'text-orange-600 dark:text-orange-400';
    const EARN_BG_GRADIENT = 'bg-gradient-to-br from-green-100 to-green-50'; // Mapping web gradient
    const REDEEM_BG_GRADIENT = 'bg-gradient-to-br from-orange-100 to-orange-50'; // Mapping web gradient

    return (
        <StyledView className="flex-1" style={{ backgroundColor: BACKGROUND_COLOR }}>
            <Header
                onBack={navigation.goBack}
                title="Points History"
            />

            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
                ItemSeparatorComponent={() => <StyledView className="h-3" />}
                
                ListHeaderComponent={() => (
                    <StyledView className="mb-6 space-y-6">
                        
                        {/* Summary Cards */}
                        <StyledView className="flex flex-row gap-4">
                            
                            {/* Earned Card */}
                            <Card className={cn("flex-1 p-4", EARN_BG_GRADIENT)}>
                                <StyledView className="text-center">
                                    <ArrowUpCircle size={32} className={cn("mx-auto mb-2", EARN_COLOR)} />
                                    <StyledText className={cn("text-sm mb-1 text-green-800 dark:text-green-200")}>Earned</StyledText>
                                    <StyledView className="flex flex-row items-center justify-center gap-1">
                                        <Coins size={20} className={EARN_COLOR} />
                                        <StyledText className={cn("text-xl font-bold", EARN_COLOR)}>{totalEarned}</StyledText>
                                    </StyledView>
                                </StyledView>
                            </Card>

                            {/* Redeemed Card */}
                            <Card className={cn("flex-1 p-4", REDEEM_BG_GRADIENT)}>
                                <StyledView className="text-center">
                                    <ArrowDownCircle size={32} className={cn("mx-auto mb-2", REDEEM_COLOR)} />
                                    <StyledText className={cn("text-sm mb-1 text-orange-800 dark:text-orange-200")}>Redeemed</StyledText>
                                    <StyledView className="flex flex-row items-center justify-center gap-1">
                                        <Coins size={20} className={REDEEM_COLOR} />
                                        <StyledText className={cn("text-xl font-bold", REDEEM_COLOR)}>{totalRedeemed}</StyledText>
                                    </StyledView>
                                </StyledView>
                            </Card>
                        </StyledView>

                        {/* Section Header */}
                        <StyledText className="text-xl font-semibold text-gray-900 dark:text-gray-100">All Transactions</StyledText>
                        <Separator className="bg-gray-200 dark:bg-gray-700 mx-0 mb-4" />
                        
                    </StyledView>
                )}
                renderItem={({ item }) => <TransactionItem transaction={item} />}
                ListEmptyComponent={() => (
                    <StyledText className="text-center text-gray-500 mt-12">
                        No points transactions yet. Start recycling to earn!
                    </StyledText>
                )}
            />
        </StyledView>
    );
}