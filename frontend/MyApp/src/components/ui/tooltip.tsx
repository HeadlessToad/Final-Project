// src/components/ui/tooltip.tsx

import * as React from "react";
import { View, Text, Pressable, Modal, Dimensions, ViewProps, PressableProps, TextProps } from "react-native";
import { styled } from "nativewind";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";
import { cn } from "./utils";

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledAnimatedView = styled(Animated.View);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Context for State Management ---
interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<View>;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);
const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within <Tooltip />");
  }
  return context;
};

// --- 1. TooltipProvider (Required in Radix, optional wrapper in RN) ---
interface TooltipProviderProps extends ViewProps {
    delayDuration?: number; // Kept for API consistency
    children: React.ReactNode;
}

/**
 * @function TooltipProvider
 * @description In RN, this is primarily a wrapper, as the core Provider is integrated into Tooltip Root.
 */
export function TooltipProvider({ delayDuration = 0, children, ...props }: TooltipProviderProps) {
    // In React Native, the Provider logic is often merged into the main Tooltip root,
    // or this acts as a simple container. We render children directly.
    return <StyledView {...props}>{children}</StyledView>;
}

// --- 2. Tooltip Root Component (Manages Modal State) ---
interface TooltipRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * @function Tooltip
 * @description The root component, managing the long-press activated popover state.
 */
export function Tooltip({
  open: controlledOpen,
  onOpenChange,
  children,
}: TooltipRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const triggerRef = React.useRef<View>(null);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [controlledOpen, onOpenChange]
  );

  const contextValue = React.useMemo(() => ({ open, setOpen, triggerRef }), [open, setOpen]);

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  );
}

// --- 3. TooltipTrigger (Long Press Handler) ---
interface TooltipTriggerProps extends PressableProps {
  children: React.ReactNode;
}

/**
 * @function TooltipTrigger
 * @description The element that is long-pressed to show the tooltip.
 */
export function TooltipTrigger({ children, onLongPress, ...props }: TooltipTriggerProps) {
  const { setOpen, open, triggerRef } = useTooltip();
  
  const handleLongPress = (event: any) => {
    // Open the tooltip on long press
    setOpen(true);
    onLongPress?.(event);
    
    // Auto-close after a short delay (e.g., 2.5 seconds)
    setTimeout(() => setOpen(false), 2500); 
  };

  return (
    <StyledPressable
      data-slot="tooltip-trigger"
      // Use onLongPress for mobile hover emulation
      onLongPress={handleLongPress} 
      onPressOut={() => setOpen(false)} // Close if press is released quickly
      ref={triggerRef as any}
      {...props}
    >
      {children}
    </StyledPressable>
  );
}


// --- 4. TooltipContent (The Floating Content) ---
interface TooltipContentProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  sideOffset?: number; 
  side?: 'top' | 'bottom'; // Simplify to common mobile positions
}

/**
 * @function TooltipContent
 * @description The modal and content wrapper for the displayed tooltip text.
 */
export function TooltipContent({ className, children, sideOffset = 8, side = 'top', ...props }: TooltipContentProps) {
  const { open, setOpen, triggerRef } = useTooltip();
  const [contentPosition, setContentPosition] = React.useState<ViewProps['style']>({});
  
  // Effect to calculate position based on the trigger's location
  React.useEffect(() => {
    if (open && triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        // Calculate tooltip position (fixed width for consistency, e.g., 180px)
        const TOOLTIP_WIDTH = 180;
        const top = side === 'top' ? y - sideOffset : y + height + sideOffset;
        let left = x + (width / 2) - (TOOLTIP_WIDTH / 2); // Center horizontally
        
        // Clamp left position to screen edges
        left = Math.max(8, Math.min(left, SCREEN_WIDTH - TOOLTIP_WIDTH - 8));
        
        // Final position applied
        setContentPosition({ 
            top: side === 'top' ? top - 30 : top, // Adjust top further for arrow/padding
            left: left, 
            position: 'absolute' 
        });
      });
    }
  }, [open, sideOffset, side]);

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
      {/* Invisible overlay to dismiss the tooltip on tap */}
      <StyledPressable onPress={() => setOpen(false)} className="flex-1 bg-transparent" />
      
      <StyledAnimatedView
        data-slot="tooltip-content"
        className={cn(
          // Styling: primary bg, white text, rounded, padding
          "bg-blue-600 dark:bg-blue-700 text-white rounded-md px-3 py-1.5 text-xs z-50 w-[180px]",
          className,
        )}
        style={contentPosition}
        // Reanimated for fade/zoom animation (mimics data-[state=open])
        entering={FadeIn.duration(150).withInitialValues({ opacity: 0, transform: [{ scale: 0.95 }] }).then(ZoomIn.springify())}
        exiting={FadeOut.duration(150).withInitialValues({ transform: [{ scale: 0.95 }] }).then(ZoomOut.springify())}
        {...props}
      >
        <StyledText className="text-white text-xs">{children}</StyledText>
        
        {/* Tooltip Arrow (Simplified visual using a View triangle) */}
        <StyledView
            className={cn("absolute z-50", side === 'top' ? "bottom-[-7px]" : "top-[-7px]")}
            style={{ 
                // Center the arrow visually (half of the tooltip width minus arrow width)
                left: (180 / 2) - 5, 
                width: 10, 
                height: 10,
                // Create a triangle using borders
                borderLeftWidth: 5,
                borderRightWidth: 5,
                borderBottomWidth: side === 'top' ? 0 : 5,
                borderTopWidth: side === 'top' ? 5 : 0,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: side === 'top' ? 'transparent' : 'rgba(59, 130, 246, 1)', // White/primary color
                borderBottomColor: side === 'top' ? 'rgba(59, 130, 246, 1)' : 'transparent', // White/primary color
            }}
        />
      </StyledAnimatedView>
    </Modal>
  );
}

// --- Final Export ---
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };