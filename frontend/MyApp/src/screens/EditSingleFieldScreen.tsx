// // screens/EditSingleFieldScreen.tsx

// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../types";
// import { useAuth } from '../context/Auth/AuthContext'; // Assuming correct path

// const COLORS = {
//     primary: '#4CAF50', 
//     background: '#FFFFFF',
//     text: '#1B5E20', 
//     outline: '#E0E0E0',
//     white: '#FFFFFF',
//     error: '#F44335',
// };

// type EditSingleFieldProps = NativeStackScreenProps<RootStackParamList, "EditSingleField">;

// // Helper to format title (e.g., 'name' -> 'Edit Name')
// const formatTitle = (key: string) => key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');

// // Helper to determine keyboard type
// const getKeyboardType = (key: string) => {
//     if (key === 'phone') return 'phone-pad';
//     if (key === 'birthDate') return 'numbers-and-punctuation';
//     return 'default';
// };

// export default function EditSingleFieldScreen({ navigation, route }: EditSingleFieldProps) {
//     const { fieldKey, currentValue } = route.params;
//     const [value, setValue] = useState(currentValue);
//     const [loading, setLoading] = useState(false);

//     // Set the native header title dynamically
//     React.useLayoutEffect(() => {
//         navigation.setOptions({
//             title: `Edit ${formatTitle(fieldKey)}`
//         });
//     }, [navigation, fieldKey]);

//     const handleSave = async () => {
//         setLoading(true);
//         // 🔥 ACTUAL SAVE LOGIC WOULD GO HERE (Update Firestore)
//         console.log(`Saving ${fieldKey}: ${value}`);

//         // --- Mock Save Delay ---
//         setTimeout(() => {
//             setLoading(false);
//             alert(`${formatTitle(fieldKey)} updated to: ${value}`);

//             // In a real application, you would pass the new value back to the PersonalDetailsScreen
//             // or simply refetch the user data from Firestore on the previous screen.
//             navigation.goBack(); 
//         }, 1500);
//     };

//     // --- Special Render for Gender (Matching image_b72419.png) ---
//     if (fieldKey === 'gender') {
//         const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

//         return (
//             <View style={styles.fullContainer}>
//                 <View style={styles.optionGroup}>
//                     {genderOptions.map(option => (
//                         <TouchableOpacity
//                             key={option}
//                             style={styles.optionRow}
//                             onPress={() => setValue(option)}
//                         >
//                             <Text style={styles.optionText}>{option}</Text>
//                             <View style={[styles.radioCircle, value === option && styles.radioCircleActive]}>
//                                 {value === option && <View style={styles.radioInner} />}
//                             </View>
//                         </TouchableOpacity>
//                     ))}
//                 </View>
//                 <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
//                     <Text style={styles.saveButtonText}>Save Changes</Text>
//                 </TouchableOpacity>
//             </View>
//         );
//     }

//     // --- Default Render for Name, City, Phone, Date (Matching image_b808fd.png) ---
//     return (
//         <View style={styles.fullContainer}>
//             <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>{formatTitle(fieldKey)}</Text>
//                 <TextInput
//                     style={styles.inputField}
//                     value={value}
//                     onChangeText={setValue}
//                     keyboardType={getKeyboardType(fieldKey)}
//                     placeholder={`Enter new ${fieldKey}`}
//                     autoFocus
//                 />
//             </View>

//             <TouchableOpacity 
//                 style={styles.saveButton} 
//                 onPress={handleSave} 
//                 disabled={loading}
//                 activeOpacity={0.8}
//             >
//                 {loading ? (
//                     <ActivityIndicator color={COLORS.white} />
//                 ) : (
//                     <Text style={styles.saveButtonText}>Save Changes</Text>
//                 )}
//             </TouchableOpacity>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     fullContainer: { flex: 1, backgroundColor: COLORS.background, padding: 20 },

//     // --- Input Styles (for Name, City, etc.) ---
//     inputGroup: {
//         marginBottom: 30,
//         paddingTop: 10,
//     },
//     inputLabel: {
//         fontSize: 14,
//         color: COLORS.text,
//         marginBottom: 5,
//     },
//     inputField: {
//         borderWidth: 1,
//         borderColor: COLORS.outline,
//         borderRadius: 10,
//         padding: 15,
//         backgroundColor: COLORS.white,
//         fontSize: 16,
//         color: COLORS.text,
//     },

