// src/components/RewardTile.tsx

import * as React from 'react';
import { View, Text, Image, PressableProps } from 'react-native';
import { Coins } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from './ui/utils';

// --- Import Converted Components ---
import { Card } from './ui/card';
import { AspectRatio } from './ui/aspect-ratio'; // Use AspectRatio for square image

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

// --- Component Props ---
interface RewardTileProps {
  image: string; // Image URI
  title: string;
  points: number;
  onClick?: PressableProps['onPress'];
}

/**
 * @function RewardTile
 * @description Renders a single, clickable tile for a reward item.
 */
export function RewardTile({ image, title, points, onClick }: RewardTileProps) {
  
  // Map CSS variables to NativeWind classes:
  const SURFACE_VARIANT_BG = 'bg-gray-200 dark:bg-gray-700'; // var(--surface-variant)
  const PRIMARY_TEXT = 'text-green-600 dark:text-green-400'; // var(--primary)

  return (
    <Card 
      padding="none" 
      onClick={onClick} 
      // Emulate overflow-hidden on the Card wrapper view/pressable
      className="overflow-hidden"
    >
      
      {/* Image Area (Aspect Ratio: Square) */}
      <StyledView className={cn('overflow-hidden', SURFACE_VARIANT_BG)}>
        {/* We use our AspectRatio component to ensure the image container is square */}
        <AspectRatio ratio="1">
          <StyledImage
            source={{ uri: image }}
            alt={title}
            // h-full w-full object-cover is replaced by style and resizeMode
            className="w-full h-full"
            resizeMode="cover"
          />
        </AspectRatio>
      </StyledView>

      {/* Content Area */}
      <StyledView className="p-3">
        
        {/* Title */}
        {/* Note: line-clamp-2 is difficult to achieve perfectly in RN; we use numberOfLines. */}
        <StyledText 
          className="mb-2 text-base font-medium text-gray-900 dark:text-gray-100" 
          numberOfLines={2}
        >
          {title}
        </StyledText>
        
        {/* Points Display */}
        <StyledView className={cn('flex flex-row items-center gap-1', PRIMARY_TEXT)}>
          <Coins size={16} />
          <StyledText className="font-semibold text-inherit">{points}</StyledText>
        </StyledView>
        
      </StyledView>
    </Card>
  );
}

// --- Export the component ---
export { RewardTile };
