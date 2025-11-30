// src/screens/SettingsScreen.tsx

import * as React from 'react';
import { View, Text, ScrollView, Pressable, PressableProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Moon, Sun, Bell, Globe, HelpCircle, Shield, LogOut, ChevronRight } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from '../components/ui/utils';

// --- Import Converted UI Components ---
import { Header } from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/seperator';

// --- Context Hooks (Assumed to be functional) ---
import { useAuth } from '../context/AuthContext'; 
// NOTE: Theme context (useTheme) would provide the actual theme state/toggle function.

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

// --- 1. SettingItem Component (Converted Helper) ---

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  noBorder?: boolean;
  onPress?: PressableProps['onPress'];
}

function SettingItem({ icon, title, description, noBorder, onPress }: SettingItemProps) {
  // Map CSS variables to NativeWind classes:
  const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400';
  const OUTLINE_COLOR = 'border-gray-300 dark:border-gray-700';
  const SURFACE_VARIANT_BG = 'bg-gray-100 dark:bg-gray-700/50';

  return (
    <Pressable
      onPress={onPress}
      className={({ pressed }) => cn(
        "w-full flex flex-row items-center gap-4 p-4 transition-colors",
        pressed && `bg-gray-100 dark:bg-gray-700/50`, // hover/active state
        !noBorder && `border-b ${OUTLINE_COLOR}`
      )}
    >
      <StyledView className={ON_SURFACE_VARIANT}>{icon}</StyledView>
      <StyledView className="flex-1 text-left">
        <StyledText className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">{title}</StyledText>
        <StyledText className={cn("text-sm", ON_SURFACE_VARIANT)}>{description}</StyledText>
      </StyledView>
      <ChevronRight size={20} className={ON_SURFACE_VARIANT} />
    </Pressable>
  );
}

// --- 2. SettingsScreen Main Component ---

interface SettingsScreenProps {
  // We use local state/context for theme in RN
  theme?: 'light' | 'dark'; // Assumed to be provided by a context/prop
  onToggleTheme?: () => void; // Assumed toggle function
}

/**
 * @function SettingsScreen
 * @description Provides app configuration options and support links.
 */
export function SettingsScreen({ theme: themeProp = 'light', onToggleTheme }: SettingsScreenProps) {
  const navigation = useNavigation();
  const { logOut } = useAuth(); // Assume logOut function is available
  
  // Use a mock theme state if props are not passed (for development)
  const [theme, setTheme] = React.useState(themeProp);
  const handleToggleTheme = onToggleTheme || (() => setTheme(t => t === 'light' ? 'dark' : 'light'));

  // Map CSS variables to NativeWind classes:
  const PRIMARY_COLOR = 'bg-green-600 dark:bg-green-700';
  const OUTLINE_COLOR_BG = 'bg-gray-300 dark:bg-gray-600';
  const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400';
  const ON_SURFACE_TEXT = 'text-gray-900 dark:text-gray-100';


  // --- Logout Handler ---
  const handleLogout = () => {
    // NOTE: Call AuthContext logOut function
    console.log("Logging out...");
    logOut().catch(() => {
        // If logout fails, navigate to welcome anyway (or show alert)
        navigation.navigate('WelcomeScreen' as never);
    });
  };

  return (
    <StyledView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header
        onBack={navigation.goBack}
        title="Settings"
      />

      <StyledScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 64 }}>
        <StyledView className="space-y-6">
          
          {/* --- Theme Toggle --- */}
          <Card>
            <StyledView className="flex flex-row items-center justify-between">
              <StyledView className="flex flex-row items-center gap-3">
                {theme === 'light' ? (
                  <Sun size={20} className={ON_SURFACE_VARIANT} />
                ) : (
                  <Moon size={20} className={ON_SURFACE_VARIANT} />
                )}
                <StyledView>
                  <StyledText className="text-lg font-semibold text-gray-900 dark:text-gray-100">Theme</StyledText>
                  <StyledText className={cn("text-sm", ON_SURFACE_VARIANT)}>
                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </StyledText>
                </StyledView>
              </StyledView>
              
              {/* Custom Switch Logic (using RN Pressable and Animated View logic for visual) */}
              <Pressable
                onPress={handleToggleTheme}
                className={cn(`w-14 h-8 rounded-full transition-colors relative`, 
                    theme === 'dark' ? PRIMARY_COLOR : OUTLINE_COLOR_BG
                )}
              >
                <StyledView
                  // This view simulates the thumb (using simple absolute positioning)
                  className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform`}
                  style={{
                    transform: [
                      { translateX: theme === 'dark' ? 28 : 4 } // 14px (width) - 8px (height) - 2px gap = 4px; 14px + 8px + 6px = 28px
                    ]
                  }}
                />
              </Pressable>
            </StyledView>
          </Card>

          {/* --- Preferences Menu --- */}
          <StyledView>
            <StyledText className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Preferences</StyledText>
            <Card padding="none">
              <SettingItem
                icon={<Bell size={20} />}
                title="Notifications"
                description="Manage notification preferences"
                onPress={() => console.log('Navigate to Notifications')}
              />
              <SettingItem
                icon={<Globe size={20} />}
                title="Language"
                description="English"
                noBorder
                onPress={() => console.log('Navigate to Language')}
              />
            </Card>
          </StyledView>

          {/* --- Support Menu --- */}
          <StyledView>
            <StyledText className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Support</StyledText>
            <Card padding="none">
              <SettingItem
                icon={<HelpCircle size={20} />}
                title="Help & FAQ"
                description="Get help and support"
                onPress={() => navigation.navigate('FeedbackScreen' as never)} // Reuse Feedback screen for help
              />
              <SettingItem
                icon={<Shield size={20} />}
                title="Privacy Policy"
                description="View our privacy policy"
                noBorder
                onPress={() => console.log('Open Privacy Policy')}
              />
            </Card>
          </StyledView>

          {/* --- App Info --- */}
          <Card className="text-center p-4">
            <StyledText className={cn("text-sm mb-1", ON_SURFACE_VARIANT)}>GreenMind v1.0.0</StyledText>
            <StyledText className={cn("text-xs", ON_SURFACE_VARIANT)}>
              Making the world greener, one scan at a time 🌱
            </StyledText>
          </Card>

          {/* --- Logout Button --- */}
          <Button
            variant="outline"
            size="large"
            fullWidth
            onClick={handleLogout}
            icon={<LogOut size={20} className={PRIMARY_COLOR} />}
          >
            Logout
          </Button>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
}