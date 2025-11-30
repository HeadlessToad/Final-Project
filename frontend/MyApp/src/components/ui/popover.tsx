// src/components/ui/popover.tsx

import * as React from "react";
import { View, Pressable, Modal, Dimensions, ViewProps, PressableProps } from "react-native";
import { styled } from "nativewind";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";
import { cn } from "./utils";

// --- Styled Components ---
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
const StyledAnimatedView = styled(Animated.View);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Context for State Management ---
interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<View>;
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined);
const usePopover = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within <Popover />");
  }
  return context;
};

// --- 1. Popover Root Component (Manages Modal State) ---
interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * @function Popover
 * @description The root component, managing the press-activated popover state.
 */
export function Popover({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
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
    <PopoverContext.Provider value={contextValue}>
      {children}
    </PopoverContext.Provider>
  );
}

// --- 2. PopoverTrigger (Press Handler) ---
interface PopoverTriggerProps extends PressableProps {
  children: React.ReactNode;
}

/**
 * @function PopoverTrigger
 * @description The element that is pressed to toggle the popover open.
 */
export function PopoverTrigger({ children, ...props }: PopoverTriggerProps) {
  const { setOpen, open, triggerRef } = usePopover();

  return (
    <StyledPressable
      data-slot="popover-trigger"
      onPress={() => setOpen(!open)}
      ref={triggerRef as any} // Attach ref to track position
      {...props}
    >
      {children}
    </StyledPressable>
  );
}

// --- 3. PopoverContent (The Floating Card) ---
interface PopoverContentProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  align?: 'center' | 'end'; 
  sideOffset?: number; 
  // Anchor is omitted, as the trigger ref serves as the anchor
}

/**
 * @function PopoverContent
 * @description The modal and content wrapper for the displayed information, positioned relative to the trigger.
 */
export function PopoverContent({ className, children, sideOffset = 8, align = 'center', ...props }: PopoverContentProps) {
  const { open, setOpen, triggerRef } = usePopover();
  const [contentPosition, setContentPosition] = React.useState<ViewProps['style']>({});
  const CONTENT_WIDTH = 288; // Fixed w-72 size (288px)

  // Effect to calculate position based on the trigger's location
  React.useEffect(() => {
    if (open && triggerRef.current) {
      // Use measureInWindow to get the absolute position on screen
      triggerRef.current.measureInWindow((x, y, width, height) => {
        let top = y + height + sideOffset; // Default: below the trigger
        let left = x + (width / 2) - (CONTENT_WIDTH / 2); // Default: centered horizontally
        
        // Horizontal Clamping/Alignment
        if (align === 'end') {
          // Align right edge of popover with right edge of trigger
          left = x + width - CONTENT_WIDTH;
        }
        
        // Ensure content is not off-screen (Clamping)
        left = Math.max(8, Math.min(left, SCREEN_WIDTH - CONTENT_WIDTH - 8));
        top = Math.min(top, SCREEN_HEIGHT - 30); // Ensure it doesn't clip the bottom

        setContentPosition({ top, left, position: 'absolute' });
      });
    }
  }, [open, sideOffset, align]);
  
  // No need for a separate Portal component in RN, the Modal handles that.

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
      {/* Overlay: Closes when tapping outside the content */}
      <StyledPressable onPress={() => setOpen(false)} className="flex-1 bg-transparent" />
      
      {/* Animated Content */}
      <StyledAnimatedView
        data-slot="popover-content"
        className={cn(
          // Styling: white bg, rounded border, shadow, fixed width (w-72)
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 shadow-md w-72 z-50",
          className,
        )}
        style={contentPosition}
        // Reanimated for fade/zoom animation (mimics data-[state=open])
        entering={FadeIn.duration(150).withInitialValues({ opacity: 0, transform: [{ scale: 0.95 }] }).then(ZoomIn.springify())}
        exiting={FadeOut.duration(150).withInitialValues({ transform: [{ scale: 0.95 }] }).then(ZoomOut.springify())}
        {...props}
      >
        {children}
      </StyledAnimatedView>
    </Modal>
  );
}

// --- 4. PopoverAnchor (Omitted) ---
// This is not necessary as the Trigger's ref is used directly for positioning.

// --- Final Export ---
export { Popover, PopoverTrigger, PopoverContent };