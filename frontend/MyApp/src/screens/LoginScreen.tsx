// screens/LoginScreen.tsx

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

WebBrowser.maybeCompleteAuthSession();

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

const CustomHeader = ({ navigation }: { navigation: LoginProps['navigation'] }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      {/* Back Icon */}
    </TouchableOpacity>
  </View>
);

export default function LoginScreen({ navigation }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- GOOGLE AUTH ---
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '1030006869141-5i8de4ma1cflajjmb2u12jrhhggino6o.apps.googleusercontent.com',
    iosClientId: '1030006869141-5i8de4ma1cflajjmb2u12jrhhggino6o.apps.googleusercontent.com', 
    androidClientId: '1030006869141-5i8de4ma1cflajjmb2u12jrhhggino6o.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({ useProxy: true }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
             // Save login timestamp to Firestore for cross-device session management
             const userDocRef = doc(db, "users", userCredential.user.uid);
             await updateDoc(userDocRef, { lastLoginTimestamp: Date.now() });
             // Success Toast for Google
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

  // --- EMAIL LOGIN ---
  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Save login timestamp to Firestore for cross-device session management
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await updateDoc(userDocRef, { lastLoginTimestamp: Date.now() });

      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Login successful.',
        position: 'top',
        topOffset: 60
      });

    } catch (error: any) {
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

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as any);
  };

  return (
    <View style={styles.fullContainer}>
      <CustomHeader navigation={navigation} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
      >
        <ScrollView 
          contentContainerStyle={styles.content} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.introContainer}>
            <Text style={styles.pageTitle}>Welcome Back!</Text>
            <Text style={styles.pageSubtitle}>Login to continue your eco journey</Text>
          </View>

          <Text style={styles.inputLabel}>Email</Text>
          <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
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

          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
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

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}

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
  introContainer: { marginBottom: 20, marginTop: 0 }, 
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 5 },
  pageSubtitle: { fontSize: 16, color: COLORS.placeholder },
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
  inputError: { borderColor: COLORS.error, borderWidth: 1 },
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
  registerLinkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 5 },
  registerLinkBaseText: { color: COLORS.placeholder, fontSize: 16 },
  registerLinkHighlight: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  errorText: { color: COLORS.error, marginBottom: 15, textAlign: "center", fontWeight: "500" },
});