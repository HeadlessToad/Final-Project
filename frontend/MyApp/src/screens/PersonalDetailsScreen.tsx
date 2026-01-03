// screens/PersonalDetailsScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, Calendar, Heart, ChevronRight } from 'lucide-react-native';

const COLORS = {
    primary: '#4CAF50',
    background: '#FFFFFF',
    text: '#1B5E20',
    placeholder: '#9E9E9E',
    outline: '#E0E0E0',
    white: '#FFFFFF',
    primaryLight: '#8BC34A',
};

type PersonalDetailsProps = NativeStackScreenProps<RootStackParamList, "PersonalDetails">;

// --- COMPONENT: Detail Row ---
// A reusable row component that displays an icon, label, current value, and an arrow.
interface DetailRowProps {
    label: string;
    value: string;
    icon: React.ElementType;
    onPress: () => void;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, icon: Icon, onPress }) => (
    <TouchableOpacity style={styles.detailRowContainer} onPress={onPress}>
        <View style={styles.detailRowLeft}>
            <Icon size={24} color={COLORS.primary} style={styles.detailRowIcon} />
            <View>
                <Text style={styles.detailRowLabel}>{label}</Text>
                {/* Shows the actual value or a placeholder if empty */}
                <Text style={styles.detailRowValue}>{value || 'Not set'}</Text>
            </View>
        </View>
        <ChevronRight size={24} color={COLORS.placeholder} />
    </TouchableOpacity>
);

export default function PersonalDetailsScreen({ navigation }: PersonalDetailsProps) {
    // 1. DATA SOURCE: Get the current user profile from our global AuthContext
    const { profile } = useAuth();

    // 2. DATA PREPARATION: Extract fields safely. If a field is missing, default to 'Not set'.
    // Note: 'fullName' comes from Firebase Auth usually, others are from Firestore.
    const nameValue = profile?.fullName || 'Your Full Name';
    const genderValue = profile?.gender || 'Not set';
    const cityValue = profile?.city || 'Not set';
    const birthDateValue = profile?.birthDate || 'Not set';
    const phoneValue = profile?.phone || 'Not set';

    // Helper: Get just the first name for a friendly greeting (e.g. "Hello John!")
    const greetingName = nameValue.split(' ')[0];

    // 3. NAVIGATION LOGIC: Passes the field name and current value to the Edit Screen.
    const navigateToEdit = (key: 'name' | 'gender' | 'city' | 'birthDate' | 'phone', value: string) => {
        navigation.navigate('EditSingleField', {
            fieldKey: key,
            currentValue: value,
        });
    };

    return (
        <View style={styles.fullContainer}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                {/* --- Greeting Section --- */}
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingTitle}>Hello {greetingName}! 👋</Text>
                    <Text style={styles.greetingSubtitle}>
                        We'd like to get to know you better. Click a detail to update it.
                    </Text>
                </View>

                {/* --- List of Editable Details --- */}
                <Text style={styles.sectionTitle}>Personal Details</Text>

                <View style={styles.detailsGroup}>
                    {/* Name */}
                    <DetailRow
                        label="Name"
                        value={nameValue}
                        icon={User}
                        onPress={() => navigateToEdit('name', nameValue)}
                    />
                    {/* Gender */}
                    <DetailRow
                        label="Gender"
                        value={genderValue}
                        icon={Heart}
                        onPress={() => navigateToEdit('gender', genderValue)}
                    />
                    {/* City */}
                    <DetailRow
                        label="City"
                        value={cityValue}
                        icon={MapPin}
                        onPress={() => navigateToEdit('city', cityValue)}
                    />
                    {/* Birth Date */}
                    <DetailRow
                        label="Birth Date"
                        value={birthDateValue}
                        icon={Calendar}
                        onPress={() => navigateToEdit('birthDate', birthDateValue)}
                    />
                    {/* Phone */}
                    <DetailRow
                        label="Phone"
                        value={phoneValue}
                        icon={Phone}
                        onPress={() => navigateToEdit('phone', phoneValue)}
                    />
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    content: {
        padding: 20,
        paddingBottom: 50,
    },

    // --- Greeting Styles ---
    greetingContainer: {
        backgroundColor: COLORS.primaryLight,
        padding: 15,
        borderRadius: 10,
        marginBottom: 30,
        opacity: 0.9,
    },
    greetingTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 5,
    },
    greetingSubtitle: {
        fontSize: 14,
        color: COLORS.white,
        opacity: 0.8,
    },

    // --- Section Headers ---
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 15,
    },
    
    // --- Card Group Style ---
    detailsGroup: {
        marginBottom: 30,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        overflow: 'hidden', // Ensures inner items don't overflow rounded corners
        borderWidth: 1,
        borderColor: COLORS.outline,
    },

    // --- DetailRow Styles ---
    detailRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.outline,
        backgroundColor: COLORS.white,
    },
    detailRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    detailRowIcon: {
        marginRight: 0,
    },
    detailRowLabel: {
        fontSize: 14,
        color: COLORS.placeholder,
        fontWeight: '500',
    },
    detailRowValue: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
        marginTop: 2,
    },
});