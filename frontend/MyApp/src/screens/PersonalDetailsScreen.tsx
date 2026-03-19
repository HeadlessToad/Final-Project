// screens/PersonalDetailsScreen.tsx
// ============================================================================
// COMPONENT PURPOSE:
// Displays the user's personal information fetched from the global AuthContext.
// It renders a list of interactive rows. Clicking a row navigates the user to
// the 'EditSingleFieldScreen', passing the field key and current value so the 
// user can update their details in Firestore.
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, Calendar, Heart, ChevronRight } from 'lucide-react-native';

// Centralized color palette
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

// ----------------------------------------------------------------------------
// COMPONENT: DetailRow
// ----------------------------------------------------------------------------
// A reusable, stateless sub-component that renders a single row in the details list.
// It displays an icon, a label (e.g., "City"), the current value, and a chevron arrow.
interface DetailRowProps {
    label: string;
    value: string;
    icon: React.ElementType; // Type for Lucide icons
    onPress: () => void;     // Callback triggered when the row is tapped
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, icon: Icon, onPress }) => (
    <TouchableOpacity style={styles.detailRowContainer} onPress={onPress}>
        <View style={styles.detailRowLeft}>
            <Icon size={24} color={COLORS.primary} style={styles.detailRowIcon} />
            <View>
                <Text style={styles.detailRowLabel}>{label}</Text>
                {/* Shows the actual value or a fallback placeholder if the DB field is empty */}
                <Text style={styles.detailRowValue}>{value || 'Not set'}</Text>
            </View>
        </View>
        <ChevronRight size={24} color={COLORS.placeholder} />
    </TouchableOpacity>
);

export default function PersonalDetailsScreen({ navigation }: PersonalDetailsProps) {
    // --------------------------------------------------------------------------
    // DATA SOURCE
    // --------------------------------------------------------------------------
    // Get the current user profile from our global AuthContext (which syncs with Firestore)
    const { profile } = useAuth();

    // --------------------------------------------------------------------------
    // DATA PREPARATION
    // --------------------------------------------------------------------------
    // Extract fields safely. If a field is missing or null in Firestore, default to 'Not set'.
    // Note: 'fullName' usually originates from Firebase Auth (Google/Email signup).
    const nameValue = profile?.fullName || 'Your Full Name';
    const genderValue = profile?.gender || 'Not set';
    const cityValue = profile?.city || 'Not set';
    const birthDateValue = profile?.birthDate || 'Not set';
    const phoneValue = profile?.phone || 'Not set';

    // Helper: Extract just the first name for a friendly, personalized UI greeting (e.g., "Hello John!")
    const greetingName = nameValue.split(' ')[0];

    // --------------------------------------------------------------------------
    // NAVIGATION LOGIC
    // --------------------------------------------------------------------------
    // Navigates to the dynamic editing screen.
    // We pass the exact database key (e.g., 'city') and the current value so the 
    // edit screen knows what to display and which Firestore field to update.
    const navigateToEdit = (key: 'name' | 'gender' | 'city' | 'birthDate' | 'phone', value: string) => {
        navigation.navigate('EditSingleField', {
            fieldKey: key,
            currentValue: value,
        });
    };

    // --------------------------------------------------------------------------
    // MAIN RENDER
    // --------------------------------------------------------------------------
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

                {/* Group wrapper for styling borders and rounded corners around the rows */}
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

// ============================================================================
// STYLESHEET
// ============================================================================
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
    
    // --- Card Group Style (Wraps all DetailRows) ---
    detailsGroup: {
        marginBottom: 30,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        overflow: 'hidden', // Ensures inner rows don't clip over the rounded corners
        borderWidth: 1,
        borderColor: COLORS.outline,
    },

    // --- DetailRow Component Styles ---
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