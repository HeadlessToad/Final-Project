// src/navigation/RootNavigation.tsx

import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { styled } from 'nativewind';
// You'll need to import useAuth and types here too, but for simplicity, focusing on screens:

// --- Import ALL Screen Components ---
// NOTE: Ensure your paths are correct (e.g., '../screens/ScreenName').

import { WelcomeScreen } from '../screens/WelcomeScreen'; 
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ClassificationResultScreen } from '../screens/ClassificationResultScreen';
import { RecyclingCentersScreen } from '../screens/RecyclingCentersScreen';
import { RewardsCatalogScreen } from '../screens/RewardCatalogScreen';
import { RewardDetailsScreen } from '../screens/RewardDetailsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ClassificationHistoryScreen } from '../screens/ClassificationHistoryScreen';
import { PointsHistoryScreen } from '../screens/PointsHistoryScreen';
import { SettingsScreen } from '../screens/SettingScreen';
import { FeedbackScreen } from '../screens/FeedBackScreen';

// --- Create the Stack Navigator ---
const Stack = createNativeStackNavigator();

function InitialRouter() {
    // ... (Loading/Auth logic would go here)
    
    return (
        <Stack.Navigator
            initialRouteName="WelcomeScreen"
            screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: 'white' }
            }}
        >
            {/* --- COMPLETE APPLICATION STACK --- */}
            <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="ScanScreen" component={ScanScreen} />
            <Stack.Screen name="ClassificationResultScreen" component={ClassificationResultScreen} />
            <Stack.Screen name="RecyclingCentersScreen" component={RecyclingCentersScreen} />
            <Stack.Screen name="RewardsCatalogScreen" component={RewardsCatalogScreen} />
            <Stack.Screen name="RewardDetailsScreen" component={RewardDetailsScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
            <Stack.Screen name="ClassificationHistoryScreen" component={ClassificationHistoryScreen} />
            <Stack.Screen name="PointsHistoryScreen" component={PointsHistoryScreen} />
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
            <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
        </Stack.Navigator>
    );
}

export default InitialRouter;