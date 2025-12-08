// screens/ForgotPasswordScreen.tsx

import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TextInput, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert 
} from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Mail } from 'lucide-react-native'; 
import { sendPasswordResetEmail } from 'firebase/auth'; // 🔥 Firebase function
import { auth } from '../firebaseConfig'; // 🔥 Firebase auth instance

const COLORS = {
    primary: '#4CAF50', 
    primaryLight: '#8BC34A', 
    background: '#F9F9F9',
    white: '#FFFFFF',
    text: '#1B5E20', 
    onSurfaceVariant: '#616161', 
    outline: '#E0E0E0',
};

// --- PROP TYPES (REMARK: Defines props passed by the Stack Navigator) ---
type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

// --- Custom Input Component (REMARK: Reusable styled input row) ---
const CustomInput = ({ label, icon: Icon, placeholder, value, onChangeText }: any) => (
    <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputContainer}>
            <Icon size={20} color={COLORS.placeholder} style={styles.inputIcon} />
            <TextInput
                style={styles.inputField}
                placeholder={placeholder}
                placeholderTextColor={COLORS.placeholder}
                value={value}
                onChangeText={onChangeText}
                keyboardType="email-address"
                autoCapitalize="none"
            />
        </View>
    </View>
);


export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
    // REMARK: State for email input, success flag, and loading status
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // --- FIREBASE LOGIC: Send Reset Link ---
    const handleSend = async () => {
        // COMMAND: Basic client-side validation
        if (!email.includes("@") || email.length < 5) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        // COMMAND: Start loading and clear previous errors
        setLoading(true);
        setErrorMessage(null);

        try {
            // COMMAND: Call Firebase Auth service to send the reset email
            await sendPasswordResetEmail(auth, email);
            
            // COMMAND: On success, switch the UI state to show the success message
            setSent(true); 

        } catch (error: any) {
            // COMMAND: Handle and display Firebase errors
            let msg = "Failed to send reset link. Please try again.";
            if (error.code === "auth/user-not-found") {
                msg = "No user found with that email.";
            }
            setErrorMessage(msg);
            
        } finally {
            // COMMAND: End loading state
            setLoading(false);
        }
    };

    return (
        <View style={styles.fullContainer}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                
                {!sent ? (
                    /* --- State 1: Input Form (REMARK: Shows input fields and Send button) --- */
                    <>
                        <View style={styles.introContainer}>
                            <Text style={styles.pageTitle}>Reset Password</Text>
                            <Text style={styles.pageSubtitle}>
                                Enter your email address and we'll send you a link to reset your password
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <CustomInput
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={(t: string) => { setEmail(t); setErrorMessage(null); }}
                                icon={Mail} // REMARK: Mail icon component
                            />
                            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                        </View>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryButton]}
                            onPress={handleSend} // COMMAND: Triggers Firebase reset logic
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    /* --- State 2: Success Message (REMARK: Shows confirmation and back button) --- */
                    <View style={styles.successContainer}>
                        <View style={styles.successIconCircle}>
                            <Mail size={40} color={COLORS.primary} />
                        </View>
                        <Text style={styles.successTitle}>Check Your Email</Text>
                        <Text style={styles.successSubtitle}>
                            We've sent a password reset link to
                            {email && (
                                <Text style={styles.emailHighlight}>
                                    {`\n${email}`}
                                </Text>
                            )}
                        </Text>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryButton, styles.successButton]}
                            onPress={() => navigation.navigate('Login')} // COMMAND: Navigates back to the Login Form
                        >
                            <Text style={styles.primaryButtonText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20, paddingBottom: 50 },

    // --- State 1: Form Styles ---
    // REMARK: Container for title and subtitle
    introContainer: { marginBottom: 30, },
    pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 5, },
    pageSubtitle: { fontSize: 16, color: COLORS.onSurfaceVariant, },
    inputGroup: { marginBottom: 30, },
    inputWrapper: { marginBottom: 15, },
    inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 5, },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.outline,
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: COLORS.white, 
        height: 55,
    },
    inputIcon: { marginRight: 10, },
    inputField: { flex: 1, fontSize: 16, color: COLORS.text, },
    errorText: { color: COLORS.error, marginBottom: 15, textAlign: "center", fontWeight: "500", },

    // --- State 2: Success Styles ---
    // REMARK: Centers the success message content
    successContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    // REMARK: The green circle surrounding the email icon
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 15,
    },
    successSubtitle: {
        fontSize: 16,
        color: COLORS.onSurfaceVariant,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    emailHighlight: {
        color: COLORS.text,
        fontWeight: 'bold',
    },
    successButton: {
        marginTop: 0, 
    },
    
    // --- Buttons ---
    actionButton: {
        width: '100%',
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
});