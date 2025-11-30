// src/components/ui/menubar.tsx

import * as React from "react";
import { View, Text, Pressable, ViewProps, PressableProps, TextProps } from "react-native";
import { Check, ChevronRight, Circle } from "lucide-react-native";
import { styled } from "nativewind";
import { cn } from "./utils";

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// --- Context for Menu State (Simplified) ---
// We don't manage complex nested menus here, just a simple open/close state if needed
interface MenubarContextValue {
  // Can add global state if multiple menus need to interact
}
const MenubarContext = React.createContext<MenubarContextValue | undefined>(undefined);

// --- 1. Menubar Root Component (The Horizontal Bar) ---
interface MenubarProps extends ViewProps {
  className?: string;
}

/**
 * @function Menubar
 * @description The main horizontal container for menu triggers.
 */
export function Menubar({ className, children, ...props }: MenubarProps) {
  return (
    <StyledView
      data-slot="menubar"
      className={cn(
        // Flex row for horizontal layout, height, border, padding, shadow
        "bg-white dark:bg-gray-800 flex flex-row h-10 items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 p-1 shadow-xs",
        className,
      )}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- 2. Menubar Trigger (The Pressable Button) ---
interface MenubarTriggerProps extends PressableProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function MenubarTrigger
 * @description A pressable item in the menubar that opens a sub-menu (like a Dropdown/Popover).
 */
export function MenubarTrigger({ className, children, ...props }: MenubarTriggerProps) {
  return (
    <StyledPressable
      data-slot="menubar-trigger"
      // Mimic focus and open states with press/active styling
      className={({ pressed }) => cn(
        "flex items-center rounded-sm px-3 py-1 text-sm font-medium outline-none select-none",
        pressed && "bg-gray-100 dark:bg-gray-700", // Focus/Open state visual
        className,
      )}
      {...props}
    >
      <StyledText className="text-gray-900 dark:text-gray-100">{children}</StyledText>
    </StyledPressable>
  );
}

// --- 3. Menubar Content (Placeholder/Integration Advice) ---
interface MenubarContentProps extends ViewProps {
    className?: string;
    children: React.ReactNode;
}

/**
 * @function MenubarContent
 * @description Placeholder. On mobile, the content should be a DropdownMenuContent 
 * or PopoverContent component triggered by the MenubarTrigger's onPress handler.
 */
export function MenubarContent({ className, children, ...props }: MenubarContentProps) {
    console.warn("MenubarContent should be replaced by DropdownMenuContent on mobile.");
    
    // Returning a simple View to avoid breaking layout, but requires custom integration.
    return (
        <StyledView
            data-slot="menubar-content"
            className={cn(
                "bg-white dark:bg-gray-800 border rounded-md p-1 shadow-md min-w-[12rem] z-50",
                className
            )}
            {...props}
        >
            {children}
        </StyledView>
    );
}


// --- 4. Menubar Item (Pressable Option) ---
interface MenubarItemProps extends PressableProps {
    className?: string;
    inset?: boolean;
    variant?: "default" | "destructive";
    children: React.ReactNode;
}

/**
 * @function MenubarItem
 * @description A clickable option inside the menu content.
 */
export function MenubarItem({ 
    className, 
    inset, 
    variant = "default", 
    children, 
    ...props 
}: MenubarItemProps) {
    const textClass = variant === 'destructive' 
        ? "text-red-500 dark:text-red-400" 
        : "text-gray-800 dark:text-gray-100";
    
    return (
        <StyledPressable
            data-slot="menubar-item"
            className={({ pressed }) => cn(
                "relative flex flex-row items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
                pressed && "bg-gray-100 dark:bg-gray-700", // Active/Focus state
                inset && "pl-8", // Mimic data-[inset]
                className,
            )}
            {...props}
        >
            <StyledText className={textClass}>{children}</StyledText>
        </StyledPressable>
    );
}

// --- 5. Menubar Separator ---
interface MenubarSeparatorProps extends ViewProps {
    className?: string;
}
export function MenubarSeparator({ className, ...props }: MenubarSeparatorProps) {
    return (
        <StyledView
            data-slot="menubar-separator"
            className={cn("bg-gray-200 dark:bg-gray-700 h-px mx-1 my-1", className)}
            {...props}
        />
    );
}

// --- Placeholder Exports for complex sub-components ---
// Simplified or omitted complex components (Checkbox/Radio/Sub-menus)
// to maintain a clean mobile component.

export function MenubarMenu(props: ViewProps) { return <MenubarContext.Provider value={{}}><StyledView {...props} /></MenubarContext.Provider>; }
export function MenubarGroup(props: ViewProps) { return <StyledView {...props} />; }
export function MenubarLabel(props: TextProps & { inset?: boolean }) { 
    return (
        <StyledText className={cn("px-2 py-1.5 text-xs font-semibold text-gray-500", props.inset && "pl-8", props.className)}>{props.children}</StyledText>
    ); 
}
export function MenubarShortcut(props: TextProps) { 
    return (
        <StyledText className={cn("ml-auto text-xs text-gray-400", props.className)} {...props} /> 
    ); 
}
export const MenubarRadioGroup = (props: ViewProps) => <StyledView {...props} />;
// Omitted CheckboxItem, RadioItem, Sub, SubTrigger, SubContent for mobile simplification.

// --- Final Export ---
export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarRadioGroup,
  // Omitted: Portal, Close, CheckboxItem, RadioItem, Sub, SubTrigger, SubContent
};