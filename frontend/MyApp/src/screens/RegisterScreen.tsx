import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

// Note: We REMOVED the DB write from here because AuthContext handles it now!

type RegisterProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
};

export default function RegisterScreen({ navigation }: RegisterProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    // Basic Client-side validation
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // AuthContext listener will detect this and navigate to Home
    } catch (error: any) {
      let msg = "Registration failed.";
      if (error.code === "auth/email-already-in-use")
        msg = "This email is already registered.";
      if (error.code === "auth/invalid-email")
        msg = "That email address is invalid.";
      if (error.code === "auth/weak-password") msg = "Password is too weak.";

      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={[styles.input, errorMessage ? styles.inputError : null]}
        placeholder="Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setErrorMessage(null);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            styles.inputFlex,
            errorMessage ? styles.inputError : null,
          ]}
          placeholder="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setErrorMessage(null);
          }}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowPassword((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleText}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {loading ? (
        <ActivityIndicator color="#4CAF50" style={{ marginBottom: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "#FF5252",
    borderWidth: 1,
  },
  inputRow: { flexDirection: "row", alignItems: "center" },
  inputFlex: { flex: 1, marginBottom: 15 },
  toggleButton: { marginLeft: 8, paddingVertical: 8, paddingHorizontal: 10 },
  toggleText: { color: "#2196F3", fontWeight: "600" },

  errorText: {
    color: "#FF5252",
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "500",
  },

  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  linkText: { color: "#2196F3", textAlign: "center", marginTop: 10 },
});
