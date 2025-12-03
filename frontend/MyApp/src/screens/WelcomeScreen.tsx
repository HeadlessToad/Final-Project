// screens/WelcomeScreen.tsx (Focus on animating the small icons)

import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../types";

// ⚠️ IMPORTANT: Import Animated components from react-native-reanimated
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    withRepeat, 
    Easing,
} from 'react-native-reanimated';

// [COLORS and TYPES remain the same]
const COLORS = { 
  lightBackground: '#E8F5E9', 
  darkerGradient: '#8BC34A', 
  primaryGreen: '#4CAF50', 
  secondaryGreen: '#1B5E20', 
  white: '#FFFFFF',
};
type WelcomeScreenProps = { 
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">; 
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  
  // 1. Define the Shared Value for vertical offset
  const floatOffset = useSharedValue(0);

  useEffect(() => {
    // 2. Start the animation when the component mounts
    floatOffset.value = withRepeat(
      // Move from 0 to -10 (10 pixels up)
      withTiming(-10, { 
        duration: 1000, // Duration of the float cycle
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Repeat indefinitely
      true // Reverse the animation direction
    );
  }, []); 

  // 3. Define the Animated Style to be reused on all small logos
  const animatedFloatStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatOffset.value }],
    };
  });
  
  const handleLoginPress = () => { navigation.navigate("Login" as any); };
  const handleRegisterPress = () => { navigation.navigate("Register"); };

  return (
    <LinearGradient
      colors={[COLORS.lightBackground, COLORS.white]}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        
        {/* ----------------- 1. ANIMATED LEAF ICON ----------------- */}
        <Animated.View style={[styles.leafIconWrapper, animatedFloatStyle]}>
          <MaterialCommunityIcons 
            name="leaf" 
            size={36} 
            color={COLORS.darkerGradient} 
          />
        </Animated.View>
        
        {/* ----------------- STATIC MAIN CIRCLE ----------------- */}
        <LinearGradient
          colors={[COLORS.primaryGreen, COLORS.darkerGradient]}
          style={styles.mainCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons 
            name="recycle" 
            size={80} 
            color={COLORS.white} 
          />
        </LinearGradient>
        
        {/* ----------------- 2. ANIMATED SMALL RECYCLE ICON ----------------- */}
        <Animated.View style={[styles.sideRecycleIconWrapper, animatedFloatStyle]}>
          <MaterialCommunityIcons 
            name="recycle" 
            size={40} 
            color={COLORS.darkerGradient} 
          />
        </Animated.View>

        {/* ----------------- 3. ANIMATED BADGE ICON ----------------- */}
        <Animated.View style={[styles.badgeIconWrapper, animatedFloatStyle]}>
          <MaterialCommunityIcons 
            name="medal" 
            size={32} 
            color="#2196F3"
          />
        </Animated.View>

      </View>

      <Text style={styles.appName}>GreenMind</Text>
      <Text style={styles.description}>
        Make recycling easy. Scan waste, earn points, and help save the planet.
      </Text>

      <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleLoginPress} activeOpacity={0.8}>
        <Text style={[styles.buttonText, styles.primaryButtonText]}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleRegisterPress} activeOpacity={0.7}>
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Register</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // [Styles remain mostly the same, focusing on the wrappers for precise positioning]
  container: { flex: 1, justifyContent: "flex-end", alignItems: "center", padding: 24, },
  iconContainer: { 
    position: 'absolute', 
    top: '20%', 
    alignItems: 'center', 
    width: '100%',
    // This container acts as the anchor point for the absolute positioning of the small icons
  },

  // --- Wrapper Styles for Animated Icons ---
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
    // Note: The horizontal position for the badge is handled by the parent iconContainer's center
  },

  // --- Static Main Circle ---
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
  
  // --- Text & Button Styles (Unchanged) ---
  appName: { fontSize: 34, fontWeight: "bold", color: COLORS.secondaryGreen, marginBottom: 10, position: 'absolute', bottom: '25%', },
  description: { fontSize: 15, color: '#666', textAlign: "center", marginBottom: 150, paddingHorizontal: 20, position: 'absolute', bottom: '18%', },
  button: { width: '100%', padding: 16, borderRadius: 30, alignItems: 'center', marginBottom: 15, borderWidth: 2, },
  primaryButton: { backgroundColor: COLORS.primaryGreen, borderColor: COLORS.primaryGreen, },
  secondaryButton: { backgroundColor: COLORS.white, borderColor: COLORS.primaryGreen, },
  buttonText: { fontSize: 18, fontWeight: 'bold', },
  primaryButtonText: { color: COLORS.white, },
  secondaryButtonText: { color: COLORS.primaryGreen, }
});