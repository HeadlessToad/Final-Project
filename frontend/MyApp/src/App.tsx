import React, { useState } from 'react';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
    // SIMULATED AUTH STATE
    // null = logged out, { name: 'User' } = logged in
    const [user, setUser] = useState<any>(null);

    const handleLogin = () => {
        // Phase A: Fake login
        console.log("User logged in!");
        setUser({ name: 'Test User' });
    };

    const handleLogout = () => {
        // Phase A: Fake logout
        console.log("User logged out!");
        setUser(null);
    };

    return (
        <AppNavigator
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
        />
    );
}