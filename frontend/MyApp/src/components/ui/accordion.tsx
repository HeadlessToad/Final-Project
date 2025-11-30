// src/components/ui/accordion.tsx

import * as React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { styled } from "nativewind";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  FadeInUp,
  FadeOutDown
} from 'react-native-reanimated';
import { cn } from "./utils"; // Assuming cn is in the same directory

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledAnimatedView = styled(Animated.View);

// --- Context for State Management ---
interface AccordionContextValue {
  activeValue: string | null;
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple'; // For single (default) or multiple open items
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

const useAccordionContext = () => {
  const context = React.useContext(AccordionContext);
  if (context === undefined) {
    throw new Error('Accordion components must be used within <Accordion>');
  }
  return context;
};

// --- Accordion Root Component ---
interface AccordionProps extends React.ComponentProps<typeof View> {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
}

/**
 * @function Accordion
 * @description Root component for the Accordion structure, managing state (open/closed items).
 */
export function Accordion({
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | string[]>(
    defaultValue ?? (type === 'single' ? '' : [])
  );

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const toggleItem = React.useCallback((itemValue: string) => {
    let newValue: string | string[];

    if (type === 'single') {
      newValue = activeValue === itemValue ? '' : itemValue;
    } else { // multiple
      const currentValues = Array.isArray(activeValue) ? activeValue : [];
      if (currentValues.includes(itemValue)) {
        newValue = currentValues.filter((v) => v !== itemValue);
      } else {
        newValue = [...currentValues, itemValue];
      }
    }
    
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }

    // Call external change handler
    if (onValueChange) {
      onValueChange(newValue as string | string[]);
    }

  }, [activeValue, type, isControlled, onValueChange]);

  const contextValue: AccordionContextValue = React.useMemo(() => ({
    activeValue: type === 'single' ? (activeValue as string) : null,
    toggleItem,
    type,
  }), [activeValue, toggleItem, type]);

  return (
    <AccordionContext.Provider value={contextValue}>
      <StyledView className={cn("w-full", className)} {...props}>
        {children}
      </StyledView>
    </AccordionContext.Provider>
  );
}

// --- AccordionItem Component ---
interface AccordionItemProps extends React.ComponentProps<typeof View> {
  value: string; // Unique identifier for the item
  className?: string;
}

/**
 * @function AccordionItem
 * @description Wrapper for each collapsible section.
 */
export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  const context = useAccordionContext();
  const isSelected = context.type === 'single' 
    ? context.activeValue === value 
    : (context.activeValue as string[]).includes(value);

  return (
    <AccordionItemStateContext.Provider value={{ value, isSelected }}>
      <StyledView 
        // Applying the web border-b last:border-b-0 style with NativeWind classes
        className={cn("border-b border-gray-200 dark:border-gray-700", className)} 
        {...props}
      >
        {children}
      </StyledView>
    </AccordionItemStateContext.Provider>
  );
}

// --- Accordion Trigger Component ---
interface AccordionTriggerProps extends React.ComponentProps<typeof Pressable> {
  className?: string;
  children: React.ReactNode;
}

interface AccordionItemState {
    value: string;
    isSelected: boolean;
}

const AccordionItemStateContext = React.createContext<AccordionItemState | undefined>(undefined);
const useAccordionItemState = () => {
    const context = React.useContext(AccordionItemStateContext);
    if (!context) {
        throw new Error('AccordionTrigger/Content must be used within <AccordionItem>');
    }
    return context;
}

/**
 * @function AccordionTrigger
 * @description Button that toggles the collapse state of the AccordionItem.
 */
export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  const { toggleItem } = useAccordionContext();
  const { value, isSelected } = useAccordionItemState();

  // Animated rotation for the icon
  const rotation = useSharedValue(isSelected ? 180 : 0);
  
  React.useEffect(() => {
    rotation.value = withTiming(isSelected ? 180 : 0, { duration: 200 });
  }, [isSelected, rotation]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <StyledPressable
      // Equivalent of Radix Header/Trigger combined
      onPress={() => toggleItem(value)}
      className={cn(
        "flex flex-row flex-1 items-start justify-between gap-4 py-4 text-sm font-medium transition-all",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 outline-none", // focus styles
        className
      )}
      {...props}
    >
        <StyledText className="text-base text-gray-900 dark:text-gray-100">{children}</StyledText>
        <Animated.View style={animatedIconStyle}>
            <ChevronDown 
              className="text-gray-500 dark:text-gray-400 size-5 shrink-0" // Using NativeWind classes on icon
            />
        </Animated.View>
    </StyledPressable>
  );
}

// --- Accordion Content Component ---
interface AccordionContentProps extends React.ComponentProps<typeof View> {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function AccordionContent
 * @description Collapsible content area, using Reanimated for smooth height transitions.
 */
export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const { isSelected } = useAccordionItemState();

  return (
    // Conditional rendering with Reanimated Layout
    // FadeInUp/FadeOutDown provide a simple, common collapse effect.
    // For a true height transition, you would need to measure the content height, 
    // but this gives a cleaner visual effect that is easier to implement.
    isSelected ? (
      <StyledAnimatedView 
        className={cn("pb-4", className)} 
        entering={FadeInUp.duration(300)} 
        exiting={FadeOutDown.duration(300)}
        {...props}
      >
        <StyledView className="py-2">{children}</StyledView>
      </StyledAnimatedView>
    ) : null
  );
}

// --- Export the components ---
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

// Combined export
export { Accordion };