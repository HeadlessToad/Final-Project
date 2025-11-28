import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

type LoginProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let msg = "An unexpected error occurred.";
      if (error.code === "auth/invalid-email")
        msg = "That email address is invalid.";
      if (error.code === "auth/user-not-found")
        msg = "No account found with this email.";
      if (error.code === "auth/wrong-password") msg = "Incorrect password.";
      if (error.code === "auth/too-many-requests")
        msg = "Too many failed attempts. Try again later.";
      if (error.code === "auth/invalid-credential")
        msg = "Invalid credentials provided.";

      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={[styles.input, errorMessage ? styles.inputError : null]}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrorMessage(null);
        }}
        autoCapitalize="sentences"
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
          onChangeText={(text) => {
            setPassword(text);
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

      {/* ERROR MESSAGE DISPLAY */}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {loading ? (
        <ActivityIndicator color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}
// (Styles remain the same...)
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
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  linkText: { color: "#2196F3", textAlign: "center", marginTop: 10 },
});
