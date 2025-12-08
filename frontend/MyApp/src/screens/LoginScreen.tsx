// screens/LoginScreen.tsx (The Login Form Component)

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
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
// If you want icons back, uncomment this: import { Mail, Lock, ArrowLeft, Google } from 'lucide-react-native'; 

// Define colors (for reference)
const COLORS = {
  primary: '#4CAF50',
  background: '#FFFFFF',
  text: '#1B5E20',
  placeholder: '#9E9E9E',
  outline: '#E0E0E0',
  error: '#F44336',
  googleBlue: '#4285F4',
};

type LoginProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

// --- Custom Header Component ---
const CustomHeader = ({ navigation }: { navigation: LoginProps['navigation'] }) => (
  <View style={styles.headerContainer}>
    {/* Goes back to the WelcomeScreen (registered as 'Welcome') */}
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      {/* <ArrowLeft size={24} color={COLORS.text} /> */}
    </TouchableOpacity>
  </View>
);

export default function LoginScreen({ navigation }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- FIREBASE LOGIN LOGIC ---
  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let msg = "Invalid email or password.";
      if (error.code === "auth/too-many-requests")
        msg = "Too many failed attempts. Try again later.";

      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => { alert("Google Sign-in initiated (Setup required)."); };

  // Navigation function definition
  const handleForgotPassword = () => {
    // Correct execution: Calls navigation.navigate('ForgotPassword')
    navigation.navigate('ForgotPassword' as any);
  };


  return (
    <View style={styles.fullContainer}>
      <CustomHeader navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.introContainer}>
          <Text style={styles.pageTitle}>Welcome Back!</Text>
          <Text style={styles.pageSubtitle}>Login to continue your eco journey</Text>
        </View>

        {/* Email Input */}
        <Text style={styles.inputLabel}>Email</Text>
        <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
          {/* Icon Placeholder */}
          <TextInput
            style={styles.inputField}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.placeholder}
            value={email}
            onChangeText={(text) => { setEmail(text); setErrorMessage(null); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <Text style={styles.inputLabel}>Password</Text>
        <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
          {/* Icon Placeholder */}
          <TextInput
            style={styles.inputField}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.placeholder}
            value={password}
            onChangeText={(text) => { setPassword(text); setErrorMessage(null); }}
            secureTextEntry={true}
            autoCapitalize="none"
          />
        </View>

        {/* 🔥 FIX: Forgot Password Link (Container added for correct vertical spacing) */}
        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity
            onPress={handleForgotPassword}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {/* Login Button */}
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}

        {/* Separator */}
        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>or continue with</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Google Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.googleButtonText}>Google</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.registerLinkContainer}>
          <Text style={styles.registerLinkBaseText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLinkHighlight}>Register</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background, },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  backButton: { paddingRight: 10, paddingVertical: 5, },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, },
  content: { padding: 20, },
  introContainer: { marginBottom: 30, },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 5, },
  pageSubtitle: { fontSize: 16, color: COLORS.placeholder, },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 5, marginTop: 15, },
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
  inputError: { borderColor: COLORS.error, borderWidth: 1, },

  // 🔥 NEW: Container to provide vertical space for the link
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 5,
  },

  forgotPasswordText: { color: COLORS.primary, fontSize: 14, fontWeight: '600', },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18, },
  loadingIndicator: { marginBottom: 20, },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: COLORS.outline, },
  separatorText: { paddingHorizontal: 15, color: COLORS.placeholder, fontSize: 14, },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.outline,
    marginBottom: 30,
  },
  googleButtonText: { color: COLORS.text, fontSize: 18, fontWeight: '600', marginLeft: 10, },
  registerLinkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 5, },
  registerLinkBaseText: { color: COLORS.placeholder, fontSize: 16, },
  registerLinkHighlight: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, },
  errorText: { color: COLORS.error, marginBottom: 15, textAlign: "center", fontWeight: "500", },
});