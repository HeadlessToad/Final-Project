import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext"; // <--- Import this

export default function HomeScreen() {
  const { userRole, user } = useAuth(); // <--- Get the role

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home!</Text>

      {/* --- DEBUG SECTION START --- */}
      <View
        style={{
          padding: 20,
          backgroundColor: "#e1e1e1",
          borderRadius: 10,
          margin: 10,
        }}
      >
        <Text>Email: {user?.email}</Text>
        <Text style={{ fontWeight: "bold", color: "blue" }}>
          Current Role: {userRole || "Loading..."}
        </Text>
      </View>
      {/* --- DEBUG SECTION END --- */}

      <Text style={styles.subtitle}>You are securely logged in.</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
// ... styles remain same
// (Styles remain the same...)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 30 },
  button: {
    backgroundColor: "#FF5252",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
