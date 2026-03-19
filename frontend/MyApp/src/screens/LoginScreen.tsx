// screens/LoginScreen.tsx
// ============================================================================
// COMPONENT PURPOSE:
// Provides the user authentication interface. It supports both traditional 
// Email & Password login, as well as OAuth integration via Google Sign-In.
// Upon successful login, it updates the user's `lastLoginTimestamp` in Firestore 
// to help manage session expiration across the app.
// ============================================================================

import React, { useState, useEffect } from "react";
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
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import Toast from 'react-native-toast-message'; // 🔥 Import Toast

// Required by Expo to securely complete the web-based OAuth flow
WebBrowser.maybeCompleteAuthSession();

// Centralized color palette
const COLORS = {
  primary: '#4CAF50',
  background: '#FFFFFF',
  text: '#1B5E20',
  placeholder: '#9E9E9E',
  outline: '#E0E0E0',
  error: '#F44336',
};

type LoginProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

// Sub-component for a custom header layout
const CustomHeader = ({ navigation }: { navigation: LoginProps['navigation'] }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      {/* Back Icon placeholder */}
    </TouchableOpacity>
  </View>
);

export default function LoginScreen({ navigation }: LoginProps) {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // GOOGLE OAUTH CONFIGURATION
  // --------------------------------------------------------------------------
  // Sets up the Google Authentication request using client IDs from Google Cloud Console.
  // makeRedirectUri handles the callback routing back into the Expo app.
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '1030006869141-5i8de4ma1cflajjmb2u12jrhhggino6o.apps.googleusercontent.com',
    iosClientId: '1030006869141-5i8de4ma1cflajjmb2u12jrhhggino6o.apps.googleusercontent.com', 
    androidClientId: '1030006869141-5i8de4ma1cflajjmb2u12jrhhggino6o.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({ useProxy: true }),
  });

  // Listens for the response from the Google Auth web popup.
  useEffect(() => {
    if (response?.type === 'success') {
      // 1. Extract the Google ID token
      const { id_token } = response.params;
      
      // 2. Create a Firebase credential using the Google token
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      
      // 3. Sign into Firebase using this credential
      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
             // 4. Save login timestamp to Firestore for cross-device session management
             const userDocRef = doc(db, "users", userCredential.user.uid);
             await updateDoc(userDocRef, { lastLoginTimestamp: Date.now() });
             
             // 5. Show success notification
             Toast.show({
                type: 'success',
                text1: 'Welcome Back!',
                text2: 'Signed in with Google.'
            });
        })
        .catch((error) => {
          setErrorMessage("Google Sign-In failed.");
          Toast.show({
            type: 'error',
            text1: 'Login Failed',
            text2: error.message
          });
        })
        .finally(() => setLoading(false));
    }
  }, [response]);

  // --------------------------------------------------------------------------
  // EMAIL & PASSWORD LOGIN LOGIC
  // --------------------------------------------------------------------------
  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null); // Clear any previous errors
    try {
      // 1. Authenticate with Firebase using email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // 2. Save login timestamp to Firestore for cross-device session management
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await updateDoc(userDocRef, { lastLoginTimestamp: Date.now() });

      // 3. Show success Toast (Navigation is handled automatically by AuthContext)
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Login successful.',
        position: 'top',
        topOffset: 60
      });

    } catch (error: any) {
      // 4. Error Handling: Map obscure Firebase error codes to user-friendly messages
      let msg = "Invalid email or password.";
      if (error.code === "auth/user-not-found") msg = "No account found with this email.";
      if (error.code === "auth/wrong-password") msg = "Incorrect password.";
      if (error.code === "auth/invalid-email") msg = "Please enter a valid email.";
      
      setErrorMessage(msg);
      
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: msg,
        position: 'top', 
        topOffset: 60 
      });
    } finally {
      setLoading(false);
    }
  };

  // Navigates to the screen where users can request a password reset email
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as any);
  };

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------
  return (
    <View style={styles.fullContainer}>
      <CustomHeader navigation={navigation} />
      
      {/* KeyboardAvoidingView prevents the keyboard from hiding the input fields */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
      >
        <ScrollView 
          contentContainerStyle={styles.content} 
          keyboardShouldPersistTaps="handled" // Allows tapping buttons without dismissing keyboard first
          showsVerticalScrollIndicator={false}
        >

          {/* Intro Text */}
          <View style={styles.introContainer}>
            <Text style={styles.pageTitle}>Welcome Back!</Text>
            <Text style={styles.pageSubtitle}>Login to continue your eco journey</Text>
          </View>

          {/* Email Input */}
          <Text style={styles.inputLabel}>Email</Text>
          <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.placeholder}
              value={email}
              // Clear error styling/message as soon as the user starts typing again
              onChangeText={(text) => { setEmail(text); setErrorMessage(null); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.placeholder}
              value={password}
              onChangeText={(text) => { setPassword(text); setErrorMessage(null); }}
              secureTextEntry={true} // Hides the password characters
              autoCapitalize="none"
            />
          </View>

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Display general error message if it exists */}
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          {/* Login Button or Loading Spinner */}
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}

          {/* Navigate to Registration Screen */}
          <View style={styles.registerLinkContainer}>
            <Text style={styles.registerLinkBaseText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLinkHighlight}>Register</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingHorizontal: 15,
    paddingBottom: 0,
  },
  backButton: { paddingRight: 10, paddingVertical: 5 },
  content: { 
    padding: 20, 
    paddingTop: 10, 
    paddingBottom: 50,
    flexGrow: 1, 
    justifyContent: 'flex-start', 
  },
  
  // Intro Titles
  introContainer: { marginBottom: 20, marginTop: 0 }, 
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 5 },
  pageSubtitle: { fontSize: 16, color: COLORS.placeholder },
  
  // Inputs
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 5, marginTop: 15 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.background,
    height: 55,
  },
  inputField: { flex: 1, fontSize: 16, color: COLORS.text },
  inputError: { borderColor: COLORS.error, borderWidth: 1 }, // Applied dynamically on error
  
  // Links & Buttons
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 5,
  },
  forgotPasswordText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: { color: COLORS.background, fontWeight: 'bold', fontSize: 18 },
  loadingIndicator: { marginBottom: 20 },
  
  // Registration Link
  registerLinkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 5 },
  registerLinkBaseText: { color: COLORS.placeholder, fontSize: 16 },
  registerLinkHighlight: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  
  // Error Messages
  errorText: { color: COLORS.error, marginBottom: 15, textAlign: "center", fontWeight: "500" },
});