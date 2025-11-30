// src/screens/RewardDetailsScreen.tsx

import * as React from 'react';
import { View, Text, ScrollView, Image, Alert, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Coins, CheckCircle } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from '../components/ui/utils';

import { Header } from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AspectRatio } from '../components/ui/aspect-ratio';

import { useAuth } from '../context/AuthContext';
import { Reward } from '../types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledImage = styled(Image);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const dummyReward: Reward & { description: string, image: string } = {
  id: '1',
  name: 'Eco Coffee Shop Voucher',
  description: 'Redeem for a free reusable coffee cup and 50% off your first drink.',
  costPoints: 500,
  inventoryCount: 150,
  image: 'https://via.placeholder.com/600x600/34D399/FFFFFF?text=Coffee+Voucher',
};

export function RewardDetailsScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();

  const route = useRoute();
  const reward = (route.params as { reward: Reward })?.reward || dummyReward;

  const [redeemed, setRedeemed] = React.useState(false);

  const currentPoints = profile?.points ?? 0;
  const canAfford = currentPoints >= reward.costPoints;

  const handleRedeem = () => {
    if (!canAfford) {
      Alert.alert("Cannot Redeem", `You need ${reward.costPoints - currentPoints} more points.`);
      return;
    }

    setRedeemed(true);
    Alert.alert("Success", "Reward redeemed!");
  };

  const PRIMARY_COLOR = 'text-green-600 dark:text-green-400';
  const PRIMARY_BG = 'bg-green-600 dark:bg-green-700';
  const PRIMARY_LIGHT_BG = 'bg-green-100 dark:bg-green-800/50';
  const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400';
  const ERROR_COLOR = 'text-red-500 dark:text-red-400';
  const SURFACE_VARIANT_BG = 'bg-gray-200 dark:bg-gray-700';

  return (
    <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header onBack={navigation.goBack} title="Reward Details" />

      <StyledScrollView contentContainerStyle={{ paddingBottom: 64 }}>
        {!redeemed ? (
          <>
            {/* IMAGE */}
            <StyledView className={cn(`w-full overflow-hidden`, SURFACE_VARIANT_BG)}>
              <AspectRatio ratio="1">
                <StyledImage
                  source={{ uri: reward.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </AspectRatio>
            </StyledView>

            <StyledView className="px-6 py-6 space-y-6">
              {/* TITLE */}
              <StyledView>
                <StyledText className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                  {reward.name}
                </StyledText>

                <StyledView className="flex flex-row items-center gap-2 mb-4">
                  <Coins size={24} className={PRIMARY_COLOR} />
                  <StyledText className={cn("text-2xl font-bold", PRIMARY_COLOR)}>
                    {reward.costPoints} Points
                  </StyledText>
                </StyledView>

                <StyledText className={ON_SURFACE_VARIANT}>
                  {reward.description}
                </StyledText>
              </StyledView>

              {/* POINTS CARD */}
              <Card className={SURFACE_VARIANT_BG}>
                <StyledView className="flex flex-row items-center justify-between">
                  <StyledText className={ON_SURFACE_VARIANT}>Your Current Points</StyledText>
                  <StyledView className="flex flex-row items-center gap-2">
                    <Coins size={20} className={PRIMARY_COLOR} />
                    <StyledText className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {currentPoints}
                    </StyledText>
                  </StyledView>
                </StyledView>
              </Card>

              {/* TERMS */}
              <Card>
                <StyledText className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  Terms & Conditions
                </StyledText>

                <StyledView className="space-y-2 text-sm">
                  {[
                    'Reward is non-transferable',
                    'Valid for 30 days',
                    'Cannot be exchanged for cash',
                    'Subject to availability',
                  ].map((term, i) => (
                    <StyledText key={i} className={ON_SURFACE_VARIANT}>
                      • {term}
                    </StyledText>
                  ))}
                </StyledView>
              </Card>

              {/* REDEEM BUTTON */}
              <StyledView className="pt-4 space-y-2">
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={handleRedeem}
                  disabled={!canAfford}
                >
                  {canAfford ? "Redeem Now" : "Not Enough Points"}
                </Button>

                {!canAfford && (
                  <StyledText className={cn("text-center text-sm", ERROR_COLOR)}>
                    You need {reward.costPoints - currentPoints} more points.
                  </StyledText>
                )}
              </StyledView>
            </StyledView>
          </>
        ) : (
          <>
            {/* SUCCESS UI */}
            <StyledView className="flex items-center justify-center py-20 px-6">
              <CheckCircle size={84} className="text-green-500 mb-6" />

              <StyledText className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Redeemed!
              </StyledText>

              <StyledText className="text-center mt-3 text-gray-600 dark:text-gray-300">
                Your reward has been successfully redeemed.  
                Check your email for instructions.
              </StyledText>

              <Button
                fullWidth
                size="large"
                className="mt-10"
                onPress={() => navigation.goBack()}
              >
                Back to Rewards
              </Button>
            </StyledView>
          </>
        )}
      </StyledScrollView>
    </StyledView>
  );
}
