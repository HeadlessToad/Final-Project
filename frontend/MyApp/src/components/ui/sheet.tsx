// src/components/ui/sheet.tsx

import * as React from "react";
import { View, Text, Modal, Pressable, Dimensions, ViewProps, PressableProps, TextProps } from "react-native";
import { X } from "lucide-react-native";
import { styled } from "nativewind";
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideInLeft,
  SlideInUp,
  SlideInDown,
  SlideOutRight,
  SlideOutLeft,
  SlideOutUp,
  SlideOutDown,
} from "react-native-reanimated";
import { cn } from "./utils";

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledAnimatedView = styled(Animated.View);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_WIDTH = SCREEN_WIDTH * 0.8; // 80% width (mimics w-3/4 sm:max-w-sm)

// --- Context for State Management ---
interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  side: "top" | "right" | "bottom" | "left";
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined);
const useSheetContext = () => {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error('Sheet components must be used within <Sheet />');
  }
  return context;
};

// --- 1. Sheet Root Component (Manages Modal State) ---
interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * @function Sheet
 * @description The root component, managing the open/closed state of the Modal.
 */
export function Sheet({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [side, setSide] = React.useState<"top" | "right" | "bottom" | "left">('right'); // Default side

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

  const contextValue: SheetContextValue = React.useMemo(() => ({ open, setOpen, side }), [open, setOpen, side]);

  return (
    <SheetContext.Provider value={contextValue}>
      {children}
    </SheetContext.Provider>
  );
}

// --- 2. SheetTrigger, Close, Portal (Simple Wrappers) ---

export function SheetTrigger({ children, ...props }: PressableProps) {
  const { setOpen, open } = useSheetContext();
  return (
    <StyledPressable data-slot="sheet-trigger" onPress={() => setOpen(true)} {...props}>
      {children}
    </StyledPressable>
  );
}

export function SheetClose({ children, ...props }: PressableProps) {
  const { setOpen } = useSheetContext();
  return (
    <StyledPressable data-slot="sheet-close" onPress={() => setOpen(false)} {...props}>
      {children}
    </StyledPressable>
  );
}

export function SheetPortal({ children }: { children: React.ReactNode }) {
  const { open } = useSheetContext();
  return (
    <Modal visible={open} transparent animationType="none" statusBarTranslucent>
      {children}
    </Modal>
  );
}

// --- 3. SheetOverlay ---
export function SheetOverlay({ className, ...props }: ViewProps) {
  const { setOpen } = useSheetContext();

  return (
    <StyledAnimatedView
      data-slot="sheet-overlay"
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      {...props}
    >
      <StyledPressable onPress={() => setOpen(false)} className="flex-1" />
    </StyledAnimatedView>
  );
}

// --- 4. SheetContent (The Sliding Panel) ---
interface SheetContentProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left"; // Allows overriding default right
}

/**
 * @function SheetContent
 * @description The animated panel content that slides in from the specified side.
 */
export function SheetContent({ className, children, side = "right", ...props }: SheetContentProps) {
  const { setOpen } = useSheetContext();

  // Determine the Reanimated slide effect based on the side prop
  const slideAnimation = React.useMemo(() => {
    switch (side) {
      case 'right':
        return { entering: SlideInRight, exiting: SlideOutRight, style: { width: SHEET_WIDTH, height: '100%', right: 0, top: 0, bottom: 0, borderLeftWidth: 1 } };
      case 'left':
        return { entering: SlideInLeft, exiting: SlideOutLeft, style: { width: SHEET_WIDTH, height: '100%', left: 0, top: 0, bottom: 0, borderRightWidth: 1 } };
      case 'top':
        return { entering: SlideInUp, exiting: SlideOutUp, style: { width: '100%', height: 'auto', top: 0, left: 0, right: 0, borderBottomWidth: 1 } };
      case 'bottom':
        return { entering: SlideInDown, exiting: SlideOutDown, style: { width: '100%', height: 'auto', bottom: 0, left: 0, right: 0, borderTopWidth: 1 } };
    }
  }, [side]);

  return (
    <SheetPortal>
      <SheetOverlay />
      
      {/* Container that captures the screen space but applies no styling */}
      <StyledView className="fixed inset-0 z-50"> 
        <StyledAnimatedView
          data-slot="sheet-content"
          className={cn(
            // Base styling: white bg, flex column, border
            "bg-white dark:bg-gray-800 absolute flex flex-col gap-4 shadow-lg border-gray-200 dark:border-gray-700",
            className,
          )}
          style={slideAnimation.style}
          entering={slideAnimation.entering.duration(300)}
          exiting={slideAnimation.exiting.duration(300)}
          {...props}
        >
          {children}
          
          {/* Close Button (X icon) */}
          <SheetClose className="absolute top-4 right-4 z-10 p-1">
            <X size={18} className="text-gray-500 dark:text-gray-400" />
          </SheetClose>
        </StyledAnimatedView>
      </StyledView>
    </SheetPortal>
  );
}

// --- 5. Sheet Header & Footer (View Wrappers) ---
interface SheetDivProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

export function SheetHeader({ className, children, ...props }: SheetDivProps) {
  return (
    <StyledView
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    >
      {children}
    </StyledView>
  );
}

export function SheetFooter({ className, children, ...props }: SheetDivProps) {
  return (
    <StyledView
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4 border-t border-gray-200 dark:border-gray-700", className)}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- 6. Sheet Title & Description (Text Components) ---
interface SheetTextProps extends TextProps {
  className?: string;
  children: React.ReactNode;
}

export function SheetTitle({ className, children, ...props }: SheetTextProps) {
  return (
    <StyledText
      data-slot="sheet-title"
      className={cn("text-lg font-semibold text-gray-900 dark:text-gray-100", className)}
      {...props}
    >
      {children}
    </StyledText>
  );
}

export function SheetDescription({ className, children, ...props }: SheetTextProps) {
  return (
    <StyledText
      data-slot="sheet-description"
      className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
      {...props}
    >
      {children}
    </StyledText>
  );
}

// --- Final Export ---
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};