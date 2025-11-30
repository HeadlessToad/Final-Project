// App.tsx (The main application entry point for Expo)

import * as React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native'; // CRITICAL: Use the base container

// --- Expo Router/NativeWind Imports ---
import { useColorScheme } from 'nativewind';
// NOTE: We now avoid importing Stack/SplashScreen directly from expo-router here

// --- Import Context and Services ---
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sooner';

// --- Import the Custom Router ---
import InitialRouter from './navigation/RootNavigation'; // Your custom router component



// --- Styled Components ---
const StyledView = styled(View);

/**
 * @function RootLayout
 * @description The main component wrapper for the entire Expo application.
 */
function RootLayout() {
  // ... (App Ready logic remains the same)
  // [NOTE: You will need to re-implement your appIsReady/Splash screen logic here if you removed it]
  const [appIsReady, setAppIsReady] = React.useState(true); // Assume ready for test

  if (!appIsReady) {
    return null;
  }

  return (
    // 1. Gesture Handler is the root wrapper
<GestureHandlerRootView style={{ flex: 1 }}>
            {/* ... other providers ... */}
            <NavigationContainer> 
                <AuthProvider> 
                    <TooltipProvider>
                        {/* Renders the full Stack defined in RootNavigation.tsx */}
                        <InitialRouter /> 
                    </TooltipProvider>
                </AuthProvider>
            </NavigationContainer>
            {/* ... toaster ... */}
        </GestureHandlerRootView>
  );
}

// NOTE: This must be the default export for your index.ts to pick up.
export default RootLayout;