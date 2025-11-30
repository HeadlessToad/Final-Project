// src/components/ui/alert-dialog.tsx

import * as React from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { styled } from "nativewind";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";
import { cn } from "./utils";
import { buttonVariants } from "./button"; // Import the placeholder/real button utility

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledAnimatedView = styled(Animated.View);

// --- Context for State Management ---
interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | undefined>(undefined);

const useAlertDialogContext = () => {
  const context = React.useContext(AlertDialogContext);
  if (context === undefined) {
    throw new Error('AlertDialog components must be used within <AlertDialog>');
  }
  return context;
};

// --- AlertDialog Root Component (Manages Modal State) ---
interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * @function AlertDialog
 * @description The root component, managing the open/closed state of the native Modal.
 */
export function AlertDialog({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

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

  const contextValue = React.useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <AlertDialogContext.Provider value={contextValue}>
      {children}
    </AlertDialogContext.Provider>
  );
}

// --- AlertDialogTrigger (Button to Open Modal) ---
interface AlertDialogTriggerProps extends React.ComponentProps<typeof StyledPressable> {
  children: React.ReactNode;
}

/**
 * @function AlertDialogTrigger
 * @description Renders a pressable component that opens the Alert Dialog.
 */
export function AlertDialogTrigger({ children, ...props }: AlertDialogTriggerProps) {
  const { setOpen } = useAlertDialogContext();
  return (
    <StyledPressable onPress={() => setOpen(true)} {...props}>
      {children}
    </StyledPressable>
  );
}

// --- AlertDialogPortal & Overlay (The Modal and Background) ---
/**
 * @function AlertDialogPortal
 * @description In RN, this is mainly for structure. We return the Modal directly.
 */
export function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  const { open } = useAlertDialogContext();
  
  // Use RN Modal for screen-level rendering
  return (
    <Modal
      visible={open}
      transparent
      animationType="none" // Reanimated will handle animation
      statusBarTranslucent // To ensure it covers the status bar
    >
      {children}
    </Modal>
  );
}

/**
 * @function AlertDialogOverlay
 * @description The semi-transparent background that appears behind the dialog.
 */
export function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof View>) {
  const { setOpen } = useAlertDialogContext();

  return (
    <StyledAnimatedView
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      // Use Reanimated for fade-in/out
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      {...props}
    >
      {/* Optional: Close on tapping overlay, but often restricted for Alert Dialogs */}
      <StyledPressable onPress={() => setOpen(false)} className="flex-1" />
    </StyledAnimatedView>
  );
}

// --- AlertDialogContent (The Dialog Box) ---
interface AlertDialogContentProps extends React.ComponentProps<typeof View> {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function AlertDialogContent
 * @description The container for the dialog's content, positioned in the center.
 */
export function AlertDialogContent({ className, children, ...props }: AlertDialogContentProps) {
  const { setOpen } = useAlertDialogContext();
  
  // The content is rendered inside the Portal (Modal) and Overlay
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      
      {/* Container to center the dialog on screen */}
      <StyledView className="fixed inset-0 z-50 items-center justify-center">
        <StyledAnimatedView
          className={cn(
            // RN layout to mimic web positioning (centered, fixed width)
            "z-50 w-full max-w-sm gap-4 rounded-lg border p-6 shadow-lg bg-white dark:bg-gray-800",
            className
          )}
          // Reanimated for fade/zoom animation
          entering={FadeIn.duration(200).withInitialValues({ opacity: 0, transform: [{ scale: 0.95 }] }).then(ZoomIn.springify())}
          exiting={FadeOut.duration(200).withInitialValues({ transform: [{ scale: 0.95 }] }).then(ZoomOut.springify())}
          {...props}
        >
          {children}
        </StyledAnimatedView>
      </StyledView>
    </AlertDialogPortal>
  );
}

// --- AlertDialogHeader & Footer ---
interface AlertDialogDivProps extends React.ComponentProps<typeof View> {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function AlertDialogHeader
 * @description Container for the Title and Description.
 */
export function AlertDialogHeader({ className, children, ...props }: AlertDialogDivProps) {
  return (
    <StyledView
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    >
      {children}
    </StyledView>
  );
}

/**
 * @function AlertDialogFooter
 * @description Container for the Action and Cancel buttons (usually stacked).
 */
export function AlertDialogFooter({ className, children, ...props }: AlertDialogDivProps) {
  return (
    <StyledView
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4", // Added mt-4 for separation
        className
      )}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- AlertDialog Title & Description (Text Components) ---
interface AlertDialogTextProps extends React.ComponentProps<typeof Text> {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function AlertDialogTitle
 * @description The main heading of the dialog.
 */
export function AlertDialogTitle({ className, children, ...props }: AlertDialogTextProps) {
  return (
    <StyledText
      className={cn("text-lg font-semibold", className)}
      {...props}
    >
      {children}
    </StyledText>
  );
}

/**
 * @function AlertDialogDescription
 * @description The detailed message or prompt.
 */
export function AlertDialogDescription({ className, children, ...props }: AlertDialogTextProps) {
  return (
    <StyledText
      className={cn("text-muted-foreground text-sm text-gray-600 dark:text-gray-400", className)}
      {...props}
    >
      {children}
    </StyledText>
  );
}

// --- AlertDialog Action Buttons (Pressable Components) ---
interface AlertDialogButtonProps extends React.ComponentProps<typeof Pressable> {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function AlertDialogAction
 * @description The primary action button (e.g., "Confirm Redemption").
 */
export function AlertDialogAction({ className, children, ...props }: AlertDialogButtonProps) {
  const { setOpen } = useAlertDialogContext();
  
  return (
    <StyledPressable
      className={cn(buttonVariants({ variant: "default" }), className)}
      onPress={() => {
        setOpen(false); // Close modal on action
        props.onPress?.(); // Execute original onPress handler
      }}
      {...props}
    >
      <StyledText className="text-white font-semibold">{children}</StyledText>
    </StyledPressable>
  );
}

/**
 * @function AlertDialogCancel
 * @description The secondary action button (e.g., "Cancel").
 */
export function AlertDialogCancel({ className, children, ...props }: AlertDialogButtonProps) {
  const { setOpen } = useAlertDialogContext();

  return (
    <StyledPressable
      className={cn(buttonVariants({ variant: "outline" }), className)}
      onPress={() => {
        setOpen(false); // Close modal on cancel
        props.onPress?.(); // Execute original onPress handler
      }}
      {...props}
    >
      <StyledText className="text-gray-900 dark:text-gray-100 font-semibold">{children}</StyledText>
    </StyledPressable>
  );
}

// --- Combined Export ---
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay, // Can be used standalone if needed
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};