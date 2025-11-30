// src/components/ui/dropdown-menu.tsx

import * as React from "react";
import { View, Text, Pressable, Modal, ViewProps, PressableProps, ScrollView } from "react-native";
import { Check, ChevronRight, Circle } from "lucide-react-native";
import { styled } from "nativewind";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { cn } from "./utils";

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);

// --- Context for State Management ---
interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  // State for Checkbox/Radio items to manage controlled usage
  radioValue?: string;
  onRadioValueChange?: (value: string) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);
const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within <DropdownMenu />");
  }
  return context;
};

// --- 1. DropdownMenu Root Component ---
interface DropdownMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  radioValue?: string;
  onRadioValueChange?: (value: string) => void;
  children: React.ReactNode;
}

/**
 * @function DropdownMenu
 * @description Manages the open/closed state and radio selection state.
 */
export function DropdownMenu({ 
  open: controlledOpen, 
  onOpenChange, 
  radioValue, 
  onRadioValueChange,
  children 
}: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  const contextValue: DropdownMenuContextValue = React.useMemo(() => ({
    open,
    setOpen,
    radioValue,
    onRadioValueChange,
  }), [open, setOpen, radioValue, onRadioValueChange]);

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

// --- 2. DropdownMenuTrigger ---
interface DropdownMenuTriggerProps extends PressableProps {
  children: React.ReactNode;
}

/**
 * @function DropdownMenuTrigger
 * @description The button that opens the menu.
 */
export function DropdownMenuTrigger({ children, ...props }: DropdownMenuTriggerProps) {
  const { setOpen, open } = useDropdownMenu();
  return (
    <StyledPressable 
      data-slot="dropdown-menu-trigger" 
      onPress={() => setOpen(!open)} 
      {...props}
    >
      {children}
    </StyledPressable>
  );
}

// --- 3. DropdownMenuContent (The Modal/Sheet) ---
interface DropdownMenuContentProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function DropdownMenuContent
 * @description The modal that displays the menu items, positioned typically at the bottom.
 */
export function DropdownMenuContent({ className, children, ...props }: DropdownMenuContentProps) {
  const { open, setOpen } = useDropdownMenu();

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
      {/* Overlay (Handles fade and closes on tap) */}
      <StyledPressable onPress={() => setOpen(false)} className="flex-1 bg-black/50">
        <Animated.View 
          className="w-full h-full"
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        />
      </StyledPressable>
      
      {/* Menu Content (Positioned at the bottom for mobile UX) */}
      <StyledAnimatedView
        data-slot="dropdown-menu-content"
        className={cn(
          // Bottom sheet/popover look: white bg, rounded top corners, shadow
          "absolute bottom-0 left-0 right-0 z-50 rounded-t-lg border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-md max-h-1/2",
          className
        )}
        // Simple slide-in/out from the bottom
        entering={FadeIn.duration(200).withInitialValues({ transform: [{ translateY: 300 }] })}
        exiting={FadeOut.duration(200).withInitialValues({ transform: [{ translateY: 300 }] })}
        {...props}
      >
        <StyledScrollView 
            showsVerticalScrollIndicator={false}
            className="w-full max-h-full"
            contentContainerStyle={{ paddingVertical: 4 }}
        >
            {children}
        </StyledScrollView>
      </StyledAnimatedView>
    </Modal>
  );
}

// --- 4. DropdownMenuItem (Actionable Item) ---
interface DropdownMenuItemProps extends PressableProps {
  className?: string;
  inset?: boolean;
  variant?: "default" | "destructive";
  children: React.ReactNode;
}

/**
 * @function DropdownMenuItem
 * @description A clickable option in the menu.
 */
