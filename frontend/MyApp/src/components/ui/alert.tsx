// src/components/ui/alert.tsx

import * as React from "react";
import { View, Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { styled } from "nativewind";
import { cn } from "./utils"; // Assuming utils.ts with cn is available

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);

// Define the core Alert styles using cva
const alertVariants = cva(
  // Base classes: relative, full width, rounded border, padding, text size
  "relative w-full rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        // Default (Information/Standard)
        default: "bg-white border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200",
        // Destructive (Error/Warning) - Uses red colors
        destructive:
          "border-red-500 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// --- Alert Root Component ---

// We define a new interface because React Native components don't have the standard HTML 'div' props.
interface AlertProps extends React.ComponentProps<typeof View>, VariantProps<typeof alertVariants> {
  className?: string;
  icon?: React.ReactNode; // Prop to accept an optional icon (e.g., from lucide-react-native)
}

/**
 * @function Alert
 * @description The main container for an Alert message. Uses Flexbox to manage icon and content.
 */
export function Alert({
  className,
  variant,
  icon,
  children,
  ...props
}: AlertProps) {
  // Use a Flex container to manage the layout (mimics the CSS Grid structure)
  return (
    <StyledView
      role="alert"
      className={cn(
        alertVariants({ variant }), 
        // Flexbox container for the entire alert
        "flex flex-row items-start gap-x-3", 
        className
      )}
      {...props}
    >
      {/* 1. Icon Slot (col-start-1 equivalent) */}
      {icon && (
        <StyledView className={variant === 'destructive' ? "text-red-500 dark:text-red-300" : "text-gray-500 dark:text-gray-400"}>
          {/* Ensure the icon renders with the required size */}
          {icon} 
        </StyledView>
      )}

      {/* 2. Content Slot (Title and Description, col-start-2 equivalent) */}
      <StyledView className="flex flex-1 flex-col gap-y-0.5">
        {children}
      </StyledView>
    </StyledView>
  );
}

// --- Alert Title Component ---
interface AlertTitleProps extends React.ComponentProps<typeof Text> {
  className?: string;
}

/**
 * @function AlertTitle
 * @description The primary heading for the alert.
 */
export function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <StyledText
      className={cn(
        // The original classes, adapted for RN Text component
        "line-clamp-1 min-h-4 font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

// --- Alert Description Component ---
interface AlertDescriptionProps extends React.ComponentProps<typeof View> {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function AlertDescription
 * @description The detailed message content.
 */
export function AlertDescription({
  className,
  children,
  ...props
}: AlertDescriptionProps) {
  return (
    <StyledView
      className={cn(
        // Flexbox to manage internal content alignment
        "justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- Export the components ---
export { Alert, AlertTitle, AlertDescription, alertVariants };

// --- Usage Example ---
/*
import { AlertCircle, Trash } from 'lucide-react-native';

<Alert variant="destructive" icon={<AlertCircle size={20} />}>
  <AlertTitle>Hazardous Waste Detected!</AlertTitle>
  <AlertDescription>
    Please do not throw batteries in the regular trash. Use the "Find Recycling Center" 
    feature to locate a special drop-off point near you.
  </AlertDescription>
</Alert>
*/