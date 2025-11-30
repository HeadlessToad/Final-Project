// src/components/ui/radio-group.tsx

import * as React from "react";
import { View, Pressable, Text, ViewProps, PressableProps, TextProps } from "react-native";
import { Circle } from "lucide-react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

// --- Context for State Management ---
interface RadioGroupContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined);

const useRadioGroup = () => {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroup components must be used within <RadioGroup />");
  }
  return context;
};

// --- 1. RadioGroup Root Component (State Manager) ---

interface RadioGroupProps extends ViewProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * @function RadioGroup
 * @description The root component managing the single selected value state.
 */
export function RadioGroup({
  value: controlledValue,
  onValueChange,
  defaultValue,
  disabled = false,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>(defaultValue);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  }, [controlledValue, onValueChange]);

  const contextValue: RadioGroupContextValue = React.useMemo(() => ({
    value,
    onValueChange: handleValueChange,
    disabled,
  }), [value, handleValueChange, disabled]);

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <StyledView
        data-slot="radio-group"
        // Web 'grid gap-3' translates to Flex column with gap
        className={cn("flex flex-col gap-3", className)}
        {...props}
      >
        {children}
      </StyledView>
    </RadioGroupContext.Provider>
  );
}

// --- 2. RadioGroupItem (The Radio Button) ---

interface RadioGroupItemProps extends PressableProps {
  value: string;
  className?: string;
  // Item text/label is not part of the Item component but its parent wrapper
}

/**
 * @function RadioGroupItem
 * @description The clickable radio button circle element.
 */
export function RadioGroupItem({
  value,
  className,
  children, // Expected to be the internal indicator or custom content
  ...props
}: RadioGroupItemProps) {
  const { value: selectedValue, onValueChange, disabled: groupDisabled } = useRadioGroup();
  const isSelected = selectedValue === value;
  const isDisabled = groupDisabled || props.disabled;

  const handlePress = () => {
    if (!isDisabled) {
      onValueChange(value);
    }
  };

  // Dynamic classes based on state
  const selectedClasses = isSelected
    ? "border-blue-600 ring-4 ring-blue-600/50" // text-primary, focus-visible:ring-ring
    : "border-gray-300 dark:border-gray-600"; // border-input

  const disabledClasses = isDisabled ? "opacity-50" : "";

  return (
    <StyledPressable
      data-slot="radio-group-item"
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      onPress={handlePress}
      disabled={isDisabled}
      className={cn(
        // Base styling: aspect-square, size, rounded-full, border, shadow
        "aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-opacity flex items-center justify-center",
        selectedClasses,
        disabledClasses,
        className,
      )}
      {...props}
    >
      {/* Indicator Slot */}
      {isSelected && (
        <RadioGroupIndicator />
      )}
      {children}
    </StyledPressable>
  );
}

// --- 3. RadioGroupIndicator (The inner filled circle) ---
function RadioGroupIndicator() {
  // Uses absolute positioning to center the small circle inside the Pressable area
  return (
    <StyledView
      data-slot="radio-group-indicator"
      className="relative flex items-center justify-center"
    >
      {/* CircleIcon size is typically half the item size for a good indicator */}
      <Circle 
        size={8} 
        // fill-primary equivalent (primary color)
        className="fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400" 
      />
    </StyledView>
  );
}

// --- Combined Export ---
// Note: We often wrap the RadioGroupItem with the Text Label in the consuming component
export { RadioGroup, RadioGroupItem };