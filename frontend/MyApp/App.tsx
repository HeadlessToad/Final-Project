import React from "react";
import { View, ActivityIndicator } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

// Create a wrapper component to handle the loading state check
const AppContent = () => {
  const { loading, user, userRole } = useAuth(); // We can now access role here too!

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return <AppNavigator user={user} role={userRole} />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
