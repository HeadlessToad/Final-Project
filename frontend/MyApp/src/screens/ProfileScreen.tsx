// screens/TempHomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TempHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ AUTHORIZED STACK SUCCESS!</Text>
      <Text style={styles.text}>The problem is in HomeScreen.tsx.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5E9' },
    text: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginTop: 10 }
});