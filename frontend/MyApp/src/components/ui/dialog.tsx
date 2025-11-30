// src/components/ui/dialog.tsx

import * as React from "react";
import { View, Text, Modal, Pressable, ViewProps, TextProps, PressableProps } from "react-native";
import { X } from "lucide-react-native"; // XIcon renamed to X in RN version
import { styled } from "nativewind";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";
import { cn } from "./utils";

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledAnimatedView = styled(Animated.View);

// --- Context for State Management ---
interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

const useDialogContext = () => {
  const context = React.useContext(DialogContext);
  if (context === undefined) {
    throw new Error('Dialog components must be used within <Dialog>');
  }
  return context;
};

// --- 1. Dialog Root Component (Manages Modal State) ---
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * @function Dialog
 * @description The root component, managing the open/closed state of the native Modal.
 */
export function Dialog({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: DialogProps) {
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
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

// --- 2. DialogTrigger (Button to Open Modal) ---
interface DialogTriggerProps extends PressableProps {
  children: React.ReactNode;
}

/**
 * @function DialogTrigger
 * @description Renders a pressable component that opens the Dialog.
 */
export function DialogTrigger({ children, ...props }: DialogTriggerProps) {
  const { setOpen } = useDialogContext();
  return (
    <StyledPressable data-slot="dialog-trigger" onPress={() => setOpen(true)} {...props}>
      {children}
    </StyledPressable>
  );
}

// --- 3. DialogPortal & Overlay (The Modal and Background) ---

/**
 * @function DialogPortal
 * @description Renders the contents outside the main component tree via Modal.
 */
export function DialogPortal({ children }: { children: React.ReactNode }) {
  const { open } = useDialogContext();
  
  return (
    <Modal
      visible={open}
      transparent
      animationType="none" // Reanimated handles animation
      statusBarTranslucent
    >
      {children}
    </Modal>
  );
}

/**
 * @function DialogOverlay
 * @description The semi-transparent background that appears behind the dialog.
 */
export function DialogOverlay({ className, ...props }: ViewProps) {
  const { setOpen } = useDialogContext();

  return (
    <StyledAnimatedView
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      {...props}
    >
      {/* Pressable to close modal on tapping overlay */}
      <StyledPressable onPress={() => setOpen(false)} className="flex-1" />
    </StyledAnimatedView>
  );
}

// --- 4. DialogClose (X Button) ---
interface DialogCloseProps extends PressableProps {}

/**
 * @function DialogClose
 * @description A button to close the dialog.
 */
export function DialogClose({ className, children, ...props }: DialogCloseProps) {
  const { setOpen } = useDialogContext();

  return (
    <StyledPressable
      data-slot="dialog-close"
      onPress={() => setOpen(false)}
      className={cn(
        // Styling the X button and wrapper
        "absolute top-4 right-4 rounded-full opacity-70 transition-opacity hover:opacity-100 p-1 z-10",
        className
      )}
      {...props}
    >
      {/* Icon and optional custom children */}
      {children || <X size={16} className="text-gray-500 dark:text-gray-400" />}
      {/* <span className="sr-only">Close</span> is replaced by accessibilityLabel on Pressable */}
    </StyledPressable>
  );
}


// --- 5. DialogContent (The Dialog Box) ---
interface DialogContentProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function DialogContent
 * @description The container for the dialog's content, centered on the screen.
 */
export function DialogContent({ className, children, ...props }: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      
      {/* Container to center the dialog on screen (mimics fixed top-[50%] left-[50%]) */}
      <StyledView className="fixed inset-0 z-50 items-center justify-center">
        <StyledAnimatedView
          data-slot="dialog-content"
          className={cn(
            // RN layout to mimic web positioning (centered, max width)
            "z-50 w-full max-w-md gap-4 rounded-lg border p-6 shadow-lg bg-white dark:bg-gray-800",
            "sm:max-w-lg", // Responsive for tablets/web
            className
          )}
          // Reanimated for fade/zoom animation
          entering={FadeIn.duration(200).withInitialValues({ opacity: 0, transform: [{ scale: 0.95 }] }).then(ZoomIn.springify())}
          exiting={