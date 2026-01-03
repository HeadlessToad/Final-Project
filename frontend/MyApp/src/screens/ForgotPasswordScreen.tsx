// screens/ForgotPasswordScreen.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { sendPasswordResetEmail } from "firebase/auth"; 
import { auth } from "../firebaseConfig";
import { Mail, ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message'; 

const COLORS = {
  primary: '#4CAF50',
  background: '#FFFFFF',
  text: '#1B5E20',
  placeholder: '#9E9E9E',
  outline: '#E0E0E0',
  error: '#F44335',
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ForgotPassword">;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    // 1. Validation: Check if email looks real
    if (!email.trim() || !email.includes("@")) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    }

    setLoading(true);
    try {
      // 2.  FIREBASE MAGIC: 
      // This function checks if the email exists in your Authentication list.
      // If yes, Google sends a pre-made "Reset Password" email to that address.
      // You don't need to build the email server yourself!
      await sendPasswordResetEmail(auth, email);
      
      // 3. Success Feedback
      Toast.show({
        type: 'success',
        text1: 'Check your Email 📧',
        text2: `A reset link has been sent to ${email}`,
        visibilityTime: 4000,
      });

      // 4. Auto-Navigation: Wait 3 seconds so they can read the toast, then go back to Login
      setTimeout(() => {
        navigation.navigate("Login");
      }, 3000);

    } catch (error: any) {
      console.error(error);
      
      // 5. Error Handling
      if (error.code === 'auth/user-not-found') {
        Toast.show({
            type: 'error',
            text1: 'Account Not Found',
            text2: 'No user is registered with this email.',
        });
      } else {
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Something went wrong. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        {/* Input Field */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Mail size={20} color={COLORS.placeholder} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Action Button */}
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleResetPassword} 
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 60 },
  backButton: { marginBottom: 20 },
  headerContainer: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  subtitle: { fontSize: 16, color: COLORS.placeholder, lineHeight: 22 },
  
  inputWrapper: { marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.outline, 
    borderRadius: 12, paddingHorizontal: 15, height: 55, backgroundColor: '#FAFAFA'
  },
  input: { flex: 1, fontSize: 16, color: COLORS.text },

  button: { 
    backgroundColor: COLORS.primary, height: 55, borderRadius: 30, 
    justifyContent: 'center', alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 3
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});