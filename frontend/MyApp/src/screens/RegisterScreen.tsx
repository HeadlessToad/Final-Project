// screens/RegisterScreen.tsx
// ============================================================================
// COMPONENT PURPOSE:
// Provides the UI for new users to create an account. It collects their name, 
// email, and password. It validates the input, creates a Firebase Auth user, 
// updates their display profile, and creates their initial Firestore document
// with a login timestamp to integrate with the Session Expiration logic.
// ============================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { User, Mail, Lock } from 'lucide-react-native';
import Toast from 'react-native-toast-message'; // 🔥 IMPORT TOAST

// Centralized color palette
const COLORS = {
  primary: '#4CAF50',
  background: '#FFFFFF',
  text: '#1B5E20',
  placeholder: '#9E9E9E',
  outline: '#E0E0E0',
  error: '#F44335',
  surfaceVariant: '#F0F0F0',
};

type RegisterProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
};

// ----------------------------------------------------------------------------
// COMPONENT: CustomInput
// ----------------------------------------------------------------------------
// A reusable component to keep the main render code clean and DRY. 
// It standardizes the layout of the label, icon, and text input field.
const CustomInput = ({ label, icon: Icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, onFocus }: any) => (
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
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={onFocus}
      />
    </View>
  </View>
);

export default function RegisterScreen({ navigation }: RegisterProps) {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scroll ref helps us scroll to the bottom of the view if the native keyboard 
  // pops up and covers the lower input fields.
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Triggered when an input field gains focus. Animates the scroll view down.
  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  // --------------------------------------------------------------------------
  // REGISTRATION LOGIC
  // --------------------------------------------------------------------------
  const handleRegister = async () => {
    // 1. Validation (Frontend logic checks before wasting network requests)
    if (!fullName.trim()) { setErrorMessage("Please enter your full name."); return; }
    if (password.length < 6) { setErrorMessage("Password must be at least 6 characters long."); return; }
    if (password !== confirmPassword) { setErrorMessage("Passwords do not match."); return; }
    if (!email.includes("@")) { setErrorMessage("Please enter a valid email address."); return; }

    setLoading(true);
    setErrorMessage(null); // Clear previous errors

    try {
      // 2. Create User in Firebase Auth
      // This securely creates the account (email/password) in Google Identity Platform
      // but it doesn't attach the "FullName" metadata yet.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 3. Update Profile
      // Attach the "Full Name" to the auth user we just created.
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      // 4. Save login timestamp to Firestore
      // This is crucial! We set the `lastLoginTimestamp` right away so the AuthContext
      // knows when the session started for cross-device expiration logic.
      // We use { merge: true } just in case a cloud function creates this doc simultaneously.
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, { lastLoginTimestamp: Date.now() }, { merge: true });

      // 5. Success Feedback
      Toast.show({
        type: 'success',
        text1: 'Success! 🎉',
        text2: 'Account created. Welcome to GreenMind!',
        position: 'top',
        topOffset: 60
      });

      // NOTE: No need to navigate manually to Home!
      // The onAuthStateChanged listener in AuthContext.tsx will automatically detect 
      // the successful registration, update the global state, and the AppNavigator 
      // will unmount this screen and mount the Authorized stack.

    } catch (error: any) {
      // Error Handling: Translate ugly Firebase error codes into human-readable text
      let msg = "Registration failed.";
      if (error.code === "auth/email-already-in-use") msg = "This email is already registered.";
      if (error.code === "auth/invalid-email") msg = "That email address is invalid.";
      if (error.code === "auth/weak-password") msg = "Password is too weak (must be 6+ chars).";

      setErrorMessage(msg);
      
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: msg,
        position: 'top',
        topOffset: 60
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------
  return (
    <KeyboardAvoidingView
      style={styles.fullContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled" // Allows tapping the submit button while keyboard is open
        showsVerticalScrollIndicator={false}
      >

        {/* --- Header --- */}
        <View style={styles.introContainer}>
          <Text style={styles.pageTitle}>Create Account</Text>
          <Text style={styles.pageSubtitle}>Join us and start making a difference</Text>
        </View>

        {/* --- Input Fields --- */}
        {/* Using the custom component to keep this section declarative and clean */}
        <View style={styles.inputGroup}>
          <CustomInput 
            label="Full Name" 
            placeholder="Enter your name" 
            value={fullName} 
            onChangeText={(t: string) => { setFullName(t); setErrorMessage(null); }} 
            icon={User} 
            keyboardType="default" 
            autoCapitalize="words"
            onFocus={handleInputFocus}
          />
          <CustomInput 
            label="Email" 
            placeholder="Enter your email" 
            value={email} 
            onChangeText={(t: string) => { setEmail(t); setErrorMessage(null); }} 
            icon={Mail} 
            keyboardType="email-address" 
            autoCapitalize="none"
            onFocus={handleInputFocus}
          />
          <CustomInput 
            label="Password" 
            placeholder="Create a password" 
            value={password} 
            onChangeText={(t: string) => { setPassword(t); setErrorMessage(null); }} 
            icon={Lock} 
            secureTextEntry={true} 
            onFocus={handleInputFocus}
          />
          <CustomInput 
            label="Confirm Password" 
            placeholder="Confirm your password" 
            value={confirmPassword} 
            onChangeText={(t: string) => { setConfirmPassword(t); setErrorMessage(null); }} 
            icon={Lock} 
            secureTextEntry={true} 
            onFocus={handleInputFocus}
          />
        </View>

        {/* --- Error Feedback --- */}
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {/* --- Register Button --- */}
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
        ) : (
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.8}>
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        )}

        {/* --- Login Link (Footer) --- */}
        {/* Navigate to the existing Login screen if the user already has an account */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginLinkBaseText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLinkHighlight}>Login</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  
  // 🔥 PUSHED TO TOP (Matches Login Screen Logic to avoid jumping UI)
  content: { 
    padding: 20, 
    paddingTop: Platform.OS === 'android' ? 40 : 50, // Reduced top padding
    paddingBottom: 50, 
    justifyContent: 'flex-start', // Push items to the top of the screen
    minHeight: '100%' 
  },
  
  // Intro styling
  introContainer: { marginBottom: 30, marginTop: 0 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 5 },
  pageSubtitle: { fontSize: 16, color: COLORS.placeholder },

  // Input styling
  inputGroup: { marginBottom: 20 },
  inputWrapper: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 5 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.outline, borderRadius: 10, paddingHorizontal: 15, backgroundColor: COLORS.background, height: 55,
  },
  inputIcon: { marginRight: 10 },
  inputField: { flex: 1, fontSize: 16, color: COLORS.text },

  // Button styling
  registerButton: {
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 30, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  registerButtonText: { color: COLORS.background, fontWeight: 'bold', fontSize: 18 },
  loadingIndicator: { marginBottom: 20 },

  // Footer Links & Errors
  loginLinkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 5 },
  loginLinkBaseText: { color: COLORS.placeholder, fontSize: 16 },
  loginLinkHighlight: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  errorText: { color: COLORS.error, marginBottom: 15, textAlign: "center", fontWeight: "500" },
});