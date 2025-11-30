// src/components/ui/select.tsx

import * as React from "react";
import { View, Text, Pressable, Modal, ViewProps, PressableProps, TextProps, ScrollView } from "react-native";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { styled } from "nativewind";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { cn } from "./utils";

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);

// --- Context for State Management ---
interface SelectContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);
const useSelect = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within <Select />");
  }
  return context;
};

// --- 1. Select Root Component (State Manager) ---
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * @function Select
 * @description The root component, managing the selected value and open/closed state.
 */
export function Select({
  value: controlledValue,
  onValueChange,
  defaultValue,
  open: controlledOpen,
  onOpenChange,
  children,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>(defaultValue);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const handleValueChange = React.useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  }, [controlledValue, onValueChange]);

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  const contextValue: SelectContextValue = React.useMemo(() => ({
    value,
    onValueChange: handleValueChange,
    open,
    setOpen: handleOpenChange,
  }), [value, handleValueChange, open, handleOpenChange]);

  return (
    <SelectContext.Provider value={contextValue}>
      {children}
    </SelectContext.Provider>
  );
}

// --- 2. SelectTrigger ---
interface SelectTriggerProps extends PressableProps {
  className?: string;
  size?: "sm" | "default";
  children: React.ReactNode;
}

/**
 * @function SelectTrigger
 * @description The button that displays the current value and opens the menu.
 */
export function SelectTrigger({ className, size = "default", children, ...props }: SelectTriggerProps) {
  const { open, setOpen } = useSelect();
  
  // Dynamic height based on size
  const sizeClasses = size === 'default' ? "h-12" : "h-10"; // Adapted for better mobile tap target
  
  return (
    <StyledPressable
      data-slot="select-trigger"
      onPress={() => setOpen(!open)}
      className={cn(
        // Base styling: flex row, border, background, padding, rounded, justify-between
        "flex w-full items-center justify-between gap-2 rounded-md border bg-gray-100 dark:bg-gray-800 px-3 py-2 text-base",
        "border-gray-300 dark:border-gray-700",
        sizeClasses,
        className,
      )}
      {...props}
    >
      {/* SelectValue (Children containing the current value) */}
      <StyledView className="flex flex-row flex-1 items-center gap-2">
        {children}
      </StyledView>
      
      {/* Icon (ChevronDownIcon) */}
      <StyledView className="shrink-0 opacity-50">
        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
      </StyledView>
    </StyledPressable>
  );
}

// --- 3. SelectValue ---
interface SelectValueProps extends TextProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function SelectValue
 * @description Displays the currently selected item's label.
 */
export function SelectValue({ className, children, ...props }: SelectValueProps) {
  // SelectValue is rendered inside SelectTrigger as a Text component
  return (
    <StyledText 
      data-slot="select-value"
      className={cn("line-clamp-1 text-gray-900 dark:text-gray-100", className)} 
      numberOfLines={1}
      {...props}
    >
      {children}
    </StyledText>
  );
}


// --- 4. SelectContent (The Modal/Sheet) ---
interface SelectContentProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function SelectContent
 * @description The modal that displays the selectable items, positioned as a bottom sheet.
 */
export function SelectContent({ className, children, ...props }: SelectContentProps) {
  const { open, setOpen } = useSelect();

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
      {/* Overlay */}
      <StyledPressable onPress={() => setOpen(false)} className="flex-1 bg-black/50">
        <Animated.View 
          className="w-full h-full"
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        />
      </StyledPressable>
      
      {/* Menu Content (Bottom Sheet Position) */}
      <StyledAnimatedView
        data-slot="select-content"
        className={cn(
          // Styling: white bg, rounded top corners, shadow
          "absolute bottom-0 left-0 right-0 z-50 rounded-t-lg border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-md max-h-1/2",
          className
        )}
        // Slide-in/out from the bottom (mimics data-[side=bottom])
        entering={FadeIn.duration(200).withInitialValues({ transform: [{ translateY: 300 }] })}
        exiting={FadeOut.duration(200).withInitialValues({ transform: [{ translateY: 300 }] })}
        {...props}
      >
        <SelectScrollUpButton /> {/* Placeholder for mobile scroll indicator */}
        
        {/* SelectPrimitive.Viewport is replaced by ScrollView */}
        <StyledScrollView 
          className="p-1 w-full max-h-full"
          showsVerticalScrollIndicator={false}
        >
          {/* SelectGroup (Children) */}
          {children}
        </StyledScrollView>

        <SelectScrollDownButton /> {/* Placeholder */}
      </StyledAnimatedView>
    </Modal>
  );
}

// --- 5. SelectItem (Clickable Option) ---
interface SelectItemProps extends PressableProps {
  className?: string;
  children: React.ReactNode;
  value: string; // Required to set the value
}

/**
 * @function SelectItem
 * @description A clickable option item within the selection list