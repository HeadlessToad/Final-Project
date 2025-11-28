import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

// Import Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import WasteClassifier from "../screens/WasteClassifier";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ user, onLogin, onLogout }: any) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // ---------------- AUTHORIZED STACK ----------------
          <>
            <Stack.Screen name="Home">
              {/* Pass navigation props down */}
              {(props) => <HomeScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>

            {/* THE NEW ROUTE */}
            <Stack.Screen
              name="Classify"
              component={WasteClassifier}
              options={{ headerShown: true, title: "Scan Waste" }}
            />
          </>
        ) : (
          // ---------------- UNAUTHORIZED STACK ----------------
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
