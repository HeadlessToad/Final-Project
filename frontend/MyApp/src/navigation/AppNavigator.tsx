// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../types";

// // Import Screens
// import LoginScreen from "../screens/LoginScreen";
// import RegisterScreen from "../screens/RegisterScreen";
// import HomeScreen from "../screens/HomeScreen(tyota)";
// import WasteClassifier from "../screens/WasteClassifier";

// const Stack = createNativeStackNavigator<RootStackParamList>();

// export default function AppNavigator({ user, onLogin, onLogout }: any) {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {user ? (
//           // ---------------- AUTHORIZED STACK ----------------
//           <>
//             <Stack.Screen name="Home">
//               {/* Pass navigation props down */}
//               {(props) => <HomeScreen {...props} onLogout={onLogout} />}
//             </Stack.Screen>

//             {/* THE NEW ROUTE */}
//             <Stack.Screen
//               name="Classify"
//               component={WasteClassifier}
//               options={{ headerShown: true, title: "Scan Waste" }}
//             />
//           </>
//         ) : (
//           // ---------------- UNAUTHORIZED STACK ----------------
//           <>
//             <Stack.Screen name="Login">
//               {(props) => <LoginScreen {...props} onLogin={onLogin} />}
//             </Stack.Screen>
//             <Stack.Screen name="Register" component={RegisterScreen} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
// src/navigation/AppNavigator.tsx

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
import TempHomeScreen from "../screens/ProfileScreen"; // ADD THIS IMPORT

// TEMP/Placeholder Screens
const ProfileScreen = () => null; 
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
                        {/* <Stack.Screen name="Classify" component={WasteClassifier} options={{ headerShown: true, title: "Scan Waste" }} /> */}
                        {/* ... ClassificationResults, Profile, Rewards ... */}
                        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: "My Profile" }} />
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