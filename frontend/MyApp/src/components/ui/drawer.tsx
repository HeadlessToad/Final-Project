// src/components/ui/drawer.tsx

import * as React from "react";
import { View, Text, Modal, Pressable, PressableProps, ViewProps, TextProps } from "react-native";
import BottomSheet, { 
  BottomSheetView, 
  BottomSheetBackdrop, 
  BottomSheetModal, 
  BottomSheetModalProvider 
} from '@gorhom/bottom-sheet';
import { styled } from "nativewind";
import { cn } from "./utils";

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// --- Context for State Management (Simplified to control the BottomSheetModal) ---
interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  // Modal reference for closing via imperative handle
  modalRef: React.RefObject<BottomSheetModal>;
}

const DrawerContext = React.createContext<DrawerContextValue | undefined>(undefined);
const useDrawerContext = () => {
  const context = React.useContext(DrawerContext);
  if (context === undefined) {
    throw new Error('Drawer components must be used within <Drawer />');
  }
  return context;
};

// --- 1. Drawer Root Component (Provider for BottomSheetModalProvider) ---
interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * @function Drawer
 * @description The root component, wrapping the application with the BottomSheetModalProvider.
 */
export function Drawer({ open: controlledOpen, onOpenChange, children }: DrawerProps) {
  // We use BottomSheetModalProvider at the root of the app, so this component 
  // primarily acts as a wrapper for state logic if needed, but often relies on 
  // the consumer to manage `open` state via ref/ModalProvider.
  
  // For simplicity, we just render children here, but typically you would use
  // BottomSheetModalProvider at the absolute root of the app.
  return <>{children}</>;
}


// --- 2. DrawerTrigger (Button to Open Modal) ---
interface DrawerTriggerProps extends PressableProps {
  children: React.ReactNode;
  modalRef: React.RefObject<BottomSheetModal>; // Requires passing the ref from the parent
}

/**
 * @function DrawerTrigger
 * @description Renders a pressable component that opens the Drawer.
 */
export function DrawerTrigger({ children, modalRef, ...props }: DrawerTriggerProps) {
  return (
    <StyledPressable 
      data-slot="drawer-trigger" 
      onPress={() => modalRef.current?.present()} 
      {...props}
    >
      {children}
    </StyledPressable>
  );
}

// --- 3. DrawerContent (The Actual Sheet/Modal) ---
interface DrawerContentProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  // Props specific to BottomSheetModal
  modalRef: React.RefObject<BottomSheetModal>;
  snapPoints: (string | number)[];
  onClose?: () => void;
}

/**
 * @function DrawerContent
 * @description The draggable content area, replacing DrawerPortal and DrawerOverlay internally.
 */
export function DrawerContent({ 
  className, 
  children, 
  modalRef,
  snapPoints,
  onClose,
  ...props 
}: DrawerContentProps) {
  
  // Custom Backdrop component to match the styling of vaul's overlay
  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5} // Corresponds to bg-black/50
        style={{ backgroundColor: 'black', ...props.style }}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#ccc' }} // Muted color for the grabber
      onDismiss={onClose}
    >
      <BottomSheetView 
        // We use BottomSheetView instead of BottomSheetContent for standard content
        data-slot="drawer-content"
        className={cn(
          "flex h-auto flex-col bg-white dark:bg-gray-800",
          "rounded-t-lg border-t border-gray-200 dark:border-gray-700", // Default bottom drawer styling
          className,
        )}
        {...props}
      >
        {/* Manually render the grabber handle (thumb) */}
        <StyledView className="bg-gray-300 dark:bg-gray-600 mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full" />

        {children}
        
      </BottomSheet