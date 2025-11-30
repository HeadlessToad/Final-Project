// src/screens/ScanScreen.tsx

import * as React from 'react';
import { View, Text, Pressable, PressableProps, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, CameraType, FlashMode, CameraCapturedPicture } from 'expo-camera'; // Core Camera imports
import { Zap, Camera as CameraIcon, X } from 'lucide-react-native';
import { styled } from 'nativewind';
import Animated, { useSharedValue, withTiming, Easing, withRepeat } from 'react-native-reanimated';
import { cn } from '../components/ui/utils';

// --- Import Converted UI Components ---
import { Header } from '../components/Header';

// --- Context Hooks and Types (Assumed to be functional) ---
// import { useClassificationService } from '../services/wasteClassification'; // Service hook placeholder

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// --- Constants ---
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = 'border-green-600 dark:border-green-400';

/**
 * @function ScanScreen
 * @description Renders the camera feed, handles image capture, and initiates classification.
 */
export function ScanScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = Camera.useCameraPermissions();
  
  const cameraRef = React.useRef<Camera>(null);
  
  const [isScanning, setIsScanning] = React.useState(false);
  const [flashMode, setFlashMode] = React.useState(FlashMode.off);

  // --- Reanimated Spinner Logic ---
  const rotate = useSharedValue(0);
  React.useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1, // Repeat indefinitely
      false
    );
  }, [rotate]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotate.value}deg` }],
    };
  });
  
  // --- Handle Permissions and Initial Setup ---
  if (!permission) {
    // Camera permissions are still loading
    return <StyledView className="flex-1 bg-black justify-center"><ActivityIndicator size="large" color="white" /></StyledView>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <StyledView className="flex-1 bg-black justify-center items-center p-8">
        <StyledText className="text-white text-center mb-4">
          We need camera access to scan your waste items.
        </StyledText>
        <Button
            variant='primary'
            onClick={requestPermission}
        >
            Grant Permission
        </Button>
      </StyledView>
    );
  }

  // --- Capture and API Handler ---
  const handleCapture = async () => {
    if (!cameraRef.current || isScanning) return;

    setIsScanning(true);
    
    try {
        const photo = await cameraRef.current.takePictureAsync({
            quality: 0.7,
            base64: true, // Needed if sending directly to Flask/Node API
            skipProcessing: true,
        });

        if (photo.base64) {
            // NOTE: Here you would upload the photo or send the base64 string to your AI endpoint (Flask API).
            console.log("Image captured and ready for AI classification.");
            
            // SIMULATION: Wait for 2 seconds (API latency)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Navigate to result screen, passing the classification data (SIMULATED)
            navigation.navigate('ClassificationResultScreen' as never, {
                // predictionData: result,
                // capturedImage: photo.uri
            } as never);

        } else {
            throw new Error("Failed to capture image data.");
        }

    } catch (e) {
        console.error("Camera capture error:", e);
        Alert.alert("Error", "Failed to capture or process image.");
    } finally {
        setIsScanning(false);
    }
  };


  return (
    <StyledView className="flex-1 bg-black">
      
      {/* 1. Expo Camera Feed (Absolute fill) */}
      <Camera
        ref={cameraRef}
        className="absolute inset-0"
        type={CameraType.back}
        flashMode={flashMode}
        // Aspect Ratio set to fill screen, cropping as necessary
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
      />
      
      {/* 2. Header (Transparent Overlay) */}
      <Header
        onBack={navigation.goBack}
        transparent
        // Manually position header content high enough to avoid status bar collision
        className="absolute top-0 w-full z-20 pt-10" 
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        actions={
            // Flash Toggle Button
            <StyledPressable 
                onPress={() => setFlashMode(flashMode === FlashMode.on ? FlashMode.off : FlashMode.on)}
                className="w-12 h-12 rounded-full flex items-center justify-center active:opacity-70 bg-black/50 backdrop-blur-sm"
            >
                <Zap size={24} className={flashMode === FlashMode.on ? PRIMARY_COLOR : "text-white"} />
            </StyledPressable>
        }
      />
      

      {/* 3. Camera Frame Guide and Instructions (Static Overlays) */}
      <StyledView className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        
        {/* Frame Guide Box */}
        <StyledView className="w-72 h-72 border-4 border-white/50 rounded-xl relative">
            {/* Corner decorations (Primary color emphasis) */}
            <StyledView className={cn("absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg", PRIMARY_COLOR)} style={{ transform: [{ translateX: -4 }, { translateY: -4 }]}} />
            <StyledView className={cn("absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg", PRIMARY_COLOR)} style={{ transform: [{ translateX: 4 }, { translateY: -4 }]}} />
            <StyledView className={cn("absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg", PRIMARY_COLOR)} style={{ transform: [{ translateX: -4 }, { translateY: 4 }]}} />
            <StyledView className={cn("absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg", PRIMARY_COLOR)} style={{ transform: [{ translateX: 4 }, { translateY: 4 }]}} />
        </StyledView>
        
        {/* Instructions */}
        <StyledView className="absolute top-24 left-0 right-0 text-center px-6">
            <StyledView className="bg-black/50 backdrop-blur-sm rounded-xl p-3 inline-block">
                <StyledText className="text-white text-base font-semibold mb-1">Point your camera at the waste item</StyledText>
                <StyledText className="text-white/70 text-sm">Position it within the frame for best results</StyledText>
            </StyledView>
        </StyledView>
      </StyledView>

      
      {/* 4. Capture Button and Loading Overlay */}
      <StyledView className="absolute bottom-12 left-0 right-0 flex justify-center z-20">
        
        {/* Capture Button */}
        <StyledPressable
          onPress={handleCapture}
          disabled={isScanning}
          className={cn(
            "w-20 h-20 rounded-full bg-white border-4 flex items-center justify-center shadow-lg active:scale-105 transition-transform disabled:opacity-50",
            PRIMARY_COLOR // Green border
          )}
        >
            <StyledView className={cn("w-16 h-16 rounded-full", PRIMARY_COLOR)} style={{backgroundColor: '#10B981'}} />
        </StyledPressable>
        
        {/* Tip */}
        <StyledView className="absolute top-[-48px] left-0 right-0 text-center px-6">
            <StyledText className="text-white/70 text-sm">Tap the button to capture</StyledText>
        </StyledView>
      </StyledView>


      {/* Scanning Overlay (Full Screen, Conditional) */}
      {isScanning && (
        <StyledView className="absolute inset-0 z-30 flex items-center justify-center bg-black/80">
          <StyledView className="text-center">
            {/* Reanimated Spinner */}
            <Animated.View style={animatedStyle}>
                <StyledView className={cn("w-16 h-16 border-4 border-t-transparent rounded-full", PRIMARY_COLOR)} />
            </Animated.View>
            
            <StyledText className="text-white mt-4 text-base">Analyzing...</StyledText>
            <StyledText className="text-white/70 text-sm mt-1">Please hold steady.</StyledText>
          </StyledView>
        </StyledView>
      )}

    </StyledView>
  );
}