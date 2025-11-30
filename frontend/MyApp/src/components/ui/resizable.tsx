// src/components/ui/resizable.tsx

import * as React from "react";
import { View, Pressable, ViewProps } from "react-native";
import { GripVertical } from "lucide-react-native";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { styled } from "nativewind";
import { cn } from "./utils";

// --- Styled Components ---
const StyledView = styled(View);

// --- Context for Resizable Group ---
interface ResizableContextValue {
  snapPoints: (string | number)[];
  direction: 'horizontal' | 'vertical';
}
const ResizableContext = React.createContext<ResizableContextValue | undefined>(undefined);

// --- 1. ResizablePanelGroup (Root Container) ---
interface ResizablePanelGroupProps extends ViewProps {
  direction?: 'horizontal' | 'vertical'; // We primarily support 'vertical' via BottomSheet
  snapPoints: (string | number)[]; // Required array for bottom sheet heights (e.g., [200, '50%', '90%'])
  className?: string;
  children: React.ReactNode;
}

/**
 * @function ResizablePanelGroup
 * @description The root container that simulates resizable panels using BottomSheet behavior.
 * NOTE: Only vertical resizing of the bottom panel is natively supported via this pattern.
 */
export function ResizablePanelGroup({
  direction = 'vertical',
  snapPoints,
  className,
  children,
  ...props
}: ResizablePanelGroupProps) {
    
  // The first child is assumed to be the background panel (e.g., Map)
  // The second child will be placed inside the BottomSheet (e.g., List)
  const childrenArray = React.Children.toArray(children);
  const BackgroundPanel = childrenArray[0];
  const ResizableContentPanel = childrenArray[1];
  
  // Use a ref for the BottomSheet
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const contextValue = React.useMemo(() => ({ snapPoints, direction }), [snapPoints, direction]);

  return (
    <ResizableContext.Provider value={contextValue}>
      <StyledView 
        data-slot="resizable-panel-group"
        className={cn("flex h-full w-full", direction === 'vertical' && "flex-col", className)}
        {...props}
      >
        {/* Panel 1 (Background/Static Content) */}
        <StyledView className="flex-1">
            {BackgroundPanel}
        </StyledView>

        {/* Panel 2 (Resizable Bottom Sheet) */}
        {ResizableContentPanel && (
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={0} // Start at the first snap point
                handleIndicatorStyle={{ backgroundColor: '#ccc' }} // Handle style
                // Backdrop is omitted here for simplicity, typically a transparent overlay is preferred
                // This requires a wrapper view to correctly contain the sheet
                style={{ zIndex: 10 }}
            >
                <BottomSheetView style={{ flex: 1 }}>
                    {ResizableContentPanel}
                </BottomSheetView>
            </BottomSheet>
        )}
      </StyledView>
    </ResizableContext.Provider>
  );
}


// --- 2. ResizablePanel (Content Placeholder) ---
interface ResizablePanelProps extends ViewProps {
  // Omit the size props, as the size is controlled by the parent BottomSheet snapPoints
  className?: string;
}

/**
 * @function ResizablePanel
 * @description Wrapper for the content inside a panel (either static or resizable).
 */
export function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  return (
    <StyledView 
      data-slot="resizable-panel" 
      className={cn("w-full h-full", className)} 
      {...props} 
    />
  );
}


// --- 3. ResizableHandle (The Drag Handle) ---
interface ResizableHandleProps extends ViewProps {
  withHandle?: boolean;
  className?: string;
}

/**
 * @function ResizableHandle
 * @description Placeholder for the drag handle, visually provided by the BottomSheet indicator.
 * We still render a placeholder for compatibility.
 */
export function ResizableHandle({ withHandle, className, ...props }: ResizableHandleProps) {
    // The actual drag gesture is handled by the BottomSheet's built-in Handle/Indicator.
    // We only render the visual element if explicitly requested via withHandle.
  return (
    <StyledView
        data-slot="resizable-handle"
        className={cn(
            // Styling the handle area visually if needed
            "relative flex w-full h-4 items-center justify-center", 
            className,
        )}
        {...props}
    >
      {withHandle && (
        <StyledView className="bg-gray-300 dark:bg-gray-600 z-10 flex h-4 w-10 items-center justify-center rounded-full">
          <GripVertical size={16} className="text-gray-600 dark:text-gray-400" />
        </StyledView>
      )}
    </StyledView>
  );
}

// --- Final Export ---
export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

// --- Usage Example ---
/*
<ResizablePanelGroup direction="vertical" snapPoints={['20%', '50%', '90%']} className="flex-1">
  <ResizablePanel className="bg-blue-100">
    // Map View Content (Panel 1)
  </ResizablePanel>
  
  <ResizablePanel className="bg-white">
    // List View Content (Panel 2 - Resizable Sheet)
    <ResizableHandle withHandle={true} /> 
    <Text>Recycling Centers List</Text>
  </ResizablePanel>
</ResizablePanelGroup>
*/