// screens/WelcomeScreen.tsx (STATIC & SAFE VERSION)
// ============================================================================
// COMPONENT PURPOSE:
// This is the initial landing screen for unauthenticated users. It displays 
// the app's branding, a short description, and provides the primary entry 
// points to either Log In or Register for a new account.
// Note: This version utilizes standard static Views rather than heavy animations 
// to ensure fast load times, immediate responsiveness, and cross-device stability.
// ============================================================================

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../types";

// --- COLOR PALETTE ---
// Centralized colors specific to the Welcome screen's eco-friendly theme
const COLORS = {
  lightBackground: '#E8F5E9', // Top background color (Light Green)
  darkerGradient: '#8BC34A',  // Secondary green for gradient end/icons
  primaryGreen: '#4CAF50',    // Primary green for buttons/main circle start
  secondaryGreen: '#1B5E20',  // Dark text color for high contrast
  white: '#FFFFFF',
};

// --- PROP TYPES ---
type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Welcome">;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {

  // --------------------------------------------------------------------------
  // NAVIGATION HANDLERS
  // --------------------------------------------------------------------------
  // Pushes the user to the respective authentication flow
  const handleLoginPress = () => { navigation.navigate("Login"); }; 
  const handleRegisterPress = () => { navigation.navigate("Register"); }; 

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------
  return (
    // Full screen gradient background container fading from light green to white
    <LinearGradient
      colors={[COLORS.lightBackground, COLORS.white]}
      style={styles.container}
    >
      {/* This container holds all the illustrative icons. It is positioned absolutely 
        near the top so it doesn't interfere with the buttons at the bottom.
      */}
      <View style={styles.iconContainer}>

        {/* 1. STATIC LEAF ICON (Decorative floating element) */}
        {/* ✅ REMARK: Replaced Animated.View with standard View for stability */}
        <View style={styles.leafIconWrapper}>
          <MaterialCommunityIcons name="leaf" size={36} color={COLORS.darkerGradient} />
        </View>

        {/* STATIC MAIN RECYCLE CIRCLE (Core branding element) */}
        <LinearGradient
          colors={[COLORS.primaryGreen, COLORS.darkerGradient]}
          style={styles.mainCircle} // Large central circle with shadow
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name="recycle" size={80} color={COLORS.white} />
        </LinearGradient>

        {/* 2. STATIC SMALL RECYCLE ICON (Decorative floating element) */}
        <View style={styles.sideRecycleIconWrapper}>
          <MaterialCommunityIcons name="recycle" size={40} color={COLORS.darkerGradient} />
        </View>

        {/* 3. STATIC BADGE ICON (Gamification hint) */}
        <View style={styles.badgeIconWrapper}>
          <MaterialCommunityIcons name="medal" size={32} color="#2196F3" />
        </View>

      </View>

      {/* App Title and Description */}
      <Text style={styles.appName}>GreenMind</Text>
      <Text style={styles.description}>
        Make recycling easy. Scan waste, earn points, and help save the planet.
      </Text>

      {/* Primary Action Button: Login (Solid Green) */}
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={handleLoginPress} 
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, styles.primaryButtonText]}>Login</Text>
      </TouchableOpacity>

      {/* Secondary Action Button: Register (Outlined) */}
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={handleRegisterPress} 
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Register</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  // Main layout: pushes the buttons to the bottom of the screen
  container: { flex: 1, justifyContent: "flex-end", alignItems: "center", padding: 24, },

  // Container for all icons (positioned absolutely near the top)
  iconContainer: {
    position: 'absolute',
    top: '20%',
    alignItems: 'center',
    width: '100%',
  },

  // --- Absolute Positioning for Decorative Icons ---
  leafIconWrapper: {
    position: 'absolute',
    top: -30,
    left: '25%',
  },
  sideRecycleIconWrapper: {
    position: 'absolute',
    top: 50,
    right: '15%',
  },
  badgeIconWrapper: {
    position: 'absolute',
    bottom: -40,
  },

  // --- Static Main Circle Styles ---
  mainCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },

  // --- Text Styles (Positioned absolutely to stay above buttons but below icons) ---
  appName: { 
    fontSize: 34, 
    fontWeight: "bold", 
    color: COLORS.secondaryGreen, 
    marginBottom: 10, 
    position: 'absolute', 
    bottom: '25%', 
  },
  description: { 
    fontSize: 15, 
    color: '#666', 
    textAlign: "center", 
    marginBottom: 150, 
    paddingHorizontal: 20, 
    position: 'absolute', 
    bottom: '18%', 
  },

  // --- Button Shared Styles ---
  button: { 
    width: '100%', 
    padding: 16, 
    borderRadius: 30, 
    alignItems: 'center', 
    marginBottom: 15, 
    borderWidth: 2, 
  },
  buttonText: { fontSize: 18, fontWeight: "bold", },

  // --- Primary Button (Login - Filled Green) ---
  primaryButton: { backgroundColor: COLORS.primaryGreen, borderColor: COLORS.primaryGreen, },
  primaryButtonText: { color: COLORS.white, },

  // --- Secondary Button (Register - White Outline) ---
  secondaryButton: { backgroundColor: COLORS.white, borderColor: COLORS.primaryGreen, },
  secondaryButtonText: { color: COLORS.primaryGreen, }
});