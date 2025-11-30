// src/components/ui/tabs.tsx

import * as React from "react";
import { View, Text, Pressable, ViewProps, PressableProps, TextProps } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// --- Context for State Management ---
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  // This will store all content associated with a key
  contentMap: Map<string, React.ReactNode>;
  registerContent: (key: string, content: React.ReactNode) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

const useTabs = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs />");
  }
  return context;
};

// --- 1. Tabs Root Component (State Manager) ---
interface TabsProps extends ViewProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * @function Tabs
 * @description The root component, managing the active tab state and rendering the active content.
 */
export function Tabs({
  value: controlledValue,
  onValueChange,
  defaultValue,
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const contentMap = React.useRef(new Map<string, React.ReactNode>());

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  }, [controlledValue, onValueChange]);

  const registerContent = React.useCallback((key: string, content: React.ReactNode) => {
    contentMap.current.set(key, content);
  }, []);

  const contextValue: TabsContextValue = React.useMemo(() => ({
    value,
    onValueChange: handleValueChange,
    contentMap: contentMap.current,
    registerContent,
  }), [value, handleValueChange, registerContent]);
  
  // Find the list and content elements from children
  const [list, ...otherChildren] = React.Children.toArray(children);

  return (
    <TabsContext.Provider value={contextValue}>
      <StyledView
        data-slot="tabs"
        // Flex column layout for List and Content stacking
        className={cn("flex flex-col gap-2 w-full", className)}
        {...props}
      >
        {/* Tab List (Buttons) */}
        {list}
        
        {/* Tab Content (Render the active content from the map) */}
        {contentMap.current.get(value)}
        
        {/* Render any other children placed outside of List/Content (e.g., general info) */}
        {otherChildren} 
      </StyledView>
    </TabsContext.Provider>
  );
}

// --- 2. TabsList (Button Container - The segmented control look) ---
interface TabsListProps extends ViewProps {
  className?: string;
}

/**
 * @function TabsList
 * @description The horizontal container for the tab buttons.
 */
export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <StyledView
      data-slot="tabs-list"
      className={cn(
        // The core segmented control styling:
        // bg-muted (light gray track), rounded-xl, inline-flex (flex row)
        "bg-gray-100 dark:bg-gray-700 inline-flex h-10 w-fit items-center justify-center rounded-xl p-[3px] flex flex-row",
        className,
      )}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- 3. TabsTrigger (Individual Button) ---
interface TabsTriggerProps extends PressableProps {
  className?: string;
  value: string; // The unique key for this tab
  children: React.ReactNode;
}

/**
 * @function TabsTrigger
 * @description A pressable button to switch between tabs.
 */
export function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = useTabs();
  const isActive = activeValue === value;

  // Dynamic classes based on active state (mimics data-[state=active])
  const activeClasses = isActive
    ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100" // Active state color/background
    : "bg-transparent text-gray-600 dark:text-gray-400"; // Inactive state color

  return (
    <StyledPressable
      data-slot="tabs-trigger"
      onPress={() => onValueChange(value)}
      // Apply styling based on activity
      className={cn(
        // Base styling: flex-1, rounded-xl, border transparent padding/size
        "inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-sm font-medium transition-colors",
        "focus-visible:ring-4 focus-visible:ring-blue-600/50 outline-none disabled:opacity-50",
        activeClasses,
        className,
      )}
      {...props}
    >
      {/* Content wrapper for text styling */}
      <StyledText className={cn("text-sm font-medium", isActive ? "text-inherit" : "text-gray-600 dark:text-gray-400")}>
        {children}
      </StyledText>
    </StyledPressable>
  );
}

// --- 4. TabsContent (Content Area) ---
interface TabsContentProps extends ViewProps {
  className?: string;
  value: string; // The unique key that links to the trigger
  children: React.ReactNode;
}

/**
 * @function TabsContent
 * @description The content panel associated with a tab key.
 */
export function TabsContent({ className, value, children, ...props }: TabsContentProps) {
  const { registerContent } = useTabs();
  
  // Register the content with its key on mount.
  // The Root component will handle the conditional rendering.
  React.useEffect(() => {
    // Wrap content in a View to apply className/props before registering
    const ContentWrapper = (
      <StyledView
        data-slot="tabs-content"
        key={value}
        className={cn("flex-1 p-2", className)}
        {...props}
      >
        {children}
      </StyledView>
    );
    registerContent(value, ContentWrapper);
  }, [value, registerContent, children, className]); // Ensure content updates if children change

  // This component doesn't render itself, the Root component does via the content map.
  return null;
}

// --- Final Export ---
export { Tabs, TabsList, TabsTrigger, TabsContent };

// --- Usage Example ---
/*
<Tabs defaultValue="history">
  <TabsList className="mx-auto">
    <TabsTrigger value="history">Classification History</TabsTrigger>
    <TabsTrigger value="points">Points Ledger</TabsTrigger>
  </TabsList>

  <TabsContent value="history">
    // Content for Classification History
  </TabsContent>
  <TabsContent value="points">
    // Content for Points Ledger
  </TabsContent>
</Tabs>
*/