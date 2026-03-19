// src/navigation/AppNavigator.tsx
// ============================================================================
// COMPONENT PURPOSE:
// This is the root navigator of the application. It uses React Navigation to 
// manage the stack of screens. It implements an "Authentication Flow", meaning 
// it conditionally renders different screens based on whether the user is 
// logged in or not. This prevents unauthorized users from accessing the app.
// ============================================================================

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { User } from "firebase/auth";

// --- Import all Screens and Components ---
// Unauthorized flow screens
import WelcomeScreen from "../screens/WelcomeScreen"; 
import LoginScreen from "../screens/LoginScreen";     
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

// Authorized flow screens (Main App)
import HomeScreen from "../screens/HomeScreen";       
import ProfileScreen from "../screens/ProfileScreen";
import PersonalDetailsScreen from "../screens/PersonalDetailsScreen";
import EditSingleFieldScreen from "../screens/EditSingleFieldScreen";
import ClassificationHistoryScreen from "../screens/ClassificationHistoryScreen";
import PointsHistoryScreen from "../screens/PointsHistoryScreen";
import RewardsScreen from "../screens/RewardsScreen";
import RewardDetailsScreen from "../screens/RewardDetailsScreen";
import ScanScreen from "../screens/ScanScreen";
import ClassificationResultScreen from "../screens/ClassificationResultScreen";
import RecyclingCentersScreen from "../screens/RecyclingCentersScreen";
import CommunityReviewScreen from "../screens/CommunityReviewScreen";

// Initialize the Stack Navigator with our predefined parameter list (for type safety)
const Stack = createNativeStackNavigator<RootStackParamList>();

// Props expected by the AppNavigator, usually passed down from the root App component
interface AppNavigatorProps {
    user: User | null;             // The current Firebase Auth user object
    role: "admin" | "user" | null; // The user's role (currently unused in routing, but ready for future admin screens)
}

export default function AppNavigator({ user, role }: AppNavigatorProps) {
    return (
        <NavigationContainer>
            {/* By default, we hide the top header bar for a cleaner look. 
                Specific screens that need a back button/title will override this below.
            */}
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                
                {/* CONDITIONAL ROUTING LOGIC:
                    If a 'user' object exists, render the private app screens.
                    If 'user' is null, render only the login/signup screens.
                */}
                {user ? (
                    // ---------------- AUTHORIZED STACK ----------------
                    // These screens are only accessible to logged-in users.
                    <>
                        {/* Core Dashboard / Main Menu */}
                        <Stack.Screen name="Home" component={HomeScreen} />
                        
                        {/* User Profile & Settings Flow */}
                        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: "My Profile" }} />
                        <Stack.Screen
                            name="PersonalDetails"
                            component={PersonalDetailsScreen}
                            options={{ headerShown: true, title: "Personal Details" }}
                        />
                        <Stack.Screen
                            name="EditSingleField"
                            component={EditSingleFieldScreen}
                            options={{ headerShown: true }} // Title is set dynamically inside the component
                        />
                        
                        {/* History & Statistics */}
                        <Stack.Screen
                            name="ClassificationHistory"
                            component={ClassificationHistoryScreen}
                            options={{ headerShown: true, title: "Classification History" }}
                        />
                        <Stack.Screen
                            name="PointsHistory"
                            component={PointsHistoryScreen}
                            options={{ headerShown: true, title: "Points History" }}
                        />

                        {/* Gamification & Rewards Flow */}
                        <Stack.Screen name="Rewards" component={RewardsScreen} options={{ headerShown: true, title: "Rewards Catalog" }} />
                        <Stack.Screen
                            name="RewardDetails"
                            component={RewardDetailsScreen}
                            options={{ headerShown: true, title: "Reward Details" }}
                        />
                        
                        {/* Core App Feature: Camera & Scanning Flow */}
                        <Stack.Screen
                            name="ScanScreen"
                            component={ScanScreen}
                            options={{ headerShown: false }} // Keep header hidden for full-screen camera
                        />
                        <Stack.Screen
                            name="ClassificationResult"
                            component={ClassificationResultScreen}
                            options={{ headerShown: true, title: "Classification Result" }}
                        />
                        
                        {/* Map & Locations */}
                        <Stack.Screen
                            name="RecyclingCenters"
                            component={RecyclingCentersScreen}
                            options={{ headerShown: true, title: "Recycling Centers" }}
                        />

                        {/* Community Features */}
                        <Stack.Screen
                            name="CommunityReview"
                            component={CommunityReviewScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                ) : (
                    // ---------------- UNAUTHORIZED STACK ----------------
                    // These screens handle user onboarding and authentication.
                    // Once the user logs in, React Navigation automatically unmounts 
                    // these screens and mounts the Authorized Stack above.
                    <>
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />
                        
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ headerShown: true, title: "Sign In" }}
                        />

                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                            options={{ headerShown: true, title: "Create Account" }}
                        />
                        
                        <Stack.Screen 
                            name="ForgotPassword" 
                            component={ForgotPasswordScreen} 
                            options={{ headerShown: true, title: "Forgot Password" }} 
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}