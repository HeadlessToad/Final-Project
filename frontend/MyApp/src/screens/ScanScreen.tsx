// // screens/ScanScreen.tsx
// import React, { useState, useRef } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { RootStackParamList, PredictionResponse } from "../types";
// import { CameraView, Camera } from 'expo-camera'; // Use CameraView for Expo Go compatibility
// import { Camera as CameraIcon, Zap, ArrowLeft } from 'lucide-react-native';
// import { useFocusEffect } from '@react-navigation/native'; // For managing camera state

// const { width, height } = Dimensions.get('window');
// const FRAME_SIZE = width * 0.75; // Approx 75% of screen width

// const COLORS = {
//     primary: '#4CAF50',
//     white: '#FFFFFF',
//     darkBackground: '#121212', // Black/dark theme for camera screen
//     scanFrame: '#00D47C', // Bright green highlight
// };

// type ScanScreenProps = NativeStackScreenProps<RootStackParamList, "ScanScreen">;
// const API_URL = "https://waste-classifier-eu-89824582784.europe-west1.run.app"

// export default function ScanScreen({ navigation }: ScanScreenProps) {
//     const [hasPermission, setHasPermission] = useState<boolean | null>(null);
//     const [isScanning, setIsScanning] = useState(false);
//     const cameraRef = useRef<CameraView>(null);
//     const [isCameraActive, setIsCameraActive] = useState(false);
//     const [image, setImage] = useState<string | null>(null)

//     // 1. Request Camera Permission on mount
//     useFocusEffect(
//         React.useCallback(() => {
//             (async () => {
//                 const cameraStatus = await Camera.requestCameraPermissionsAsync();
//                 setHasPermission(cameraStatus.status === 'granted');
//                 setIsCameraActive(true); // Activate camera when focused
//             })();
//             return () => setIsCameraActive(false); // Deactivate when unfocused
//         }, [])
//     );

//     const handleCapture = async () => {
//         if (!cameraRef.current || isScanning) return;

//         setIsScanning(true);
//         try {
//             // 1. Take the picture (Await is crucial here!)
//             const photo = await cameraRef.current.takePictureAsync({
//                 quality: 0.7, // Compress slightly for faster upload
//                 base64: false,
//             });

//             if (!photo?.uri) {
//                 throw new Error("Failed to capture image");
//             }

//             // 2. Prepare the file for upload
//             const formData = new FormData();
//             formData.append('file', {
//                 uri: photo.uri,
//                 name: 'photo.jpg',
//                 type: 'image/jpeg',
//             } as any); // 'as any' quiets TypeScript complaining about RN FormData

//             // 3. Send to Python Backend
//             console.log("Sending to:", `${API_URL}/predict`);
//             const response = await fetch(`${API_URL}/predict`, {
//                 method: 'POST',
//                 body: formData,
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error(`Server Error: ${response.status}`);
//             }

//             const data: PredictionResponse = await response.json();
//             console.log("Prediction received:", data);

//             // 4. Navigate with REAL data
//             navigation.navigate('ClassificationResult', {
//                 resultData: data,    // The JSON from Python (class_name, confidence)
//                 imageUri: photo.uri  // The local photo to display
//             });

//         } catch (error) {
//             console.error("Scan failed:", error);
//             alert("Connection Error. Check your IP config or Server.");
//         } finally {
//             setIsScanning(false);
//         }
//     };

//     if (hasPermission === null) {
//         return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
//     }
//     if (hasPermission === false) {
//         return <Text style={styles.permissionText}>Camera access denied.</Text>;
//     }


//     return (
//         <View style={styles.fullContainer}>
//             {/* 1. Camera View */}
//             {isCameraActive && (
//                 <CameraView
//                     style={StyleSheet.absoluteFill}
//                     ref={cameraRef}
//                     facing="back"
//                 />
//             )}


//             {/* 2. Scanning Overlay */}
//             {isScanning && (
//                 <View style={styles.scanningOverlay}>
//                     <ActivityIndicator size="large" color={COLORS.scanFrame} />
//                     <Text style={styles.scanningText}>Analyzing...</Text>
//                 </View>
//             )}

//             {/* 3. Header/Back Button (Custom, transparent) */}
//             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//                 <ArrowLeft size={24} color={COLORS.white} />
//             </TouchableOpacity>

//             {/* 4. Frame Guide and Instructions */}
//             <View style={styles.overlay}>

