// src/components/ui/sooner.tsx

import * as React from 'react';
import Toast from 'react-native-toast-message';
import { View } from 'react-native';
import { styled } from 'nativewind';

// --- Styled Components ---
const StyledView = styled(View);

// --- Context/Hook Placeholder for Theme ---
// In a real Expo app, you would use a hook like this to determine the current theme.
// Since we don't have the full theme setup yet, this is a placeholder.
const useMobileTheme = () => {
    // Return a default theme for initial styling
    return { theme: 'light', isDarkMode: false };
};

// --- Custom Toast Config (To match popover/border design) ---
const toastConfig = {
    // Custom Success Toast
    success: ({ text1, text2, props }: any) => (
        <StyledView 
            // Replicating the popover style: white background, border, shadow
            className="w-[90%] p-4 rounded-lg border border-gray-200 shadow-md bg-white dark:bg-gray-800"
            {...props}
        >
            <StyledView className="flex flex-row items-center">
                {/* Icon Placeholder */}
                <StyledView className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                
                <StyledView className="flex-1">
                    {text1 && <StyledText className="text-base font-semibold text-gray-900 dark:text-gray-100">{text1}</StyledText>}
                    {text2 && <StyledText className="text-sm text-gray-600 dark:text-gray-400">{text2}</StyledText>}
                </StyledView>
            </StyledView>
        </StyledView>
    ),
    // You would define other types (error, info) here...
};


// --- Toaster Component (The Wrapper) ---

// The props are replaced with a simple wrapper view, as Toast handles its own props globally.
interface ToasterProps extends React.ComponentProps<typeof StyledView> {
  // In RN, props like theme are passed to the Toast component globally, not to this wrapper.
}

/**
 * @function Toaster
 * @description A wrapper component that renders the Toast system globally.
 * Use Toast.show({...}) to trigger notifications.
 */
export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useMobileTheme(); // Use theme to conditionally style the global toast if needed.

  // NOTE: The entire implementation of the original Sonner component (with CSS variables) 
  // is replaced by the global Toast component from react-native-toast-message.

  return (
    // This wrapper is primarily for placement if needed, but Toast renders globally.
    <StyledView {...props}>
        <Toast config={toastConfig} />
    </StyledView>
  );
};

// --- Export the trigger mechanism (Toast) and the wrapper (Toaster) ---
export { Toaster };

// --- Example Usage (outside of this file, in any screen or service): ---
/*
// After a successful classification:
Toast.show({
    type: 'success',
    text1: 'Classification Complete!',
    text2: 'You earned 5 points for recycling plastic.',
    position: 'top',
    visibilityTime: 4000,
});
*/