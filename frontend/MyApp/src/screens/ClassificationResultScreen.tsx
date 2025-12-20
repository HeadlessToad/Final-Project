// screens/ClassificationResultScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, DimensionValue } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, FeedbackData } from "../types";
import { Camera, MapPin, Save, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PredictionFeedbackList from '../components/PredictionFeedbackList';
import { getAuth } from "firebase/auth";

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

// Map backend labels to UI details
const getCategoryDetails = (predictedLabel: string) => {
    const label = predictedLabel ? predictedLabel.toUpperCase() : "UNKNOWN";

    if (label.includes('PLASTIC')) return { category: 'Recyclable Plastic', icon: '🧴', points: 15 };
    if (label.includes('METAL')) return { category: 'Metal', icon: '🥫', points: 20 };
    if (label.includes('PAPER')) return { category: 'Paper', icon: '📄', points: 10 };
    if (label.includes('CARDBOARD')) return { category: 'Cardboard', icon: '📦', points: 10 };
    if (label.includes('GLASS')) return { category: 'Glass', icon: '🍾', points: 25 };
    if (label.includes('BIODEGRADABLE')) return { category: 'Biodegradable', icon: '🍂', points: 10 };

    return { category: 'General Waste', icon: '🗑️', points: 5 };
};

type ClassificationResultProps = NativeStackScreenProps<RootStackParamList, "ClassificationResult">;

export default function ClassificationResultScreen({ navigation, route }: ClassificationResultProps) {
    const { resultData, imageUri } = route.params;
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    // 1. Determine which image to show (Annotated from Server OR Local Original)
    // If backend sent a base64 string, use it! It shows the bounding boxes.
    const displayImage = resultData.annotated_image_base64
        ? `data:image/jpeg;base64,${resultData.annotated_image_base64}`
        : imageUri;

    // 2. Prepare Display Data
    const categoryInfo = getCategoryDetails(resultData.prediction);
    const confidencePct = Math.round(resultData.confidence * 100);

    // 3. Handle Feedback Submission
    const handleFeedbackSubmit = async (feedbackItems: FeedbackData[]) => {
        if (!resultData.image_id) {
            Alert.alert("Error", "No Image ID found. Cannot save feedback.");
            return;
        }

        setIsSubmittingFeedback(true);
        const API_URL = "https://waste-classifier-eu-89824582784.europe-west1.run.app"; // Or your local IP
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "No user found. Cannot save feedback.");
            setIsSubmittingFeedback(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_id: resultData.image_id,
                    feedback: feedbackItems,
                    user_id: user.uid
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Failed to save feedback");

            Alert.alert(
                "Feedback Saved!",
                `You earned +${data.points_added} points for helping us train the AI!`,
                [{ text: "Awesome", onPress: () => navigation.popToTop() }]
            );

        } catch (error) {
            Alert.alert("Error", "Could not save feedback. Try again.");
            console.error(error);
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    return (
        <View style={styles.fullContainer}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analysis Result</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* 1. Image Display */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: displayImage }} style={styles.resultImage} resizeMode="contain" />
                </View>

                {/* 2. Main Result Card */}
                <View style={styles.resultCard}>
                    <Text style={styles.resultIcon}>{categoryInfo.icon}</Text>
                    <Text style={styles.resultType}>{resultData.prediction}</Text>
                    <Text style={styles.resultCategory}>{categoryInfo.category}</Text>

                    {/* Confidence Meter */}
                    <View style={styles.confidenceMeterContainer}>
                        <View style={styles.confidenceHeader}>
                            <Text style={styles.confidenceLabel}>Confidence</Text>
                            <Text style={[styles.confidenceValue, { color: COLORS.primary }]}>{confidencePct}%</Text>
                        </View>
                        <View style={styles.progressBarBackground}>
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.secondary]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={[styles.progressBarFill, { width: `${confidencePct}%` as DimensionValue }]}
                            />
                        </View>
                    </View>

                    {/* Points */}
                    <View style={styles.pointsEarnedBox}>
                        <CheckCircle size={24} color={COLORS.primary} />
                        <Text style={styles.pointsEarnedLabel}>Points Earned</Text>
                        <Text style={[styles.pointsEarnedValue, { color: COLORS.primary }]}>+{categoryInfo.points}</Text>
                    </View>
                </View>

                {/* 3. Tips */}
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>💡 Recycling Tip</Text>
                    <Text style={styles.instructionText}>
                        {resultData.tips || "Check your local recycling guidelines."}
                    </Text>
                </View>

                {/* 4. Feedback Section (The new List Component) */}
                <PredictionFeedbackList
                    detections={resultData.detections}
                    onSubmit={handleFeedbackSubmit}
                />

                {isSubmittingFeedback && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 10 }} />}

                {/* 5. Bottom Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('ScanScreen')}>
                        <Camera size={20} color={COLORS.primary} />
                        <Text style={styles.outlineButtonText}>Scan Again</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: COLORS.white },
    backButton: { paddingRight: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },

    content: { padding: 20, gap: 20, paddingBottom: 50 },

    imageContainer: {
        height: 300,
        backgroundColor: '#000',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 10,
    },
    resultImage: { width: '100%', height: '100%' },

    // Result Card
    resultCard: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        elevation: 2,
    },
    resultIcon: { fontSize: 50, marginBottom: 10 },
    resultType: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, textTransform: 'uppercase' },
    resultCategory: { fontSize: 16, color: COLORS.onSurfaceVariant, marginBottom: 15 },

    // Confidence
    confidenceMeterContainer: { width: '100%', marginBottom: 15 },
    confidenceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    confidenceLabel: { fontSize: 14, color: COLORS.onSurfaceVariant },
    confidenceValue: { fontSize: 14, fontWeight: 'bold' },
    progressBarBackground: { height: 8, backgroundColor: COLORS.outline, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%' },

    // Points
    pointsEarnedBox: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
    },
    pointsEarnedLabel: { fontSize: 14, color: COLORS.onSurfaceVariant },
    pointsEarnedValue: { fontSize: 20, fontWeight: 'bold' },

    // Instructions
    instructionsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        elevation: 2,
    },
    instructionsTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
    instructionText: { fontSize: 16, color: COLORS.onSurfaceVariant, lineHeight: 22 },

    // Actions
    actionsContainer: { marginTop: 20, paddingBottom: 30 },
    outlineButton: {
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: COLORS.primary,
        gap: 10,
    },
    outlineButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
});