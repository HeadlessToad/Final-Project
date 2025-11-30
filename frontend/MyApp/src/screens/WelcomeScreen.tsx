// src/screens/WelcomeScreen.tsx

import * as React from 'react';
import { View, Text, PressableProps, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Leaf, Recycle, Award } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from '../components/ui/utils';

// --- Import Converted UI Components ---
import { Button } from '../components/ui/button';

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);

// --- Constants ---
const { height: SCREEN_HEIGHT } = Dimensions.get('window');


/**
 * @function WelcomeScreen
 * @description The initial landing page introducing the application and directing users to authenticate.
 */
export function WelcomeScreen() {
    const navigation = useNavigation();

    // Navigation handler helper (to match original code structure)
    const onNavigate = (screen: string) => {
        navigation.navigate(screen as never);
    };

    // Map CSS variables to NativeWind classes:
    const PRIMARY_COLOR = 'text-green-600 dark:text-green-400';
    const PRIMARY_DARK = 'text-green-800 dark:text-green-200';
    const PRIMARY_LIGHT_BG_FROM = 'from-green-100 dark:from-green-900'; // var(--primary-light)
    const SECONDARY_COLOR = 'text-blue-600 dark:text-blue-400'; // var(--secondary)
    const ON_SURFACE_TEXT = 'text-gray-900 dark:text-gray-100'; // var(--on-surface)
    const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400'; // var(--on-surface-variant)
    const BACKGROUND_COLOR = 'bg-white dark:bg-gray-900'; // var(--background)
    const PRIMARY_GRADIENT = 'from-green-600 to-blue-600';


    return (
        <StyledView 
            // h-screen flex flex-col bg-gradient-to-b
            className={cn(`flex-1 flex-col bg-gradient-to-b ${PRIMARY_LIGHT_BG_FROM} ${BACKGROUND_COLOR}`)}
        >
            
            {/* Hero Section */}
            <StyledView className="flex-1 flex flex-col items-center justify-center px-6 pt-16">
                
                {/* Hero Illustration Container */}
                <StyledView className="relative w-64 h-64 mb-8">
                    {/* Background Blur */}
                    {/* Note: Blurred shadow requires specialized RN libraries. We use a simple shaded view. */}
                    <StyledView className={cn("absolute inset-0 bg-green-600/10 rounded-full")} style={{ opacity: 0.1, elevation: 10, shadowColor: '#10B981', shadowOpacity: 0.5 }} />
                    
                    {/* Relative Icon Container */}
                    <StyledView className="relative w-full h-full flex items-center justify-center">
                        
                        {/* Animated Icons (Simulation - RN does not support dynamic animation-delay via inline style) */}
                        <StyledView 
                            className="absolute top-0 left-8 animate-bounce" 
                            // Note: Real animation would use Reanimated.
                        >
                            <Leaf size={48} className={PRIMARY_COLOR} />
                        </StyledView>
                        <StyledView 
                            className="absolute bottom-8 right-4 animate-bounce"
                            // Note: Real animation would use Reanimated.
                        >
                            <Recycle size={56} className={PRIMARY_DARK} />
                        </StyledView>
                        <StyledView 
                            className="absolute bottom-0 left-12 animate-bounce"
                            // Note: Real animation would use Reanimated.
                        >
                            <Award size={40} className={SECONDARY_COLOR} />
                        </StyledView>
                        
                        {/* Main Center Icon */}
                        <StyledView className={`w-40 h-40 rounded-full bg-gradient-to-br ${PRIMARY_GRADIENT} flex items-center justify-center shadow-lg`}>
                            <Recycle size={80} className="text-white" />
                        </StyledView>
                    </StyledView>
                </StyledView>

                {/* Title and Description */}
                <StyledText className={cn("text-center mb-4 text-5xl font-bold", ON_SURFACE_TEXT)}>
                    GreenMind
                </StyledText>
                <StyledText className={cn("text-center text-lg mb-8 px-8", ON_SURFACE_VARIANT)}>
                    Make recycling easy. Scan waste, earn points, and help save the planet.
                </StyledText>
            </StyledView>

            {/* Actions */}
            <StyledView className="px-6 pb-12 space-y-4">
                <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={() => onNavigate('LoginScreen')}
                >
                    Login
                </Button>
                <Button
                    variant="outline"
                    size="large"
                    fullWidth
                    onClick={() => onNavigate('RegisterScreen')}
                >
                    Register
                </Button>
            </StyledView>
        </StyledView>
    );
}