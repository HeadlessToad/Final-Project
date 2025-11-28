import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Import Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// We accept 'user' as a prop to decide which stack to show
export default function AppNavigator({ user, onLogin, onLogout }: any) {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    // ---------------- AUTHORIZED STACK ----------------
                    // If user exists, they can ONLY see Home
                    <Stack.Screen name="Home">
                        {() => <HomeScreen onLogout={onLogout} />}
                    </Stack.Screen>
                ) : (
                    // ---------------- UNAUTHORIZED STACK ----------------
                    // If no user, they can ONLY see Login/Register
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