// screens/EditSingleFieldScreen.tsx
// ============================================================================
// COMPONENT PURPOSE:
// A highly reusable screen designed to edit a single user profile field.
// Instead of creating multiple screens (EditName, EditPhone, etc.), this single
// screen dynamically adapts its UI, keyboard type, and Firestore update logic 
// based on the 'fieldKey' passed to it via navigation parameters.
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useAuth } from '../context/AuthContext'; 
import { doc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebaseConfig';
import Toast from 'react-native-toast-message';

// Centralized color palette
const COLORS = {
    primary: '#4CAF50',
    background: '#FFFFFF',
    text: '#1B5E20',
    outline: '#E0E0E0',
    white: '#FFFFFF',
    error: '#F44335',
};

type EditSingleFieldProps = NativeStackScreenProps<RootStackParamList, "EditSingleField">;

// --- HELPER FUNCTIONS ---

// Purpose: Converts camelCase object keys into readable titles for the Header.
// Example: "fullName" -> "Full Name", "birthDate" -> "Birth Date"
const formatTitle = (key: string) => (key === 'fullName' ? 'Full Name' : key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'));

// Purpose: Optimizes User Experience (UX) by opening the correct native keyboard.
// Example: Opens the numpad directly when editing a phone number.
const getKeyboardType = (key: string) => {
    if (key === 'phone') return 'phone-pad';
    if (key === 'birthDate') return 'numbers-and-punctuation'; 
    return 'default';
};

export default function EditSingleFieldScreen({ navigation, route }: EditSingleFieldProps) {
    // 1. GET PARAMS: Receive which field to edit (e.g., 'city') and its current value from the Profile screen
    const { fieldKey, currentValue } = route.params;
    
    // Pull the authenticated user and the profile refresh function from global state
    const { user, refreshProfile } = useAuth(); 

    // 2. STATE: 'value' holds the live text input. If the DB had "Not set", default to empty string.
    const [value, setValue] = useState(currentValue === 'Not set' ? '' : currentValue); 
    const [loading, setLoading] = useState(false);

    // 3. DYNAMIC HEADER: Updates the native navigation top bar title based on the field being edited
    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: `Edit ${formatTitle(fieldKey)}`
        });
    }, [navigation, fieldKey]);

    // 4. SAVE FUNCTION: The core logic to write changes to Firestore
    const handleSave = async () => {
        if (!user || loading) return;

        // DB Mapping: The UI might use 'name', but the Firestore schema expects 'fullName'
        const dbFieldKey = fieldKey === 'name' ? 'fullName' : fieldKey;

        // Validation: Prevent users from saving completely empty strings for critical fields.
        // Gender and birthDate are allowed to be skipped depending on the flow.
        if (!value.trim() && dbFieldKey !== 'gender' && dbFieldKey !== 'birthDate') {
            Toast.show({
                type: 'error',
                text1: 'Input Required',
                text2: 'Please enter a value.'
            });
            return;
        }

        setLoading(true);

        try {
            // Step A: Reference the specific user document in Firestore
            const userDocRef = doc(db, "users", user.uid);

            // Step B: Send the update to Firebase using computed property names [dbFieldKey]
            await updateDoc(userDocRef, {
                [dbFieldKey]: value, 
            });

            // Step C: Trigger a re-fetch in the AuthContext so the Profile screen instantly reflects the change
            await refreshProfile();

            // Step D: Show a smooth success banner
            Toast.show({
                type: 'success',
                text1: 'Success!',
                text2: `${formatTitle(dbFieldKey)} updated successfully.`,
                position: 'top',
                visibilityTime: 2000,
            });

            // Step E: Navigate back to the Profile screen after a slight delay to allow the Toast to be seen
            setTimeout(() => navigation.goBack(), 500);
            
        } catch (error) {
            console.error("Error saving profile field:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to save changes.'
            });
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER 1: SPECIAL UI FOR GENDER SELECTION ---
    // If the field is 'gender', we don't want a text input. We want a predefined list of radio buttons.
    if (fieldKey === 'gender') {
        const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

        return (
            <View style={styles.fullContainer}>
                <View style={styles.optionGroup}>
                    {genderOptions.map(option => (
                        <TouchableOpacity
                            key={option}
                            style={styles.optionRow}
                            onPress={() => setValue(option)}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                            {/* Custom Radio Button UI rendering logic */}
                            <View style={[styles.radioCircle, value === option && styles.radioCircleActive]}>
                                {value === option && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // --- RENDER 2: STANDARD TEXT INPUT FOR EVERYTHING ELSE ---
    // For names, cities, phone numbers, etc.
    return (
        <View style={styles.fullContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{formatTitle(fieldKey)}</Text>
                <TextInput
                    style={styles.inputField}
                    value={value}
                    onChangeText={setValue}
                    keyboardType={getKeyboardType(fieldKey)}
                    placeholder={`Enter new ${fieldKey}`}
                    autoFocus // Automatically pops up the keyboard when the screen opens
                />
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                // Disable the save button if saving is in progress OR if the user hasn't changed the original text
                disabled={loading || value === currentValue} 
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background, padding: 20 },

    // Standard Input Styles
    inputGroup: {
        marginBottom: 30,
        paddingTop: 10,
    },
    inputLabel: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 5,
    },
    inputField: {
        borderWidth: 1,
        borderColor: COLORS.outline,
        borderRadius: 10,
        padding: 15,
        backgroundColor: COLORS.white,
        fontSize: 16,
        color: COLORS.text,
    },

    // Save Button Styles
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 18,
    },

    // --- Gender Selection (Radio Button) Styles ---
    optionGroup: {
        marginBottom: 30,
        paddingTop: 10,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: COLORS.outline,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        marginBottom: 10,
    },
    optionText: {
        fontSize: 16,
        color: COLORS.text,
    },
    
    // Outer circle of the custom radio button
    radioCircle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.outline,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Highlights the outer circle when selected
    radioCircleActive: {
        borderColor: COLORS.primary,
    },
    // Inner filled circle when selected
    radioInner: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
});