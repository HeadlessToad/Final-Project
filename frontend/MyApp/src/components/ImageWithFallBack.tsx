// src/components/ImageWithFallback.tsx

import React, { useState } from 'react';
import { View, Image, ImageProps, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { useColorScheme } from 'expo-router'; // Or standard React Native hooks if not using Expo Router
import { styled } from 'nativewind'; // Import NativeWind's styled HOC

/**
 * NativeWind Setup:
 * We need to use `styled(View)` and `styled(Image)` to enable Tailwind/className syntax.
 * Note: If using the `tailwind` prop directly, you don't need the styled HOC, but using `styled`
 * often simplifies things by pre-applying the NativeWind compiler.
 */
const StyledView = styled(View);
const StyledImage = styled(Image);

// SVG for the error fallback image (a simple broken image icon).
// We'll use the original SVG base64 string provided, but wrap it for RN Image source compatibility.
// NOTE: React Native's Image component may struggle with complex base64 SVG directly.
// For a robust solution, we use a simpler standard icon source or an external library like react-native-svg.
// For now, we'll try to load the base64 SVG via RN's image source interface.
const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

// Define the props for the React Native component
// We extend standard ImageProps and remove 'className' which is a web-only prop
// and add 'tailwind' for NativeWind styling.
export interface ImageWithFallbackProps extends Omit<ImageProps, 'style'> {
  // Use 'source' instead of 'src' for RN Image components
  source: ImageProps['source'];
  // Style prop can be ViewStyle or ImageStyle
  style?: StyleProp<ViewStyle | ImageStyle>;
  // Optional NativeWind class string
  className?: string;
  // Fallback icon size
  fallbackSize?: 'sm' | 'md' | 'lg';
}

/**
 * @function ImageWithFallback
 * @description A component that displays an image, falling back to a placeholder icon
 * if the image fails to load.
 * @param {ImageWithFallbackProps} props - The props for the Image component.
 */
export function ImageWithFallback({
  source,
  alt, // RN doesn't use 'alt', we can use it for accessibilityLabel
  style,
  className,
  fallbackSize = 'md',
  ...rest
}: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);
  const colorScheme = useColorScheme();
  
  // Convert web source prop (string URL) to RN ImageSourcePropType
  // For simplicity, we assume 'source' is an object like { uri: '...' } or a require() call.
  const imageSource = typeof source === 'string' ? { uri: source } : source;

  // Handles the image load error event
  const handleError = () => {
    setDidError(true);
  };

  // Determine fallback icon size classes
  const fallbackClass =
    fallbackSize === 'sm' ? 'w-8 h-8' : fallbackSize === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  const bgClass = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';

  if (didError) {
    // === FALLBACK VIEW (equivalent to web <div>) ===
    return (
      <StyledView
        className={`inline-block text-center align-middle justify-center items-center ${bgClass} ${className ?? ''}`}
        style={style}
      >
        <StyledView className={`flex items-center justify-center w-full h-full`}>
          {/* Fallback Image/Icon */}
          <StyledImage
            source={{ uri: ERROR_IMG_SRC }}
            accessibilityLabel={`Error loading image for ${alt ?? 'item'}`}
            // These classes style the SVG icon itself within the View.
            className={fallbackClass} 
            resizeMode="contain"
          />
        </StyledView>
      </StyledView>
    );
  }

  // === REGULAR IMAGE VIEW (equivalent to web <img>) ===
  return (
    <StyledImage
      source={imageSource}
      accessibilityLabel={alt} // Use 'alt' as accessibility label
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  );
}