// src/components/ui/avatar.tsx

import * as React from "react";
import { View, Image, ImageProps, StyleProp, ViewStyle, ImageStyle } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledImage = styled(Image);

// --- Avatar Root Component ---
interface AvatarProps extends React.ComponentProps<typeof View> {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function Avatar
 * @description The root container for a user avatar. It enforces the circular shape and fixed size.
 * (Corresponds to Radix's AvatarPrimitive.Root)
 */
export function Avatar({
  className,
  children,
  ...props
}: AvatarProps) {
  return (
    <StyledView
      className={cn(
        // The original classes, adapted for RN View: fixed size, shrink-0, overflow-hidden, rounded-full
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- Avatar Image Component ---
// We extend ImageProps but make source optional for handling in the consuming component
interface AvatarImageProps extends Omit<ImageProps, 'style' | 'source'> {
  // We use the same prop name as RN but use a string for the URI
  source: string | ImageProps['source'];
  className?: string;
}

/**
 * @function AvatarImage
 * @description Displays the user's profile image.
 * (Corresponds to Radix's AvatarPrimitive.Image)
 */
export function AvatarImage({
  source,
  className,
  ...props
}: AvatarImageProps) {
  // Ensure source is in the correct format for RN Image
  const imageSource = typeof source === 'string' ? { uri: source } : source;
  
  return (
    <StyledImage
      // The original classes, adapted for RN Image: aspect-square, size-full
      className={cn("aspect-square size-full", className)}
      source={imageSource}
      resizeMode="cover" // Ensure the image covers the circle
      {...props}
    />
  );
}

// --- Avatar Fallback Component ---
interface AvatarFallbackProps extends React.ComponentProps<typeof View> {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function AvatarFallback
 * @description Renders content (e.g., initials or an icon) when the image fails to load 
 * or is not provided.
 * (Corresponds to Radix's AvatarPrimitive.Fallback)
 */
export function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <StyledView
      className={cn(
        // The original classes, adapted for RN View: bg-muted, flex, size-full, centered content
        "bg-gray-200 dark:bg-gray-700 flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- Combined Export ---
export { Avatar, AvatarImage, AvatarFallback };

// --- Usage Example ---
/*
import { User } from 'lucide-react-native';
import { Text } from 'react-native';

<Avatar className="size-16">
  {user.profilePhotoUrl ? (
    <AvatarImage source={user.profilePhotoUrl} />
  ) : (
    <AvatarFallback>
      <Text className="text-xl font-semibold text-gray-700">
        {user.initials || <User size={24} color="#555" />}
      </Text>
    </AvatarFallback>
  )}
</Avatar>
*/