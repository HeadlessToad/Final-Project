// screens/SettingsScreen.tsx

import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Platform,
    Switch, // Used for the theme toggle slider
} from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { 
    Sun, Moon, Bell, Globe, HelpCircle, Shield, LogOut, ChevronRight 
} from 'lucide-react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';


const COLORS = {
    primary: '#4CAF50', // Green
    background: '#F9F9F9',
    white: '#FFFFFF',
    text: '#1B5E20', // Dark Green Text
    onSurfaceVariant: '#616161', // Gray text for details
    outline: '#E0E0E0',
    surfaceVariant: '#F0F0F0', // Card surface
    error: '#F44336',
};

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, "Settings">;

// --- Setting Item Component ---
interface SettingItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onPress?: () => void;
    hasToggle?: boolean;
    isToggleActive?: boolean;
    onToggle?: (value: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, onPress, hasToggle, isToggleActive, onToggle }) => {
    
    // Determine if the entire row should be clickable
    const isClickable = onPress || !hasToggle;

    const content = (
        <View style={styles.settingItemContent}>
            <View style={styles.settingItemIconContainer}>{icon}</View>
            <View style={styles.settingItemTextContainer}>
                <Text style={styles.settingItemTitle}>{title}</Text>
                <Text style={styles.settingItemDescription}>{description}</Text>
            </View>
            
            {hasToggle && (
                <Switch
                    trackColor={{ false: COLORS.outline, true: COLORS.primary }}
                    thumbColor={COLORS.white}
                    ios_backgroundColor={COLORS.outline}
                    onValueChange={onToggle}
                    value={isToggleActive}
                />
            )}
            {!hasToggle && isClickable && <ChevronRight size={20} color={COLORS.onSurfaceVariant} />}
        </View>
    );

    if (isClickable) {
        return (
            <TouchableOpacity onPress={onPress || (() => {})} style={styles.settingItemRow} activeOpacity={onPress ? 0.6 : 1}>
                {content}
            </TouchableOpacity>
        );
    }
    return <View style={styles.settingItemRow}>{content}</View>;
};


export default function SettingsScreen({ navigation }: SettingsScreenProps) {
    // State to simulate theme
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

    const onToggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const handleLogout = () => {
        // Log out logic
        signOut(auth); 
        // navigation will automatically switch to Welcome
    };
    
    const handleNavigation = (route: keyof RootStackParamList) => {
        navigation.navigate(route as any);
    };

    return (
        <View style={styles.fullContainer}>
            {/* Native stack header handles 'Settings' title and back button */}

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* --- Theme Toggle --- */}
                <View style={styles.card}>
                    <SettingItem
                        icon={theme === 'light' ? <Sun size={20} color={COLORS.onSurfaceVariant} /> : <Moon size={20} color={COLORS.onSurfaceVariant} />}
                        title="Theme"
                        description={theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                        hasToggle
                        isToggleActive={theme === 'dark'}
                        onToggle={onToggleTheme}
                    />
                </View>

                {/* --- Preferences --- */}
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={[styles.card, styles.noPaddingCard]}>
                    <SettingItem
                        icon={<Bell size={20} color={COLORS.onSurfaceVariant} />}
                        title="Notifications"
                        description="Manage notification preferences"
                        hasToggle
                        isToggleActive={isNotificationEnabled}
                        onToggle={setIsNotificationEnabled}
                    />
                    <SettingItem
                        icon={<Globe size={20} color={COLORS.onSurfaceVariant} />}
                        title="Language"
                        description="English"
                        onPress={() => alert('Change language modal')}
                    />
                </View>

                {/* --- Support --- */}
                <Text style={styles.sectionTitle}>Support</Text>
                <View style={[styles.card, styles.noPaddingCard]}>
                    <SettingItem
                        icon={<HelpCircle size={20} color={COLORS.onSurfaceVariant} />}
                        title="Help & FAQ"
                        description="Get help and support"
                        onPress={() => alert('Navigate to Help Page')}
                    />
                    <SettingItem
                        icon={<Shield size={20} color={COLORS.onSurfaceVariant} />}
                        title="Privacy Policy"
                        description="View our privacy policy"
                        onPress={() => alert('Show Privacy Policy')}
                    />
                </View>

                {/* --- App Info --- */}
                <View style={[styles.card, styles.centerCard]}>
                    <Text style={styles.appInfoVersion}>GreenMind v1.0.0</Text>
                    <Text style={styles.appInfoMotto}>
                        Making the world greener, one scan at a time 🌱
                    </Text>
                </View>

                {/* --- Logout Button --- */}
                <TouchableOpacity
                    style={styles.logoutButtonFinal}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <LogOut size={20} color={COLORS.error} />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20, paddingBottom: 50 },
    
    // --- Card Styles ---
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        marginBottom: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    noPaddingCard: {
        padding: 0,
        overflow: 'hidden',
    },
    centerCard: {
        alignItems: 'center',
        paddingVertical: 20,
    },

    // --- Section Titles ---
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
        marginTop: 10,
        paddingHorizontal: 5,
    },

    // --- Setting Item Row Styles ---
    settingItemRow: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.outline,
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
    },
    settingItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingItemIconContainer: {
        marginRight: 15,
    },
    settingItemTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    settingItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    settingItemDescription: {
        fontSize: 13,
        color: COLORS.onSurfaceVariant,
        marginTop: 2,
    },
    
    // --- App Info Styles ---
    appInfoVersion: {
        fontSize: 14,
        color: COLORS.onSurfaceVariant,
        marginBottom: 3,
    },
    appInfoMotto: {
        fontSize: 12,
        color: COLORS.onSurfaceVariant,
    },
    
    // --- Logout Button ---
    logoutButtonFinal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.error,
        padding: 15,
        borderRadius: 30,
        gap: 10,
        marginTop: 10,
    },
    logoutButtonText: {
        color: COLORS.error,
        fontSize: 18,
        fontWeight: 'bold',
    }
});