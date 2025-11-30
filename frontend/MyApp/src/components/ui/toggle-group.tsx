// src/components/ui/toggle-group.tsx

import * as React from "react";
import { View, Pressable, Text, ViewProps, PressableProps, ScrollView } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils";
import { toggleVariants, ToggleVariants } from "./toggle"; // Import the CVA and types

// --- Styled Components ---
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

// --- Context for Shared Variants and State ---
interface ToggleGroupContextValue extends ToggleVariants {
  type: 'single' | 'multiple';
  // State management functions exposed to items
  value: string | string[];
  onValueChange: (newValue: string | string[]) => void;
}

// We initially create the context with default variant/size props
const ToggleGroupContext = React.createContext<ToggleGroupContextValue | undefined>(undefined);

function useToggleGroup() {
    const context = React.useContext(ToggleGroupContext);
    if (!context) {
        throw new Error("ToggleGroupItem must be used within <ToggleGroup />");
    }
    return context;
}

// --- 1. ToggleGroup Root Component (State Manager) ---

interface ToggleGroupProps extends ViewProps, ToggleVariants {
  type?: 'single' | 'multiple'; // Added type prop for selection behavior
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  defaultValue?: string | string[];
  children: React.ReactNode;
}

/**
 * @function ToggleGroup
 * @description Manages the selection state and propagates shared variants (size/variant) to items.
 */
export function ToggleGroup({
  className,
  variant = 'default',
  size = 'default',
  type = 'single',
  value: controlledValue,
  onValueChange,
  defaultValue,
  children,
  ...props
}: ToggleGroupProps) {
  
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | string[]>(
    defaultValue ?? (type === 'single' ? '' : [])
  );

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  
  const handleValueChange = React.useCallback((newValue: string) => {
    let finalValue: string | string[];

    if (type === 'single') {
        finalValue = newValue;
    } else { // 'multiple'
        const currentValues = Array.isArray(value) ? value : [];
        if (currentValues.includes(newValue)) {
            finalValue = currentValues.filter((v) => v !== newValue);
        } else {
            finalValue = [...currentValues, newValue];
        }
    }

    if (!isControlled) {
        setUncontrolledValue(finalValue);
    }
    onValueChange?.(finalValue);
  }, [value, type, isControlled, onValueChange]);
  
  const contextValue: ToggleGroupContextValue = React.useMemo(() => ({
    variant,
    size,
    type,
    value,
    onValueChange: handleValueChange,
  }), [variant, size, type, value, handleValueChange]);

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <StyledView
        data-slot="toggle-group"
        className={cn(
          "flex flex-row w-fit items-center rounded-md",
          variant === 'outline' && "shadow-xs border border-gray-300 dark:border-gray-700", // Outline border
          className,
        )}
        {...props}
      >
        {/* We use ScrollView to ensure groups can scroll horizontally on small screens */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row' }}>
          {children}
        </ScrollView>
      </StyledView>
    </ToggleGroupContext.Provider>
  );
}

// --- 2. ToggleGroupItem (Individual Button) ---

interface ToggleGroupItemProps extends PressableProps, ToggleVariants {
  value: string; // The unique key for the item
  children: React.ReactNode;
}

/**
 * @function ToggleGroupItem
 * @description A pressable button within the group that shares the group's style and handles selection state.
 */
export function ToggleGroupItem({
  className,
  children,
  variant: itemVariant,
  size: itemSize,
  value,
  ...props
}: ToggleGroupItemProps) {
  const context = useToggleGroup();
  
  const finalVariant = context.variant || itemVariant;
  const finalSize = context.size || itemSize;
  
  const isActive = context.type === 'single' 
    ? context.value === value 
    : Array.isArray(context.value) && context.value.includes(value);

  // Apply state=on styles manually
  const stateOnClasses = isActive ? "bg-gray-200 dark:bg-gray-700" : "";
  const stateOnTextClasses = isActive ? "font-medium text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-300";

  return (
    <StyledPressable
      data-slot="toggle-group-item"
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={() => context.onValueChange(value)}
      // Styling is derived from toggleVariants CVA
      className={({ pressed }) => cn(
        toggleVariants({
          variant: finalVariant,
          size: finalSize,
        }),
        "min-w-0 flex-1 shrink-0 rounded-none first:rounded-l-md last:rounded-r-md active:z-10 disabled:opacity-50",
        
        // Custom classes to simulate Radix/Tailwind logic
        stateOnClasses,
        pressed && "opacity-80",
        finalVariant === 'outline' && "border-l-0 first:border-l border-gray-300 dark:border-gray-700",
        
        className,
      )}
      {...props}
    >
      <StyledText className={cn("text-sm", stateOnTextClasses)}>{children}</StyledText>
    </StyledPressable>
  );
}

// --- Final Export ---
export { ToggleGroup, ToggleGroupItem };