// src/components/BottomNavBar.tsx
// ============================================================================
// COMPONENT PURPOSE:
// This component provides a custom bottom navigation bar for the application.
// Instead of using React Navigation's built-in Tab Navigator, this uses a 
// manual approach with absolute positioning and 'replace' navigation to switch 
// between the main core screens (Home, Centers, Rewards, Profile).
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Home, Recycle, Gift, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Centralized color palette for the navigation bar
const COLORS = {
  primary: '#4CAF50',        // Active tab color (Green)
  white: '#FFFFFF',          // Background color
  onSurfaceVariant: '#616161', // Inactive tab color (Gray)
  outline: '#E0E0E0',        // Top border color
};

// Define the navigation type for the component's internal handler 
// to ensure type safety when navigating between root stack screens.
type BottomNavNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// --- NavButton Component (Reused) ---
// ============================================================================
// A reusable, internal sub-component representing a single tab on the navbar.
// It expects an Icon component, a text label, an active state boolean, 
// and an onPress handler.
// ============================================================================
interface NavButtonProps {
  IconComponent: React.ElementType; // The Lucide icon to display
  label: string;                    // Text below the icon
  active: boolean;                  // If true, applies primary color
  onPress: () => void;              // Function to execute on tab press
}

const NavButton: React.FC<NavButtonProps> = ({ IconComponent, label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={navStyles.navButton}
  >
    {/* Dynamically apply color based on whether this tab is currently active */}
    <IconComponent
      size={24}
      color={active ? COLORS.primary : COLORS.onSurfaceVariant}
    />
    <Text style={[
      navStyles.navButtonLabel,
      { color: active ? COLORS.primary : COLORS.onSurfaceVariant }
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Defines the props expected by the main BottomNavBar component
interface BottomNavBarProps {
  // The route name of the screen currently displaying this navbar
  currentRoute: 'Home' | 'RecyclingCenters' | 'Rewards' | 'Profile';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentRoute }) => {
  const navigation = useNavigation<BottomNavNavigationProp>();

  // Map the external current route names (from RootStackParamList) 
  // to simpler internal tab names used for state matching.
  const currentTab = {
    'Home': 'home',
    'RecyclingCenters': 'centers',
    'Rewards': 'rewards',
    'Profile': 'profile',
  }[currentRoute] || 'home';

  // Handles the logic when a user clicks on a different tab.
  const handleTabChange = (tabName: 'home' | 'centers' | 'rewards' | 'profile') => {
    // Map the internal tab name back to the actual React Navigation route name
    const routeMap: Record<string, keyof RootStackParamList> = {
      'home': 'Home',
      'centers': 'RecyclingCenters',
      'rewards': 'Rewards',
      'profile': 'Profile',
    };
    
    // Command: Navigate to the corresponding stack screen.
    // NOTE: Using `navigation.replace` instead of `navigation.navigate`.
    // This prevents the stack history from getting huge and prevents the user 
    // from using the Android/iOS hardware back button to cycle through tabs.
    navigation.replace(routeMap[tabName] as any);
  };

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // Displays the container with the 4 navigation buttons spaced evenly.
  // --------------------------------------------------------------------------
  return (
    <View style={navStyles.bottomNav}>
      <NavButton IconComponent={Home} label="Home" active={currentTab === 'home'} onPress={() => handleTabChange('home')} />
      <NavButton IconComponent={Recycle} label="Centers" active={currentTab === 'centers'} onPress={() => handleTabChange('centers')} />
      <NavButton IconComponent={Gift} label="Rewards" active={currentTab === 'rewards'} onPress={() => handleTabChange('rewards')} />
      <NavButton IconComponent={User} label="Profile" active={currentTab === 'profile'} onPress={() => handleTabChange('profile')} />
    </View>
  );
};

// ============================================================================
// STYLESHEET
// ============================================================================
const navStyles = StyleSheet.create({
  // Main container styling
  bottomNav: {
    flexDirection: 'row',            // Arrange tabs horizontally
    justifyContent: 'space-around',  // Evenly distribute space between tabs
    position: 'absolute',            // Stick to the bottom of the screen
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.outline,
    paddingVertical: 5,
    // Add extra height on iOS to account for the home indicator (safe area)
    height: Platform.OS === 'ios' ? 80 : 65, 
    alignItems: 'center',
  },
  // Individual button wrapper
  navButton: {
    flexDirection: 'column',         // Icon on top, text on bottom
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,                    // Ensure touch target is wide enough
    paddingVertical: 0,
  },
  // Label text under the icon
  navButtonLabel: {
    fontSize: 12,
    marginTop: 0,
    fontWeight: '500',
  },
});