// screens/EditSingleFieldScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useAuth } from '../context/AuthContext'; 
import { doc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebaseConfig';
import Toast from 'react-native-toast-message';

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
// Purpose: Makes the header look nice (e.g., converts "fullName" -> "Full Name")
const formatTitle = (key: string) => (key === 'fullName' ? 'Full Name' : key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'));

// Purpose: Shows the right keyboard (numbers for phone, text for name)
const getKeyboardType = (key: string) => {
    if (key === 'phone') return 'phone-pad';
    if (key === 'birthDate') return 'numbers-and-punctuation'; 
    return 'default';
};

export default function EditSingleFieldScreen({ navigation, route }: EditSingleFieldProps) {
    // 1. GET PARAMS: We receive which field to edit (e.g., 'city') and its current value
    const { fieldKey, currentValue } = route.params;
    const { user, refreshProfile } = useAuth(); 

    // 2. STATE: 'value' holds what the user is typing right now
    const [value, setValue] = useState(currentValue === 'Not set' ? '' : currentValue); 
    const [loading, setLoading] = useState(false);

    // 3. DYNAMIC HEADER: Sets the top bar title based on what we are editing
    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: `Edit ${formatTitle(fieldKey)}`
        });
    }, [navigation, fieldKey]);

    // 4. SAVE FUNCTION: This is the main logic
    const handleSave = async () => {
        if (!user || loading) return;

        // Map 'name' from UI to 'fullName' in Database
        const dbFieldKey = fieldKey === 'name' ? 'fullName' : fieldKey;

        // Validation: Don't allow empty names/cities (Gender is optional)
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

            // Step B: Send the update to Firebase
            // [dbFieldKey] allows us to dynamically update "city", "phone", etc.
            await updateDoc(userDocRef, {
                [dbFieldKey]: value, 
            });

            // Step C: Update the local app state immediately so the Profile screen updates
            await refreshProfile();

            //  TOAST SUCCESS: Smooth banner instead of ugly Alert
            Toast.show({
                type: 'success',
                text1: 'Success!',
                text2: `${formatTitle(dbFieldKey)} updated successfully.`,
                position: 'top',
                visibilityTime: 2000,
            });

            // Step D: Go back to the previous screen after a short delay
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
                            {/* Custom Radio Button Circle */}
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
                    autoFocus
                />
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
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

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background, padding: 20 },

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

    // --- Gender Styles ---
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
    radioCircle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.outline,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleActive: {
        borderColor: COLORS.primary,
    },
    radioInner: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
});