export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  children,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu();
  
  const handlePress = (e: any) => {
    setOpen(false); // Close menu on item press
    props.onPress?.(e);
  };
  
  const textClass = variant === 'destructive' 
    ? "text-red-500 dark:text-red-400" 
    : "text-gray-800 dark:text-gray-100";

  return (
    <StyledPressable
      data-slot="dropdown-menu-item"
      onPress={handlePress}
      className={({ pressed }) => cn(
        "relative flex flex-row items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none",
        pressed && "bg-gray-100 dark:bg-gray-700", // Focus/Hover/Active State
        inset && "pl-8", // Mimic data-[inset]
        className,
      )}
      {...props}
    >
      <StyledText className={cn("flex-1", textClass)}>{children}</StyledText>
    </StyledPressable>
  );
}

// --- 5. DropdownMenuCheckboxItem ---
interface DropdownMenuCheckboxItemProps extends PressableProps {
  className?: string;
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * @function DropdownMenuCheckboxItem
 * @description A selectable item with a checkmark indicator.
 */
export function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const { setOpen } = useDropdownMenu();

  const handlePress = (e: any) => {
    setOpen(false); // Close menu on item press
    onCheckedChange?.(!checked); // Toggle state
    props.onPress?.(e);
  };
  
  return (
    <StyledPressable
      data-slot="dropdown-menu-checkbox-item"
      onPress={handlePress}
      className={({ pressed }) => cn(
        "relative flex flex-row items-center gap-2 rounded-sm py-2 pr-2 pl-8 text-sm outline-none",
        pressed && "bg-gray-100 dark:bg-gray-700",
        className,
      )}
      {...props}
    >
      {/* Indicator position (absolute left-2) */}
      <StyledView className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <Check size={14} className="text-gray-900 dark:text-gray-100" />}
      </StyledView>
      
      <StyledText className="text-gray-800 dark:text-gray-100 flex-1">{children}</StyledText>
    </StyledPressable>
  );
}

// --- 6. DropdownMenuRadioItem ---
interface DropdownMenuRadioItemProps extends PressableProps {
  className?: string;
  children: React.ReactNode;
  value: string;
}

/**
 * @function DropdownMenuRadioItem
 * @description A radio selectable item.
 */
export function DropdownMenuRadioItem({
  className,
  children,
  value,
  ...props
}: DropdownMenuRadioItemProps) {
  const { setOpen, radioValue, onRadioValueChange } = useDropdownMenu();
  const isSelected = radioValue === value;

  const handlePress = (e: any) => {
    setOpen(false); // Close menu on item press
    onRadioValueChange?.(value);
    props.onPress?.(e);
  };

  return (
    <StyledPressable
      data-slot="dropdown-menu-radio-item"
      onPress={handlePress}
      className={({ pressed }) => cn(
        "relative flex flex-row items-center gap-2 rounded-sm py-2 pr-2 pl-8 text-sm outline-none",
        pressed && "bg-gray-100 dark:bg-gray-700",
        className,
      )}
      {...props}
    >
      {/* Indicator position (absolute left-2) */}
      <StyledView className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {isSelected && <Circle size={8} className="fill-gray-900 text-gray-900 dark:fill-gray-100 dark:text-gray-100" />}
      </StyledView>
      
      <StyledText className="text-gray-800 dark:text-gray-100 flex-1">{children}</StyledText>
    </StyledPressable>
  );
}

// --- 7. Placeholder for Group/Separator/Label ---
export function DropdownMenuGroup(props: ViewProps) { return <StyledView {...props} />; }
export function DropdownMenuLabel({ className, inset, ...props }: ViewProps & { inset?: boolean }) { 
    return (
        <StyledText className={cn("px-2 py-1.5 text-xs font-semibold text-gray-500", inset && "pl-8", className)} {...props} />
    ); 
}
export function DropdownMenuSeparator({ className, ...props }: ViewProps) { 
    return (
        <StyledView className={cn("bg-gray-200 dark:bg-gray-700 h-px mx-1 my-1", className)} {...props} />
    ); 
}
export function DropdownMenuShortcut({ className, ...props }: TextProps) { 
    return (
        <StyledText className={cn("ml-auto text-xs text-gray-400", className)} {...props} /> 
    ); 
}

// --- Final Export ---
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  // Sub-components are complex and omitted for mobile simplification
};