//                 <View style={styles.guideContainer}>
//                     <View style={styles.frameGuide}>
//                         <CameraIcon size={FRAME_SIZE * 0.4} color={COLORS.white} opacity={0.6} />
//                     </View>
//                     {/* Corner Guides (Matching the design's green corners) */}
//                     <View style={[styles.corner, styles.topLeft]} />
//                     <View style={[styles.corner, styles.topRight]} />
//                     <View style={[styles.corner, styles.bottomLeft]} />
//                     <View style={[styles.corner, styles.bottomRight]} />
//                 </View>

//                 {/* Top Instructions */}
//                 <View style={styles.instructionsTop}>
//                     <Text style={styles.instructionText}>Point your camera at the waste item</Text>
//                     <Text style={styles.instructionTextSub}>Position it within the frame</Text>
//                 </View>

//                 {/* Flash Toggle */}
//                 <TouchableOpacity style={styles.flashButton}>
//                     <Zap size={24} color={COLORS.white} />
//                 </TouchableOpacity>

//                 {/* Capture Button Area */}
//                 <View style={styles.captureArea}>
//                     <Text style={styles.captureTip}>Tap the button to capture</Text>
//                     <TouchableOpacity
//                         onPress={handleCapture}
//                         disabled={isScanning}
//                         style={styles.captureButtonOuter}
//                     >
//                         <View style={styles.captureButtonInner} />
//                     </TouchableOpacity>
//                 </View>

//             </View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     fullContainer: { flex: 1, backgroundColor: COLORS.darkBackground },
//     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.darkBackground },
//     permissionText: { color: COLORS.white, padding: 40, textAlign: 'center' },

//     // --- Camera Controls ---
//     backButton: {
//         position: 'absolute',
//         top: Platform.OS === 'ios' ? 60 : 20,
//         left: 20,
//         zIndex: 10,
//         padding: 10,
//     },
//     flashButton: {
//         position: 'absolute',
//         top: height * 0.15, // Adjusted to match design position relative to screen height
//         right: 20,
//         width: 48,
//         height: 48,
//         borderRadius: 24,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 5,
//     },

//     // --- Overlay & Guide ---
//     overlay: {
//         ...StyleSheet.absoluteFillObject,
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         zIndex: 2,
//     },
//     guideContainer: {
//         position: 'absolute',
//         width: FRAME_SIZE,
//         height: FRAME_SIZE,
//         top: (height - FRAME_SIZE) / 2 - 50, // Center vertically, slightly offset up
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     frameGuide: {
//         width: '100%',
//         height: '100%',
//         borderWidth: 4,
//         borderColor: 'rgba(255, 255, 255, 0.6)',
//         borderRadius: 15,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     corner: {
//         position: 'absolute',
//         width: 30,
//         height: 30,
//         borderColor: COLORS.scanFrame,
//         zIndex: 3,
//     },
//     topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 15 },
//     topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 15 },
//     bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 15 },
//     bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 15 },

//     // --- Instructions ---
//     instructionsTop: {
//         position: 'absolute',
//         top: height * 0.1, // Positioning the top instruction bubble
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         padding: 10,
//         borderRadius: 10,
//         alignItems: 'center',
//     },
//     instructionText: { color: COLORS.white, fontSize: 16, fontWeight: '500' },
//     instructionTextSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },

//     // --- Capture Button ---
//     captureArea: {
//         position: 'absolute',
//         bottom: 40,
//         alignItems: 'center',
//         width: '100%',
//     },
//     captureTip: {
//         color: 'rgba(255,255,255,0.7)',
//         fontSize: 14,
//         marginBottom: 10,
//     },
//     captureButtonOuter: {
//         width: 70,
//         height: 70,
//         borderRadius: 35,
//         backgroundColor: COLORS.white,
//         borderWidth: 4,
//         borderColor: COLORS.primary,
//         justifyContent: 'center',
//         alignItems: 'center',
//         // Shadow and scale effects are omitted as they require Reanimated
//     },
//     captureButtonInner: {
//         width: 55,
//         height: 55,
//         borderRadius: 27.5,
//         backgroundColor: COLORS.primary,
//     },

//     // --- Scanning State ---
//     scanningOverlay: {
//         ...StyleSheet.absoluteFillObject,
//         backgroundColor: 'rgba(0,0,0,0.7)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 20,
//     },
//     scanningText: {
//         color: COLORS.white,
//         marginTop: 10,
//         fontSize: 18,
//     }
// });

// screens/ScanScreen.tsx

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, PredictionResponse } from "../types";
import { CameraView, Camera } from 'expo-camera'; 
import { Camera as CameraIcon, Zap, ArrowLeft } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message'; // 🔥 IMPORT TOAST

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.75; // Approx 75% of screen width

