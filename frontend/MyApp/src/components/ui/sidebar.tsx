// src/components/ui/sidebar.tsx

import * as React from "react";
import { View, Text, Pressable, ViewProps, PressableProps, TextProps } from "react-native";
import { PanelLeft } from "lucide-react-native";
import { cva } from "class-variance-authority";
import { styled } from "nativewind";
import { cn } from "./utils";

// --- Import Converted Mobile Primitives ---
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./sheet";
import { Button, ButtonProps } from "./button";
import { Separator } from "./separator";
import { Input, InputProps } from "./input";
import { Skeleton } from "./skeleton";
// Tooltip is often omitted or simplified on mobile, but we will use the simplified press-popover approach
// NOTE: TooltipProvider is usually not needed in RN unless implementing a complex Tooltip solution.


// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// --- Constants (Simplified for Mobile) ---
const SIDEBAR_WIDTH_MOBILE = 288; // Equivalent of 18rem (288px)

// --- Context for Mobile Sidebar State ---
type SidebarContextProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}


// --- 1. SidebarProvider (State Manager) ---
interface SidebarProviderProps extends ViewProps {
  defaultOpen?: boolean; // Retained for state consistency
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * @function SidebarProvider
 * @description Manages the open/closed state of the mobile sidebar (Sheet).
 */
export function SidebarProvider({
  defaultOpen = false,
  open: openProp,
  onOpenChange: setOpenProp,
  children,
}: SidebarProviderProps) {
  // We treat the main state as the mobile state since desktop logic is removed.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      // Desktop logic (cookies, keydown) removed.
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    setOpen((o) => !o);
  }, [setOpen]);

  const contextValue: SidebarContextProps = React.useMemo(
    () => ({
      open,
      setOpen,
      toggleSidebar,
    }),
    [open, setOpen, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <StyledView data-slot="sidebar-wrapper" className="flex min-h-full w-full">
        {children}
      </StyledView>
    </SidebarContext.Provider>
  );
}


// --- 2. Sidebar (The Mobile Sheet Renderer) ---
interface SidebarProps extends ViewProps {
  side?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}

/**
 * @function Sidebar
 * @description Renders the sidebar content inside a Sheet (Mobile Side-Drawer).
 */
export function Sidebar({ side = "left", className, children, ...props }: SidebarProps) {
  const { open, setOpen } = useSidebar();

  // On mobile, the sidebar is always rendered as a Sheet.
  return (
    <Sheet open={open} onOpenChange={setOpen} {...props}>
      <SheetContent
        data-slot="sidebar"
        data-mobile="true"
        // Using explicit styles for width to override Sheet's default 
        style={{ width: SIDEBAR_WIDTH_MOBILE }}
        side={side}
        className={cn(
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-0 flex flex-col",
          "[&>button]:hidden", // Hide the Sheet's default close button, we'll use a custom one or rely on overlay close
          className,
        )}
      >
        <SheetHeader className="p-4">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">Main application navigation.</SheetDescription>
        </SheetHeader>
        <StyledView className="flex h-full w-full flex-col">
            {children}
        </StyledView>
      </SheetContent>
    </Sheet>
  );
}


// --- 3. SidebarTrigger (Button to Open Sidebar) ---
interface SidebarTriggerProps extends ButtonProps {}

/**
 * @function SidebarTrigger
 * @description Button placed in the header to toggle the sidebar open/closed.
 */
export function SidebarTrigger({ className, onPress, ...props }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-8", className)}
      onPress={(event) => {
        onPress?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft size={20} className="text-gray-600 dark:text-gray-400" />
      <StyledText className="sr-only">Toggle Sidebar</StyledText>
    </Button>
  );
}

// --- 4. Content Wrappers (Simplified HTML to RN Views) ---
interface SidebarDivProps extends ViewProps {
    className?: string;
    children: React.ReactNode;
}

export function SidebarHeader({ className, ...props }: SidebarDivProps) {
  return (
    <StyledView data-slot="sidebar-header" className={cn("flex flex-col gap-2 p-2 border-b border-gray-200 dark:border-gray-700", className)} {...props} />
  );
}

export function SidebarContent({ className, ...props }: SidebarDivProps) {
  return (
    <StyledView data-slot="sidebar-content" className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto", className)} {...props} />
  );
}

export function SidebarFooter({ className, ...props }: SidebarDivProps) {
  return (
    <StyledView data-slot="sidebar-footer" className={cn("