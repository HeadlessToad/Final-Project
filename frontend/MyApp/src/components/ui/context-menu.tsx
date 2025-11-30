// src/components/ui/context-menu.tsx

import * as React from "react";
import { View, Text, Pressable, Modal, Dimensions, ViewProps, PressableProps } from "react-native";
import { Check, ChevronRight, Circle } from "lucide-react-native";
import { styled } from "nativewind";
import { cn } from "./utils";

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

const SCREEN_HEIGHT = Dimensions.get('window').height;

// --- Context for State and Position ---
interface ContextMenuContextValue {
  open: boolean;
  position: { x: number; y: number };
  setOpen: (open: boolean) => void;
  setPosition: (pos: { x: number; y: number }) => void;
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | undefined>(undefined);
const useContextMenu = () => {
  const context = React.useContext(ContextMenuContext);
  if (!context) {
    throw new Error("ContextMenu components must be used within <ContextMenu />");
  }
  return context;
};

// --- 1. ContextMenu Root Component ---
interface ContextMenuProps extends ViewProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * @function ContextMenu
 * @description Manages the visibility and position state of the menu Modal.
 */
export function ContextMenu({ open: controlledOpen, onOpenChange, children, ...props }: ContextMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const contextValue = React.useMemo(() => ({ open, position, setOpen, setPosition }), [open, position]);

  return (
    <ContextMenuContext.Provider value={contextValue}>
      <StyledView data-slot="context-menu" {...props}>
        {children}
      </StyledView>
    </ContextMenuContext.Provider>
  );
}

// --- 2. ContextMenuTrigger (Long Press Handler) ---
interface ContextMenuTriggerProps extends PressableProps {
  children: React.ReactNode;
}

/**
 * @function ContextMenuTrigger
 * @description Activates the menu on long press and records the press location.
 */
export function ContextMenuTrigger({ children, onLongPress, ...props }: ContextMenuTriggerProps) {
  const { setOpen, setPosition } = useContextMenu();

  const handleLongPress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setPosition({ x: pageX, y: pageY });
    setOpen(true);
    onLongPress?.(event);
  };

  return (
    <StyledPressable
      data-slot="context-menu-trigger"
      onLongPress={handleLongPress}
      {...props}
    >
      {children}
    </StyledPressable>
  );
}

// --- 3. ContextMenuContent (The Floating Menu) ---
interface ContextMenuContentProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function ContextMenuContent
 * @description The modal and content wrapper, positioned based on the long press location.
 */
export function ContextMenuContent({ className, children, ...props }: ContextMenuContentProps) {
  const { open, position, setOpen } = useContextMenu();

  // Simple adjustment: prevent the menu from going off the right/bottom edge
  const contentStyle: ViewStyle = {
    position: 'absolute',
    left: position.x > (SCREEN_WIDTH - 150) ? SCREEN_WIDTH - 150 : position.x,
    top: position.y > (SCREEN_HEIGHT - 250) ? SCREEN_HEIGHT - 250 : position.y,
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      {/* Overlay to close the modal */}
      <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />

      {/* Menu Content */}
      <StyledView
        data-slot="context-menu-content"
        className={cn(
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-1 shadow-md min-w-[8rem] z-50",
          className
        )}
        style={contentStyle}
        {...props}
      >
        {children}
      </StyledView>
    </Modal>
  );
}

// --- 4. ContextMenuItem (Actionable Item) ---
interface ContextMenuItemProps extends PressableProps {
  className?: string;
  inset?: boolean;
  variant?: "default" | "destructive";
  children: React.ReactNode;
}

/**
 * @function ContextMenuItem
 * @description A clickable option in the menu.
 */
export function ContextMenuItem({
  className,
  inset,
  variant = "default",
  children,
  ...props
}: ContextMenuItemProps) {
  const { setOpen } = useContextMenu();

  const handlePress = (e: any) => {
    setOpen(false); // Close menu on item press
    props.onPress?.(e);
  };
  
  const textClass = variant === 'destructive' 
    ? "text-red-500 dark:text-red-400" 
    : "text-gray-800 dark:text-gray-100";

  return (
    <StyledPressable
      data-slot="context-menu-item"
      onPress={handlePress}
      className={({ pressed }) => cn(
        "relative flex flex-row items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        pressed && "bg-gray-100 dark:bg-gray-700", // Focus/Hover/Active State
        inset && "pl-8", // Mimic data-[inset]
        className,
      )}
      {...props}
    >
      {/* Icon placeholder/spacing is managed by Flexbox */}
      <StyledText className={cn("flex-1", textClass)}>{children}</StyledText>
    </StyledPressable>
  );
}


// --- 5. ContextMenuSeparator ---
interface ContextMenuSeparatorProps extends ViewProps {
  className?: string;
}

/**
 * @function ContextMenuSeparator
 * @description A horizontal line to separate menu sections.
 */
export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <StyledView
      data-slot="context-menu-separator"
      className={cn("bg-gray-200 dark:bg-gray-700 h-px mx-1 my-1", className)}
      {...props}
    />
  );
}

// --- Placeholder Exports for complex sub-components ---
// These components (Group, Sub, CheckboxItem, etc.) are too complex to port 
// without introducing significant custom context/state management and will be 
// simplified by the consuming screen if needed.

export function ContextMenuGroup(props: ViewProps) { return <StyledView {...props} />; }
export function ContextMenuLabel(props: ViewProps) { return <StyledText className="px-2 py-1.5 text-xs font-semibold text-gray-500" {...props} />; }
export function ContextMenuShortcut(props: TextProps) { return <StyledText className="ml-auto text-xs text-gray-400" {...props} />; }
// ... (omitting remaining complex sub-components like CheckboxItem, RadioItem, SubMenu for simplicity)

// --- Final Export ---
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuShortcut,
};