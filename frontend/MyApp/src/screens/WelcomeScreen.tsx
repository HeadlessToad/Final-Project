// screens/WelcomeScreen.tsx

import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../types";

// 🔥 RE-IMPLEMENTED ANIMATION IMPORTS: Required for the smooth, floating effect (Worklets)
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';


// --- COLOR PALETTE ---
const COLORS = {
  lightBackground: '#E8F5E9', // Top background color
  darkerGradient: '#8BC34A', // Secondary green for gradient end/icons
  primaryGreen: '#4CAF50',  // Primary green for buttons/main circle start
  secondaryGreen: '#1B5E20', // Dark text color
  white: '#FFFFFF',
};

// --- PROP TYPES ---
type WelcomeScreenProps = {
  // Navigation prop uses the main stack list and the current route name 'Welcome'
  navigation: NativeStackNavigationProp<RootStackParamList, "Welcome">;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {

  // 1. ANIMATION STATE: Defines the current vertical offset (starts at 0)
  const floatOffset = useSharedValue(0);

  useEffect(() => {
    // 2. ANIMATION EFFECT: Starts the infinite floating loop on component mount
    floatOffset.value = withRepeat(
      // Target Value: Move the element 10 pixels up (-10)
      withTiming(-10, {
        duration: 1000, // 1.5 seconds for one cycle (up or down)
        easing: Easing.inOut(Easing.ease), // Smooth acceleration/deceleration
      }),
      -1, // Repeat indefinitely
      true // Auto-reverse the animation (float up, then float down)
    );
  }, []);

  // 3. ANIMATED STYLE: Applies the dynamic vertical movement to the 'transform' property
  const animatedFloatStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatOffset.value }], // Moves along the Y-axis
    };
  });

  // --- NAVIGATION HANDLERS ---
  const handleLoginPress = () => { navigation.navigate("Login"); }; // Navigates to the Login Form
  const handleRegisterPress = () => { navigation.navigate("Register"); }; // Navigates to the Register Form

  return (
    // Full screen gradient background container
    <LinearGradient
      colors={[COLORS.lightBackground, COLORS.white]}
      style={styles.container}
    >
      <View style={styles.iconContainer}>

        {/* 1. ANIMATED LEAF ICON (Floating) */}
        <Animated.View style={[styles.leafIconWrapper, animatedFloatStyle]}>
          <MaterialCommunityIcons name="leaf" size={36} color={COLORS.darkerGradient} />
        </Animated.View>

        {/* STATIC MAIN RECYCLE CIRCLE */}
        <LinearGradient
          colors={[COLORS.primaryGreen, COLORS.darkerGradient]}
          style={styles.mainCircle} // Large central circle with shadow
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name="recycle" size={80} color={COLORS.white} />
        </LinearGradient>

        {/* 2. ANIMATED SMALL RECYCLE ICON (Floating) */}
        <Animated.View style={[styles.sideRecycleIconWrapper, animatedFloatStyle]}>
          <MaterialCommunityIcons name="recycle" size={40} color={COLORS.darkerGradient} />
        </Animated.View>

        {/* 3. ANIMATED BADGE ICON (Floating) */}
        <Animated.View style={[styles.badgeIconWrapper, animatedFloatStyle]}>
          <MaterialCommunityIcons name="medal" size={32} color="#2196F3" />
        </Animated.View>

      </View>

      {/* App Title and Description */}
      <Text style={styles.appName}>GreenMind</Text>
      <Text style={styles.description}>
        Make recycling easy. Scan waste, earn points, and help save the planet.
      </Text>

      {/* Primary Action Button: Login */}
      <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleLoginPress} activeOpacity={0.8}>
        <Text style={[styles.buttonText, styles.primaryButtonText]}>Login</Text>
      </TouchableOpacity>

      {/* Secondary Action Button: Register */}
      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleRegisterPress} activeOpacity={0.7}>
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Register</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Main layout: centers content vertically/horizontally at the bottom
  container: { flex: 1, justifyContent: "flex-end", alignItems: "center", padding: 24, },

  // Container for all floating icons/main logo (positioned absolutely near the top)
  iconContainer: {
    position: 'absolute',
    top: '20%',
    alignItems: 'center',
    width: '100%',
  },

  // --- Absolute Positioning for Small Animated Icons ---
  leafIconWrapper: {
    position: 'absolute',
    top: -30,
    left: '25%',
  },
  sideRecycleIconWrapper: {
    position: 'absolute',
    top: 50,
    right: '25%',
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

  // --- Text & Button Styles ---
  appName: { fontSize: 34, fontWeight: "bold", color: COLORS.secondaryGreen, marginBottom: 10, position: 'absolute', bottom: '25%', },
  description: { fontSize: 15, color: '#666', textAlign: "center", marginBottom: 150, paddingHorizontal: 20, position: 'absolute', bottom: '18%', },

  // Button Base Style
  button: { width: '100%', padding: 16, borderRadius: 30, alignItems: 'center', marginBottom: 15, borderWidth: 2, },

  // Primary Button (Filled Green)
  primaryButton: { backgroundColor: COLORS.primaryGreen, borderColor: COLORS.primaryGreen, },

  // Secondary Button (Outline)
  secondaryButton: { backgroundColor: COLORS.white, borderColor: COLORS.primaryGreen, },

  // Text Shared Style
  buttonText: { fontSize: 18, fontWeight: "bold", },

  // Primary Text Color
  primaryButtonText: { color: COLORS.white, },

  // Secondary Text Color
  secondaryButtonText: { color: COLORS.primaryGreen, }
});