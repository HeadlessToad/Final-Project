import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { sendPasswordResetEmail } from "firebase/auth"; // 🔥 Import this
import { auth } from "../firebaseConfig";
import { Mail, ArrowLeft } from 'lucide-react-native';

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
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      // 🔥 THE MAGIC LINE: Firebase sends the email for you
      await sendPasswordResetEmail(auth, email);
      
      Alert.alert(
        "Check your Email", 
        "A password reset link has been sent to " + email,
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        Alert.alert("Error", "No user found with this email address.");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
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

        {/* Input */}
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