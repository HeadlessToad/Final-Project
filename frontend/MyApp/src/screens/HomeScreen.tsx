import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type HomeProps = {
    onLogout: () => void;
};

export default function HomeScreen({ onLogout }: HomeProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Home!</Text>
            <Text style={styles.subtitle}>Secure Area Reached.</Text>

            <TouchableOpacity style={styles.button} onPress={onLogout}>
                <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
    button: { backgroundColor: '#FF5252', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
});