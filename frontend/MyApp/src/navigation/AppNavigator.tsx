// src/navigation/AppNavigator.tsx (Revised for cleaner naming)

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { User } from "firebase/auth";

// --- Import all Screens and Components ---
import WelcomeScreen from "../screens/WelcomeScreen"; // Renamed splash file
import LoginScreen from "../screens/LoginScreen";     // Your Login form component (File name kept)
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";       // Your new graphical home page
import ProfileScreen from "../screens/ProfileScreen";
import PersonalDetailsScreen from "../screens/PersonalDetailsScreen";
import EditSingleFieldScreen from "../screens/EditSingleFieldScreen";
import ClassificationHistoryScreen from "../screens/ClassificationHistoryScreen";
import PointsHistoryScreen from "../screens/PointsHistoryScreen";
import RewardsScreen from "../screens/RewardsScreen";
import RewardDetailsScreen from "../screens/RewardDetailsScreen";
// import SettingsScreen from "../screens/SettingsScreen";
import ScanScreen from "../screens/ScanScreen";
import ClassificationResultScreen from "../screens/ClassificationResultScreen";
import RecyclingCentersScreen from "../screens/RecyclingCentersScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
    user: User | null;
    role: "admin" | "user" | null;
}

export default function AppNavigator({ user, role }: AppNavigatorProps) {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    // ---------------- AUTHORIZED STACK (Unchanged) ----------------
                    <>
                        {/* HOME SCREEN (The entry point for logged-in users) */}
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: "My Profile" }} />
                        <Stack.Screen
                            name="PersonalDetails" // 🔥 The route name used in ProfileScreen.tsx
                            component={PersonalDetailsScreen} // 🔥 The component file
                            options={{ headerShown: true, title: "Personal Details" }}
                        />
                        <Stack.Screen
                            name="ClassificationHistory" // The route name used in ProfileScreen.tsx
                            component={ClassificationHistoryScreen}
                            options={{ headerShown: true, title: "Classification History" }}
                        />
                        <Stack.Screen
                            name="EditSingleField" // 🔥 NEW ROUTE
                            component={EditSingleFieldScreen}
                            // Title will be set dynamically in the component using useLayoutEffect
                            options={{ headerShown: true }}
                        />
                        <Stack.Screen
                            name="PointsHistory"
                            component={PointsHistoryScreen}
                            options={{ headerShown: true, title: "Points History" }}
                        />
                        <Stack.Screen name="Rewards" component={RewardsScreen} options={{ headerShown: true, title: "Rewards Catalog" }} />
                        <Stack.Screen
                            name="RewardDetails" // 🔥 NEW ROUTE
                            component={RewardDetailsScreen}
                            options={{ headerShown: true, title: "Reward Details" }}
                        />
                        <Stack.Screen
                            name="ScanScreen" // <-- Must match the string used in handleNavigation
                            component={ScanScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ClassificationResult"
                            component={ClassificationResultScreen}
                            options={{ headerShown: true, title: "Classification Result" }}
                        />
                        <Stack.Screen
                            name="RecyclingCenters"
                            component={RecyclingCentersScreen}
                            options={{ headerShown: true, title: "Recycling Centers" }}
                        />
                
                        {/* <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: "Settings" }} /> */}
                    </>
                ) : (
                    // ---------------- UNAUTHORIZED STACK (Simplified) ----------------
                    <>
                        {/* 1. WELCOME/SPLASH SCREEN (Initial screen for unauthorized users) */}
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />

                        {/* 2. LOGIN FORM (The file named LoginScreen.tsx) */}
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen} // Component named LoginScreen.tsx
                            options={{ headerShown: true, title: "Sign In" }}
                        />

                        {/* 3. REGISTER FORM */}
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                            options={{ headerShown: true, title: "Create Account" }}
                        />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, title: "Forgot Password" }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}