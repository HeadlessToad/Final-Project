import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/firebaseConfig';

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
        // This listener fires whenever the user logs in, logs out, or auto-logs in.
        const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
            setUser(authenticatedUser);
            setLoading(false); // Auth check is done, remove loading spinner
        });

        return unsubscribe; // Cleanup on unmount
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    // We don't need to pass login/logout functions anymore!
    // The screens will talk to Firebase directly.
    return <AppNavigator user={user} />;
}