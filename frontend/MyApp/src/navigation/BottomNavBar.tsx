import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Home, Recycle, Gift, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const COLORS = {
    primary: '#4CAF50',
    white: '#FFFFFF',
    onSurfaceVariant: '#616161',
    outline: '#E0E0E0',
};

// Define the navigation type for the component's internal handler
type BottomNavNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// --- NavButton Component (Reused) ---
interface NavButtonProps {
    IconComponent: React.ElementType;
    label: string;
    active: boolean;
    onPress: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ IconComponent, label, active, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={navStyles.navButton}
    >
        <IconComponent
            size={24}
            color={active ? COLORS.primary : COLORS.onSurfaceVariant}
        />
        <Text style={[
            navStyles.navButtonLabel,
            { color: active ? COLORS.primary : COLORS.onSurfaceVariant }
        ]}>
            {label}
        </Text>
    </TouchableOpacity>
);

interface BottomNavBarProps {
    currentRoute: 'Home' | 'RecyclingCenters' | 'Rewards' | 'Profile';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentRoute }) => {
    const navigation = useNavigation<BottomNavNavigationProp>();

    // Map current route names to the simple tab names used internally
    const currentTab = {
        'Home': 'home',
        'RecyclingCenters': 'centers',
        'Rewards': 'rewards',
        'Profile': 'profile',
    }[currentRoute] || 'home';

    const handleTabChange = (tabName: 'home' | 'centers' | 'rewards' | 'profile') => {
        const routeMap: Record<string, keyof RootStackParamList> = {
            'home': 'Home',
            'centers': 'RecyclingCenters',
            'rewards': 'Rewards',
            'profile': 'Profile',
        };
        // Command: Navigate to the corresponding stack screen
        navigation.replace(routeMap[tabName] as any);
    };

    return (
        <View style={navStyles.bottomNav}>
            <NavButton IconComponent={Home} label="Home" active={currentTab === 'home'} onPress={() => handleTabChange('home')} />
            <NavButton IconComponent={Recycle} label="Centers" active={currentTab === 'centers'} onPress={() => handleTabChange('centers')} />
            <NavButton IconComponent={Gift} label="Rewards" active={currentTab === 'rewards'} onPress={() => handleTabChange('rewards')} />
            <NavButton IconComponent={User} label="Profile" active={currentTab === 'profile'} onPress={() => handleTabChange('profile')} />
        </View>
    );
};

const navStyles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.outline,
        paddingVertical: 5,
        height: Platform.OS === 'ios' ? 80 : 65,
        alignItems: 'center',
    },
    navButton: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
        paddingVertical: 0,
    },
    navButtonLabel: {
        fontSize: 12,
        marginTop: 0,
        fontWeight: '500',
    },
});