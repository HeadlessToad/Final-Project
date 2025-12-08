// screens/ClassificationResultScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Camera, MapPin, Save, CheckCircle, ArrowLeft } from 'lucide-react-native'; 
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
    primary: '#4CAF50', 
    secondary: '#8BC34A', 
    background: '#F9F9F9',
    white: '#FFFFFF',
    text: '#1B5E20', 
    onSurfaceVariant: '#616161', 
    outline: '#E0E0E0',
    primaryLight: '#E8F5E9',
};

type ClassificationResultProps = NativeStackScreenProps<RootStackParamList, "ClassificationResult">;

export default function ClassificationResultScreen({ navigation }: ClassificationResultProps) {
    // --- MOCK DATA ---
    const result = {
        type: 'Plastic Bottle (PET)',
        confidence: 94,
        points: 15,
        category: 'Recyclable Plastic',
        icon: '🧴', // Using emoji for large icon display
    };
    const instructions = [
        'Remove the cap and rinse the bottle',
        'Crush the bottle to save space',
        'Place in the plastic recycling bin',
        'Caps can be recycled separately'
    ];
    // --- END MOCK DATA ---


    // 🔥 NEW/FIXED LOGIC: Function to force navigation back to the Home dashboard
    const handleGoHome = () => { 
        // Use popToTop to clear the stack (ScanScreen, ResultScreen) and go back to the root (Home)
        navigation.popToTop(); 
    };

    const handleScanAgain = () => { navigation.navigate('ScanScreen'); };
    const handleFindCenter = () => { navigation.navigate('RecyclingCenters'); }; // Placeholder route
    const handleSaveResult = () => { alert('Result saved to history!'); };
    


    // 🔥 NAVIGATION FIX: Override the default back button to ensure it goes to Home, 
    // skipping the crashing ScanScreen.
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={handleGoHome} style={{ padding: 10 }}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
            ),
            // Optionally, you can set the back title to null to hide the previous screen name
            // headerBackTitleVisible: false, 
        });
    }, [navigation]);


    return (
        <View style={styles.fullContainer}>
            <ScrollView contentContainerStyle={styles.content}>
                
                {/* --- 1. Result Card --- */}
                <View style={styles.resultCard}>
                    <Text style={styles.resultIcon}>{result.icon}</Text>
                    <Text style={styles.resultType}>{result.type}</Text>
                    <Text style={styles.resultCategory}>{result.category}</Text>

                    {/* Confidence Meter */}
                    <View style={styles.confidenceMeterContainer}>
                        <View style={styles.confidenceHeader}>
                            <Text style={styles.confidenceLabel}>Confidence</Text>
                            <Text style={[styles.confidenceValue, {color: COLORS.primary}]}>{result.confidence}%</Text>
                        </View>
                        <View style={styles.progressBarBackground}>
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.secondary]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={[styles.progressBarFill, { width: `${result.confidence}%` }]}
                            />
                        </View>
                    </View>

                    {/* Points Earned */}
                    <View style={styles.pointsEarnedBox}>
                        <CheckCircle size={24} color={COLORS.primary} />
                        <View>
                            <Text style={styles.pointsEarnedLabel}>Points Earned</Text>
                            <Text style={[styles.pointsEarnedValue, {color: COLORS.primary}]}>+{result.points}</Text>
                        </View>
                    </View>
                </View>

                {/* --- 2. Recycling Instructions --- */}
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>Recycling Instructions</Text>
                    {instructions.map((instruction, index) => (
                        <View key={index} style={styles.instructionRow}>
                            <View style={styles.instructionNumberCircle}>
                                <Text style={styles.instructionNumber}>{index + 1}</Text>
                            </View>
                            <Text style={styles.instructionText}>{instruction}</Text>
                        </View>
                    ))}
                </View>

                {/* --- 3. Actions --- */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleScanAgain}>
                        <Camera size={20} color={COLORS.white} />
                        <Text style={styles.primaryButtonText}>Scan Again</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.outlineButton} onPress={handleFindCenter}>
                        <MapPin size={20} color={COLORS.primary} />
                        <Text style={styles.outlineButtonText}>Find Recycling Center</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.textButton} onPress={handleSaveResult}>
                        <Save size={20} color={COLORS.onSurfaceVariant} />
                        <Text style={styles.textButtonText}>Save Result</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20, gap: 20, paddingBottom: 50 },

    // --- 1. Result Card ---
    resultCard: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    },
    resultIcon: { fontSize: 60, marginBottom: 10 },
    resultType: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 5 },
    resultCategory: { fontSize: 16, color: COLORS.onSurfaceVariant, marginBottom: 15 },
    
    // Confidence Meter
    confidenceMeterContainer: { width: '100%', marginBottom: 15 },
    confidenceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    confidenceLabel: { fontSize: 14, color: COLORS.onSurfaceVariant },
    confidenceValue: { fontSize: 14, fontWeight: 'bold' },
    progressBarBackground: { height: 8, backgroundColor: COLORS.surfaceVariant, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%' },

    // Points Earned Box
    pointsEarnedBox: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
    },
    pointsEarnedLabel: { fontSize: 14, color: COLORS.onSurfaceVariant },
    pointsEarnedValue: { fontSize: 20, fontWeight: 'bold' },

    // --- 2. Instructions ---
    instructionsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    },
    instructionsTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
    instructionRow: { flexDirection: 'row', gap: 15, marginBottom: 10, alignItems: 'flex-start' },
    instructionNumberCircle: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    },
    instructionNumber: { color: COLORS.white, fontSize: 14, fontWeight: 'bold' },
    instructionText: { fontSize: 16, color: COLORS.onSurfaceVariant, flex: 1 },

    // --- 3. Actions ---
    actionsContainer: { gap: 10 },
    primaryButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        borderRadius: 30,
        gap: 10,
    },
    primaryButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
    
    outlineButton: {
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: COLORS.outline,
        gap: 10,
    },
    outlineButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },

    textButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        gap: 10,
    },
    textButtonText: { color: COLORS.onSurfaceVariant, fontSize: 16, fontWeight: 'bold' },
});