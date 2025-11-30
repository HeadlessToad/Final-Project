// src/components/ui/collapsible.tsx

import * as React from "react";
import { View, Pressable, ViewProps, PressableProps } from "react-native";
import { styled } from "nativewind";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  FadeInUp, // Simple animation for showing content
  FadeOutDown // Simple animation for hiding content
} from 'react-native-reanimated';

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
const StyledAnimatedView = styled(Animated.View);

// --- Context for State Management ---
interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | undefined>(undefined);

const useCollapsibleContext = () => {
  const context = React.useContext(CollapsibleContext);
  if (context === undefined) {
    throw new Error('Collapsible components must be used within <Collapsible>');
  }
  return context;
};


// --- 1. Collapsible Root Component ---

interface CollapsibleProps extends ViewProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * @function Collapsible
 * @description The root component that manages the open/closed state of the collapsible content.
 */
export function Collapsible({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  className,
  children,
  ...props
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  const contextValue: CollapsibleContextValue = React.useMemo(() => ({
    open,
    setOpen,
  }), [open, setOpen]);

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <StyledView data-slot="collapsible" className={className} {...props}>
        {children}
      </StyledView>
    </CollapsibleContext.Provider>
  );
}


// --- 2. CollapsibleTrigger Component ---

interface CollapsibleTriggerProps extends PressableProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function CollapsibleTrigger
 * @description A pressable component that toggles the open/closed state of the collapsible content.
 */
export function CollapsibleTrigger({ className, children, ...props }: CollapsibleTriggerProps) {
  const { open, setOpen } = useCollapsibleContext();

  return (
    <StyledPressable
      data-slot="collapsible-trigger"
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={() => setOpen(!open)}
      className={className}
      {...props}
    >
      {children}
    </StyledPressable>
  );
}


// --- 3. CollapsibleContent Component ---

interface CollapsibleContentProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * @function CollapsibleContent
 * @description The content area that expands and collapses. Uses Reanimated for smooth transitions.
 */
export function CollapsibleContent({ className, children, ...props }: CollapsibleContentProps) {
  const { open } = useCollapsibleContext();
  
  // Note: For true height animation, you need a measuring technique like 
  // useAnimatedReaction with measure(). For simplicity, FadeIn/FadeOut provides a clean UX.

  if (!open) {
    return null;
  }
  
  return (
    <StyledAnimatedView
      data-slot="collapsible-content"
      // Use simple fading/translation effects to simulate the transition
      entering={FadeInUp.duration(300)}
      exiting={FadeOutDown.duration(300)}
      className={className}
      {...props}
    >
      {children}
    </StyledAnimatedView>
  );
}

// --- Export the components ---
export { Collapsible, CollapsibleTrigger, CollapsibleContent };

// --- Usage Example ---
/*
import { Button } from './button';
import { Text } from 'react-native';

<Collapsible defaultOpen={false}>
  <CollapsibleTrigger>
    <Button variant="secondary">
      Show Recycling Tips
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="p-4 bg-gray-50 border rounded-b-lg mt-1">
    <Text>Tip: Always rinse plastic containers before recycling!</Text>
  </CollapsibleContent>
</Collapsible>
*/