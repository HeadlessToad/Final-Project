// src/components/ui/hover-card.tsx

import * as React from "react";
import { View, Text, Pressable, Modal, ViewProps, PressableProps, Dimensions } from "react-native";
import { styled } from "nativewind";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";
import { cn } from "./utils";

// --- Styled Components ---
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
const StyledAnimatedView = styled(Animated.View);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Context for State Management ---
interface HoverCardContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<View>;
}

const HoverCardContext = React.createContext<HoverCardContextValue | undefined>(undefined);
const useHoverCard = () => {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error("HoverCard components must be used within <HoverCard />");
  }
  return context;
};

// --- 1. HoverCard Root Component (Manages Modal State) ---
interface HoverCardProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * @function HoverCard
 * @description The root component, adapted to manage the press-activated popover state.
 */
export function HoverCard({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: HoverCardProps) {
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
    <HoverCardContext.Provider value={contextValue}>
      {children}
    </HoverCardContext.Provider>
  );
}

// --- 2. HoverCardTrigger (Press Handler) ---
interface HoverCardTriggerProps extends PressableProps {
  children: React.ReactNode;
}

/**
 * @function HoverCardTrigger
 * @description The element that is pressed to toggle the popover/card open.
 */
export function HoverCardTrigger({ children, ...props }: HoverCardTriggerProps) {
  const { setOpen, open, triggerRef } = useHoverCard();

  return (
    <StyledPressable
      data-slot="hover-card-trigger"
      onPress={() => setOpen(!open)}
      ref={triggerRef as any} // Attach ref to track position
      {...props}
    >
      {children}
    </StyledPressable>
  );
}

// --- 3. HoverCardContent (The Floating Card) ---
interface HoverCardContentProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  // align and sideOffset are typically complex in RN; we simplify to center/bottom
  align?: 'center' | 'end'; 
  sideOffset?: number; 
}

/**
 * @function HoverCardContent
 * @description The modal and content wrapper for the displayed information.
 */
export function HoverCardContent({ className, children, sideOffset = 8, ...props }: HoverCardContentProps) {
  const { open, setOpen, triggerRef } = useHoverCard();
  const [contentPosition, setContentPosition] = React.useState<ViewProps['style']>({});

  // Effect to calculate position based on the trigger's location
  React.useEffect(() => {
    if (open && triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        // Simple heuristic: display card below the trigger and centered horizontally
        let top = y + height + sideOffset;
        let left = x + (width / 2) - (256 / 2); // 256 is the fixed w-64 size
        
        // Clamp to screen edges
        left = Math.max(8, Math.min(left, SCREEN_WIDTH - 256 - 8));
        top = Math.min(top, SCREEN_HEIGHT - 300); // Prevent going off bottom

        setContentPosition({ top, left });
      });
    }
  }, [open, sideOffset]);
  

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
      {/* Overlay: Closes when tapping outside the content */}
      <StyledPressable onPress={() => setOpen(false)} className="flex-1 bg-transparent" />
      
      {/* Animated Content */}
      <StyledAnimatedView
        data-slot="hover-card-content"
        className={cn(
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 shadow-md w-64 z-50",
          className,
        )}
        style={contentPosition}
        // Reanimated for fade/zoom animation
        entering={FadeIn.duration(150).withInitialValues({ opacity: 0, transform: [{ scale: 0.95 }] }).then(ZoomIn.springify())}
        exiting={FadeOut.duration(150).withInitialValues({ transform: [{ scale: 0.95 }] }).then(ZoomOut.springify())}
        {...props}
      >
        {children}
      </StyledAnimatedView>
    </Modal>
  );
}

// --- Final Export ---
export { HoverCard, HoverCardTrigger, HoverCardContent };