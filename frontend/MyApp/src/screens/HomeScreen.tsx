import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";

// 1. Add 'navigation' to props
export default function HomeScreen({ navigation }: any) {
  const { userRole, user } = useAuth();

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home!</Text>

      <Text style={styles.subtitle}>You are securely logged in.</Text>

      {/* 2. THE NEW BUTTON */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate("Classify")}
      >
        <Text style={styles.actionButtonText}>📸 Identify Waste</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 30 },

  // New Styles
  actionButton: {
    backgroundColor: "#2196F3", // Blue
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#FF5252", // Red
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