//     // --- Save Button (Matches visual style) ---
//     saveButton: {
//         backgroundColor: COLORS.primary,
//         padding: 16,
//         borderRadius: 30, 
//         alignItems: 'center',
//     },
//     saveButtonText: {
//         color: COLORS.white,
//         fontWeight: 'bold',
//         fontSize: 18,
//     },

//     // --- Gender Options Styles ---
//     optionGroup: {
//         marginBottom: 30,
//         paddingTop: 10,
//     },
//     optionRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingVertical: 15,
//         paddingHorizontal: 10,
//         borderWidth: 1,
//         borderColor: COLORS.outline,
//         backgroundColor: COLORS.white,
//         borderRadius: 10,
//         marginBottom: 10,
//     },
//     optionText: {
//         fontSize: 16,
//         color: COLORS.text,
//     },
//     radioCircle: {
//         height: 24,
//         width: 24,
//         borderRadius: 12,
//         borderWidth: 2,
//         borderColor: COLORS.outline,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     radioCircleActive: {
//         borderColor: COLORS.primary,
//     },
//     radioInner: {
//         height: 12,
//         width: 12,
//         borderRadius: 6,
//         backgroundColor: COLORS.primary,
//     },
// });

// screens/EditSingleFieldScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useAuth } from '../context/AuthContext'; // 🔥 Use the correct path
import { doc, updateDoc } from 'firebase/firestore'; // 🔥 NEW Firestore imports
import { db } from '../firebaseConfig'; // 🔥 NEW DB import

const COLORS = {
    primary: '#4CAF50',
    background: '#FFFFFF',
    text: '#1B5E20',
    outline: '#E0E0E0',
    white: '#FFFFFF',
    error: '#F44335',
};

type EditSingleFieldProps = NativeStackScreenProps<RootStackParamList, "EditSingleField">;

// Helper to format title (e.g., 'name' -> 'Edit Name')
const formatTitle = (key: string) => (key === 'fullName' ? 'Full Name' : key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'));

// Helper to determine keyboard type
const getKeyboardType = (key: string) => {
    if (key === 'phone') return 'phone-pad';
    if (key === 'birthDate') return 'numbers-and-punctuation'; // Use a DatePicker component in a real app
    return 'default';
};

export default function EditSingleFieldScreen({ navigation, route }: EditSingleFieldProps) {
    // REMARK: fieldKey here corresponds to the UserProfile keys ('fullName', 'gender', etc.)
    const { fieldKey, currentValue } = route.params;
    const { user, refreshProfile } = useAuth(); // 🔥 Get user UID and refresh function

    const [value, setValue] = useState(currentValue === 'Not set' ? '' : currentValue); // Clear 'Not set' placeholder
    const [loading, setLoading] = useState(false);

    // Set the native header title dynamically
    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: `Edit ${formatTitle(fieldKey)}`
        });
    }, [navigation, fieldKey]);

    const handleSave = async () => {
        if (!user || loading) return;

        // REMARK: Use 'fullName' for the DB key if the UI key is 'name'
        const dbFieldKey = fieldKey === 'name' ? 'fullName' : fieldKey;

        // Basic validation for empty values
        if (!value.trim() && dbFieldKey !== 'gender' && dbFieldKey !== 'birthDate') {
            Alert.alert("Input Required", "Please enter a value or cancel.");
            return;
        }

        setLoading(true);

        try {
            const userDocRef = doc(db, "users", user.uid);

            // 🔥 FIRESTORE UPDATE COMMAND
            await updateDoc(userDocRef, {
                [dbFieldKey]: value, // Dynamically set the key/value pair
            });

            // 🔥 COMMAND: Force AuthContext to reload the latest profile data
            await refreshProfile();

            Alert.alert("Success!", `${formatTitle(dbFieldKey)} updated successfully.`);

            navigation.goBack();
        } catch (error) {
            console.error("Error saving profile field:", error);
            Alert.alert("Error", "Failed to save changes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- Special Render for Gender (Matching image_b72419.png) ---
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

    // --- Default Render for Name, City, Phone, Date ---
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
                disabled={loading || value === currentValue} // Disable if nothing changed or loading
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

    // --- Input Styles (for Name, City, etc.) ---
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

    // --- Save Button (Matches visual style) ---
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

    // --- Gender Options Styles ---
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