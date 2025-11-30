// src/components/ui/navigation-menu.tsx

import * as React from "react";
import { View, Text, Pressable, ViewProps, PressableProps, TextProps } from "react-native";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react-native";
import { styled } from "nativewind";
import { cn } from "./utils";

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// --- Context for State Management (To manage which item is 'active') ---
interface NavigationMenuContextValue {
  activeValue: string | null;
  onValueChange: (value: string) => void;
}

const NavigationMenuContext = React.createContext<NavigationMenuContextValue | undefined>(undefined);
const useNavigationMenu = () => {
  const context = React.useContext(NavigationMenuContext);
  if (!context) {
    throw new Error("NavigationMenu components must be used within <NavigationMenu />");
  }
  return context;
};

// --- 1. NavigationMenu Root Component (State Manager) ---
interface NavigationMenuProps extends ViewProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * @function NavigationMenu
 * @description The root component, managing the currently active tab/menu item state.
 */
export function NavigationMenu({
  value: controlledValue,
  onValueChange,
  defaultValue,
  className,
  children,
  ...props
}: NavigationMenuProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | null>(defaultValue || null);

  const activeValue = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  }, [controlledValue, onValueChange]);

  const contextValue: NavigationMenuContextValue = React.useMemo(() => ({
    activeValue,
    onValueChange: handleValueChange,
  }), [activeValue, handleValueChange]);

  // Viewport and Indicator are omitted for this mobile conversion
  return (
    <NavigationMenuContext.Provider value={contextValue}>
      <StyledView 
        data-slot="navigation-menu"
        className={cn("relative flex w-full items-center justify-center", className)}
        {...props}
      >
        {children}
      </StyledView>
    </NavigationMenuContext.Provider>
  );
}

// --- 2. NavigationMenuList (Horizontal Container) ---
interface NavigationMenuListProps extends ViewProps {
  className?: string;
}

/**
 * @function NavigationMenuList
 * @description Horizontal Flex container for the menu items.
 */
export function NavigationMenuList({ className, children, ...props }: NavigationMenuListProps) {
  return (
    <StyledView
      data-slot="navigation-menu-list"
      className={cn(
        "flex flex-row flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- 3. NavigationMenuItem (Wrapper for Trigger/Link) ---
interface NavigationMenuItemProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function NavigationMenuItem
 * @description Simple wrapper for a menu item.
 */
export function NavigationMenuItem({ className, ...props }: NavigationMenuItemProps) {
  return (
    <StyledView
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

// --- 4. NavigationMenuTrigger/Link Style (CVA Definition) ---
export const navigationMenuTriggerStyle = cva(
  "inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
  {
    variants: {
      active: {
        true: "bg-blue-600 text-white", // Active state colors
        false: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200", // Default state colors
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

// --- 5. NavigationMenuTrigger (The Pressable Button/Tab) ---
interface NavigationMenuTriggerProps extends PressableProps {
  className?: string;
  children: React.ReactNode;
  value: string; // Required to identify the item
}

/**
 * @function NavigationMenuTrigger
 * @description The pressable element that acts as a tab or menu trigger.
 */
export function NavigationMenuTrigger({ className, children, value, ...props }: NavigationMenuTriggerProps) {
  const { activeValue, onValueChange } = useNavigationMenu();
  const isActive = activeValue === value;
  
  // Logic to check for the ChevronDownIcon when it's a dropdown trigger
  const hasChevron = children && React.Children.toArray(children).some(child => 
    React.isValidElement(child) && child.type === ChevronDown
  );

  return (
    <StyledPressable
      data-slot="navigation-menu-trigger"
      onPress={() => onValueChange(value)}
      className={cn(navigationMenuTriggerStyle({ active: isActive }), className)}
      {...props}
    >
      <StyledText 
        className={cn(
          "text-sm font-medium", 
          isActive ? "text-white" : "text-gray-800 dark:text-gray-200"
        )}
      >
        {children}
      </StyledText>
      
      {/* If the original trigger included the chevron, render it */}
      {hasChevron && (
        <ChevronDown
          size={12}
          className={cn(
            "relative top-[1px] ml-1 transition-transform duration-300",
            isActive ? "text-white" : "text-gray-500",
            // The rotate-180 logic is omitted as we don't manage a sub-menu here.
          )}
          aria-hidden="true"
        />
      )}
    </StyledPressable>
  );
}

// --- 6. NavigationMenuLink (Simpler Link Button) ---
interface NavigationMenuLinkProps extends PressableProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function NavigationMenuLink
 * @description A simpler link/button component.
 */
export function NavigationMenuLink({ className, children, ...props }: NavigationMenuLinkProps) {
  return (
    <StyledPressable
      data-slot="navigation-menu-link"
      className={({ pressed }) => cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none",
        pressed && "bg-gray-100 dark:bg-gray-700",
        className,
      )}
      {...props}
    >
      <StyledText className="text-sm text-gray-900 dark:text-gray-100">{children}</StyledText>
    </StyledPressable>
  );
}

// --- Omitted Components (Complex Web-Specific Parts) ---
// We omit NavigationMenuContent, NavigationMenuViewport, and NavigationMenuIndicator
// as they handle complex desktop-style sub-menus and positioning that are not
// suitable or necessary for a mobile application.

export const NavigationMenuContent = () => null;
export const NavigationMenuViewport = () => null;
export const NavigationMenuIndicator = () => null;


// --- Final Export ---
export {