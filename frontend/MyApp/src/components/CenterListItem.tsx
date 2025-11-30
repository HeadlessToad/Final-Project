
// src/components/CenterListItem.tsx

import * as React from 'react';
import { View, Text, PressableProps } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from './ui/utils';

// --- Import Converted Components ---
import { Card } from './ui/card'; 

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);

// --- Component Props ---
interface CenterListItemProps {
  name: string;
  distance: string;
  wasteTypes: string[];
  address?: string;
  onClick?: PressableProps['onPress'];
}

/**
 * @function CenterListItem
 * @description Renders a single, clickable list item for a recycling center.
 */
export function CenterListItem({ name, distance, wasteTypes, address, onClick }: CenterListItemProps) {
  
  // Custom styles are mapped to specific NativeWind classes:
  const PRIMARY_LIGHT_BG = 'bg-green-100 dark:bg-green-800/50'; // var(--primary-light)
  const PRIMARY_DARK_TEXT = 'text-green-700 dark:text-green-300'; // var(--primary-dark)
  const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400'; // var(--on-surface-variant)
  const SURFACE_VARIANT_BG = 'bg-gray-200 dark:bg-gray-700'; // var(--surface-variant)
  const PRIMARY_TEXT = 'text-green-600 dark:text-green-400'; // var(--primary)

  return (
    <Card onClick={onClick} className="p-0">
      <StyledView className="flex flex-row gap-3 p-4">
        
        {/* Left Icon Circle (MapPin) */}
        <StyledView 
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
            PRIMARY_LIGHT_BG
          )}
        >
          <MapPin size={24} className={PRIMARY_DARK_TEXT} />
        </StyledView>
        
        {/* Right Content */}
        <StyledView className="flex-1">
          
          {/* Name */}
          <StyledText className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
            {name}
          </StyledText>
          
          {/* Address */}
          {address && (
            <StyledText className={cn('text-sm mb-2', ON_SURFACE_VARIANT)}>
              {address}
            </StyledText>
          )}
          
          {/* Waste Type Badges */}
          <StyledView className="flex flex-row flex-wrap gap-2 mb-2">
            {wasteTypes.map((type, index) => (
              <StyledText
                key={index}
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  SURFACE_VARIANT_BG,
                  ON_SURFACE_VARIANT // Badge text color
                )}
              >
                {type}
              </StyledText>
            ))}
          </StyledView>
          
          {/* Distance */}
          <StyledText className={cn('text-sm font-semibold', PRIMARY_TEXT)}>
            {distance}
          </StyledText>
          
        </StyledView>
      </StyledView>
    </Card>
  );
}

// --- Export the component ---
export { CenterListItem };