const COLORS = {
    primary: '#4CAF50',
    white: '#FFFFFF',
    darkBackground: '#121212', 
    scanFrame: '#00D47C', 
};

type ScanScreenProps = NativeStackScreenProps<RootStackParamList, "ScanScreen">;
const API_URL = "https://waste-classifier-eu-89824582784.europe-west1.run.app"

export default function ScanScreen({ navigation }: ScanScreenProps) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    
    // 1. PERMISSION & FOCUS LOGIC
    // Explanation: We only want the camera to be "active" when the user is actually looking at this screen.
    // If we leave it active in the background, it drains battery and slows down the app.
    useFocusEffect(
        React.useCallback(() => {
            (async () => {
                const cameraStatus = await Camera.requestCameraPermissionsAsync();
                setHasPermission(cameraStatus.status === 'granted');
                setIsCameraActive(true); 
            })();
            return () => setIsCameraActive(false); // Cleanup when leaving screen
        }, [])
    );

    // 2. CAPTURE LOGIC
    const handleCapture = async () => {
        if (!cameraRef.current || isScanning) return;

        setIsScanning(true);
        try {
            // Step A: Take Photo
            // Quality 0.7 is a sweet spot: good enough for AI, small enough for fast upload.
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7, 
                base64: false,
            });

            if (!photo?.uri) {
                throw new Error("Failed to capture image");
            }

            // Step B: Prepare FormData
            // React Native requires a specific object format { uri, name, type } to upload files.
            const formData = new FormData();
            formData.append('file', {
                uri: photo.uri,
                name: 'photo.jpg',
                type: 'image/jpeg',
            } as any); 

            // Step C: Send to Custom Python Backend
            console.log("Sending to:", `${API_URL}/predict`);
            const response = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }

            const data: PredictionResponse = await response.json();
            console.log("Prediction received:", data);

            // Step D: Navigate to Result Screen
            // We pass the raw image URI and the AI data to the next screen.
            navigation.navigate('ClassificationResult', {
                resultData: data,    
                imageUri: photo.uri  
            });

        } catch (error) {
            console.error("Scan failed:", error);
            
            // 🔥 TOAST ERROR (Replaces ugly Alert)
            Toast.show({
                type: 'error',
                text1: 'Scan Failed',
                text2: 'Could not connect to server. Check internet.',
                position: 'bottom',
                bottomOffset: 80 // Move up so it doesn't cover the capture button
            });
            
        } finally {
            setIsScanning(false);
        }
    };

    // --- LOADING / PERMISSION VIEWS ---
    if (hasPermission === null) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }
    if (hasPermission === false) {
        return <Text style={styles.permissionText}>Camera access denied. Please enable it in settings.</Text>;
    }

    return (
        <View style={styles.fullContainer}>
            {/* 1. Camera Viewfinder */}
            {isCameraActive && (
                <CameraView
                    style={StyleSheet.absoluteFill}
                    ref={cameraRef}
                    facing="back"
                />
            )}

            {/* 2. Loading Overlay (While sending to server) */}
            {isScanning && (
                <View style={styles.scanningOverlay}>
                    <ActivityIndicator size="large" color={COLORS.scanFrame} />
                    <Text style={styles.scanningText}>Analyzing...</Text>
                </View>
            )}

            {/* 3. Back Button */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>

            {/* 4. Frame Guide and Instructions */}
            <View style={styles.overlay}>

                {/* Central Square Guide */}
                <View style={styles.guideContainer}>
                    <View style={styles.frameGuide}>
                        <CameraIcon size={FRAME_SIZE * 0.4} color={COLORS.white} opacity={0.6} />
                    </View>
                    {/* Decorative Green Corners */}
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>

                {/* Instruction Bubble */}
                <View style={styles.instructionsTop}>
                    <Text style={styles.instructionText}>Point your camera at the waste item</Text>
                    <Text style={styles.instructionTextSub}>Position it within the frame</Text>
                </View>

                {/* Flash Toggle (Visual only for now) */}
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
                        activeOpacity={0.7}
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
    permissionText: { color: COLORS.white, padding: 40, textAlign: 'center', marginTop: 100 },

    // --- Camera Controls ---
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        left: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20
    },
    flashButton: {
        position: 'absolute',
        top: height * 0.15, 
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
        top: (height - FRAME_SIZE) / 2 - 50, 
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
        top: height * 0.1, 
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