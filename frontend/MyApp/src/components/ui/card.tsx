// src/components/ui/card.tsx

import * as React from "react";
import { View, Text, StyleProp, ViewStyle, TextStyle } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);

// --- 1. Card Root Component ---
interface CardProps extends React.ComponentProps<typeof View> {
  className?: string;
}

/**
 * @function Card
 * @description A flexible container used to group related content, often with borders and shadow.
 */
export function Card({ className, children, ...props }: CardProps) {
  return (
    <StyledView
      data-slot="card"
      className={cn(
        // Base classes: bg, text color, flex column layout, gap, rounded border
        "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex flex-col gap-y-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- 2. Card Header Component ---
interface CardHeaderProps extends React.ComponentProps<typeof View> {
  className?: string;
}

/**
 * @function CardHeader
 * @description Container for CardTitle, CardDescription, and CardAction. 
 * Uses Flexbox to manage the alignment of the action item.
 */
export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <StyledView
      data-slot="card-header"
      className={cn(
        // Flex row to enable Title/Description on one side and Action on the other
        "flex flex-row justify-between items-start gap-x-4 px-6 pt-6",
        className,
      )}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- 3. Card Title Component ---
interface CardTitleProps extends React.ComponentProps<typeof Text> {
  className?: string;
}

/**
 * @function CardTitle
 * @description The main heading of the card content.
 */
export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <StyledText
      data-slot="card-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    >
      {children}
    </StyledText>
  );
}

// --- 4. Card Description Component ---
interface CardDescriptionProps extends React.ComponentProps<typeof Text> {
  className?: string;
}

/**
 * @function CardDescription
 * @description Secondary text providing context for the card content.
 */
export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <StyledText
      data-slot="card-description"
      className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    >
      {children}
    </StyledText>
  );
}

// --- 5. Card Action Component ---
interface CardActionProps extends React.ComponentProps<typeof View> {
  className?: string;
}

/**
 * @function CardAction
 * @description Container for an action element (like a button or icon) placed in the corner of the header.
 */
export function CardAction({ className, children, ...props }: CardActionProps) {
  return (
    <StyledView
      data-slot="card-action"
      // In this Flexbox structure, CardAction simply sits as a sibling to the Title/Description View.
      // No complex grid/column logic needed here; its placement is handled by the parent CardHeader.
      className={cn("self-start", className)}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- 6. Card Content Component ---
interface CardContentProps extends React.ComponentProps<typeof View> {
  className?: string;
}

/**
 * @function CardContent
 * @description The main body area of the card, with internal padding.
 */
export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <StyledView
      data-slot="card-content"
      // Removed the web-specific: [&:last-child]:pb-6
      className={cn("px-6 pb-4", className)} 
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- 7. Card Footer Component ---
interface CardFooterProps extends React.ComponentProps<typeof View> {
  className?: string;
}

/**
 * @function CardFooter
 * @description The bottom section of the card, used for secondary actions or information.
 */
export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <StyledView
      data-slot="card-footer"
      // Removed the web-specific: [.border-t]:pt-6
      className={cn("flex items-center px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700", className)}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- Export the components ---
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};