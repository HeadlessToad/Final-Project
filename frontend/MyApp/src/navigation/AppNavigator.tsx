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


const RewardsScreen = () => null; 

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
                            options={{ headerShown: true, title: "PointsHistory" }}
                        />
                        <Stack.Screen name="Rewards" component={RewardsScreen} options={{ headerShown: true, title: "Rewards Catalog" }} />

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
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}