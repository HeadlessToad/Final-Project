// screens/ScanScreen.tsx

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { CameraView, Camera } from 'expo-camera'; // Use CameraView for Expo Go compatibility
import { Camera as CameraIcon, Zap, ArrowLeft } from 'lucide-react-native'; 
import { useFocusEffect } from '@react-navigation/native'; // For managing camera state

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.75; // Approx 75% of screen width

const COLORS = {
    primary: '#4CAF50', 
    white: '#FFFFFF',
    darkBackground: '#121212', // Black/dark theme for camera screen
    scanFrame: '#00D47C', // Bright green highlight
};

type ScanScreenProps = NativeStackScreenProps<RootStackParamList, "ScanScreen">;

export default function ScanScreen({ navigation }: ScanScreenProps) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    // 1. Request Camera Permission on mount
    useFocusEffect(
        React.useCallback(() => {
            (async () => {
                const cameraStatus = await Camera.requestCameraPermissionsAsync();
                setHasPermission(cameraStatus.status === 'granted');
                setIsCameraActive(true); // Activate camera when focused
            })();
            return () => setIsCameraActive(false); // Deactivate when unfocused
        }, [])
    );

    const handleCapture = () => {
        if (!cameraRef.current || isScanning) return;
        
        setIsScanning(true);
        // Simulate analysis delay, then navigate
        setTimeout(() => {
            setIsScanning(false);
            // 🔥 Navigate to the result screen (where the image is displayed)
            navigation.navigate('ClassificationResult');
        }, 2000); 
    };

    if (hasPermission === null) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }
    if (hasPermission === false) {
        return <Text style={styles.permissionText}>Camera access denied.</Text>;
    }


    return (
        <View style={styles.fullContainer}>
            {/* 1. Camera View */}
            {isCameraActive && (
                 <CameraView 
                    style={StyleSheet.absoluteFill} 
                    ref={cameraRef} 
                    facing="back"
                    // Removed video/audio flags for basic image scanning
                 />
            )}
            

            {/* 2. Scanning Overlay */}
            {isScanning && (
                <View style={styles.scanningOverlay}>
                    <ActivityIndicator size="large" color={COLORS.scanFrame} />
                    <Text style={styles.scanningText}>Analyzing...</Text>
                </View>
            )}
            
            {/* 3. Header/Back Button (Custom, transparent) */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>

            {/* 4. Frame Guide and Instructions */}
            <View style={styles.overlay}>
                
                <View style={styles.guideContainer}>
                    <View style={styles.frameGuide}>
                        <CameraIcon size={FRAME_SIZE * 0.4} color={COLORS.white} opacity={0.6} />
                    </View>
                    {/* Corner Guides (Matching the design's green corners) */}
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>

                {/* Top Instructions */}
                <View style={styles.instructionsTop}>
                    <Text style={styles.instructionText}>Point your camera at the waste item</Text>
                    <Text style={styles.instructionTextSub}>Position it within the frame</Text>
                </View>

                {/* Flash Toggle */}
                <TouchableOpacity style={styles.flashButton}>
                    <Zap size={24} color={COLORS.white} />
                </TouchableOpacity>

                {/* Capture Button Area */}
                <View style={styles.captureArea}>
                    <Text style={styles.captureTip}>Tap the button to capture</Text>
                    <TouchableOpacity
                        onPress={handleCapture}
                        disabled={isScanning}
                        style={styles.captureButtonOuter}
                    >
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.darkBackground },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.darkBackground },
    permissionText: { color: COLORS.white, padding: 40, textAlign: 'center' },
    
    // --- Camera Controls ---
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    flashButton: {
        position: 'absolute',
        top: height * 0.15, // Adjusted to match design position relative to screen height
        right: 20,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    
    // --- Overlay & Guide ---
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
    },
    guideContainer: {
        position: 'absolute',
        width: FRAME_SIZE,
        height: FRAME_SIZE,
        top: (height - FRAME_SIZE) / 2 - 50, // Center vertically, slightly offset up
        justifyContent: 'center',
        alignItems: 'center',
    },
    frameGuide: {
        width: '100%',
        height: '100%',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: COLORS.scanFrame,
        zIndex: 3,
    },
    topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 15 },
    topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 15 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 15 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 15 },

    // --- Instructions ---
    instructionsTop: {
        position: 'absolute',
        top: height * 0.1, // Positioning the top instruction bubble
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    instructionText: { color: COLORS.white, fontSize: 16, fontWeight: '500' },
    instructionTextSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },

    // --- Capture Button ---
    captureArea: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
        width: '100%',
    },
    captureTip: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginBottom: 10,
    },
    captureButtonOuter: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.white,
        borderWidth: 4,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow and scale effects are omitted as they require Reanimated
    },
    captureButtonInner: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: COLORS.primary,
    },
    
    // --- Scanning State ---
    scanningOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    scanningText: {
        color: COLORS.white,
        marginTop: 10,
        fontSize: 18,
    }
});