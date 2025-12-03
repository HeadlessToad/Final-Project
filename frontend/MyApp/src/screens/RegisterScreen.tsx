// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../types";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebaseConfig";

// // Note: We REMOVED the DB write from here because AuthContext handles it now!

// type RegisterProps = {
//   navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
// };

// export default function RegisterScreen({ navigation }: RegisterProps) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const handleRegister = async () => {
//     // Basic Client-side validation
//     if (password.length < 6) {
//       setErrorMessage("Password must be at least 6 characters long.");
//       return;
//     }
//     if (!email.includes("@")) {
//       setErrorMessage("Please enter a valid email address.");
//       return;
//     }

//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       // AuthContext listener will detect this and navigate to Home
//     } catch (error: any) {
//       let msg = "Registration failed.";
//       if (error.code === "auth/email-already-in-use")
//         msg = "This email is already registered.";
//       if (error.code === "auth/invalid-email")
//         msg = "That email address is invalid.";
//       if (error.code === "auth/weak-password") msg = "Password is too weak.";

//       setErrorMessage(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create Account</Text>

//       <TextInput
//         style={[styles.input, errorMessage ? styles.inputError : null]}
//         placeholder="Email"
//         value={email}
//         onChangeText={(t) => {
//           setEmail(t);
//           setErrorMessage(null);
//         }}
//         autoCapitalize="none"
//         keyboardType="email-address"
//       />

//       <View style={styles.inputRow}>
//         <TextInput
//           style={[
//             styles.input,
//             styles.inputFlex,
//             errorMessage ? styles.inputError : null,
//           ]}
//           placeholder="Password"
//           value={password}
//           onChangeText={(t) => {
//             setPassword(t);
//             setErrorMessage(null);
//           }}
//           secureTextEntry={!showPassword}
//           autoCapitalize="none"
//         />
//         <TouchableOpacity
//           style={styles.toggleButton}
//           onPress={() => setShowPassword((prev) => !prev)}
//           activeOpacity={0.7}
//         >
//           <Text style={styles.toggleText}>
//             {showPassword ? "Hide" : "Show"}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

//       {loading ? (
//         <ActivityIndicator color="#4CAF50" style={{ marginBottom: 20 }} />
//       ) : (
//         <TouchableOpacity style={styles.button} onPress={handleRegister}>
//           <Text style={styles.buttonText}>Sign Up</Text>
//         </TouchableOpacity>
//       )}

//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <Text style={styles.linkText}>Already have an account? Log in</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 30,
//     textAlign: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 15,
//     backgroundColor: "#f9f9f9",
//   },
//   inputError: {
//     borderColor: "#FF5252",
//     borderWidth: 1,
//   },
//   inputRow: { flexDirection: "row", alignItems: "center" },
//   inputFlex: { flex: 1, marginBottom: 15 },
//   toggleButton: { marginLeft: 8, paddingVertical: 8, paddingHorizontal: 10 },
//   toggleText: { color: "#2196F3", fontWeight: "600" },

//   errorText: {
//     color: "#FF5252",
//     marginBottom: 15,
//     textAlign: "center",
//     fontWeight: "500",
//   },

//   button: {
//     backgroundColor: "#4CAF50",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   linkText: { color: "#2196F3", textAlign: "center", marginTop: 10 },
// });
// screens/RegisterScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  Image, // 🔥 ADDED: Necessary for displaying the picked profile image
  Alert, // ADDED: Necessary for image picker alerts
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { User, Mail, Lock, Camera, ArrowLeft } from 'lucide-react-native'; 
import * as ImagePicker from 'expo-image-picker'; // 🔥 ADDED: For photo picker logic

// Define colors based on the final visual theme
const COLORS = {
  primary: '#4CAF50', 
  background: '#FFFFFF',
  text: '#1B5E20', 
  placeholder: '#9E9E9E',
  outline: '#E0E0E0',
  error: '#F44335',
  surfaceVariant: '#F0F0F0', // For photo placeholder background
};

// Define the expected navigation prop types
type RegisterProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
};

// --- Custom Input Component (To align with the design) ---
const CustomInput = ({ label, icon: Icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }: any) => (
    <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputContainer}>
            {/* Using the Lucide Icon component passed via props */}
            <Icon size={20} color={COLORS.placeholder} style={styles.inputIcon} /> 
            <TextInput
                style={styles.inputField}
                placeholder={placeholder}
                placeholderTextColor={COLORS.placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
            />
        </View>
    </View>
);

export default function RegisterScreen({ navigation }: RegisterProps) {
  // --- STATE ---
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null); // State for image

  // --- Image Picker Logic ---
  const handleImagePicker = async () => {
    // 1. Request Media Library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to set a profile image.');
      return;
    }

    Alert.alert(
      "Set Profile Photo",
      "Choose an option:",
      [
        {
          text: "Open Gallery",
          onPress: () => selectImage(ImagePicker.MediaTypeOptions.Images, false),
        },
        {
          text: "Open Camera",
          onPress: () => selectImage(ImagePicker.MediaTypeOptions.Images, true),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const selectImage = async (mediaType: ImagePicker.MediaTypeOptions, useCamera: boolean = false) => {
      
    let pickerResult;

    if (useCamera) {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission required', 'We need camera access to take a photo.');
        return;
      }
      pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: mediaType,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setProfileImageUri(pickerResult.assets[0].uri);
    }
  };


  // --- FIREBASE REGISTER LOGIC (KEPT) ---
  const handleRegister = async () => {
    // 1. Client-side Validation 
    if (!fullName.trim()) { setErrorMessage("Please enter your full name."); return; }
    if (password.length < 6) { setErrorMessage("Password must be at least 6 characters long."); return; }
    if (password !== confirmPassword) { setErrorMessage("Passwords do not match."); return; }
    if (!email.includes("@")) { setErrorMessage("Please enter a valid email address."); return; }

    setLoading(true);
    setErrorMessage(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name and potentially photo URL if uploaded
      await updateProfile(userCredential.user, {
          displayName: fullName,
          // In a real app, you would upload profileImageUri to Firebase Storage 
          // and set the photoURL here: photoURL: uploadedImageUrl,
      });
      
      // AuthContext listener detects successful registration and navigates to Home

    } catch (error: any) {
      let msg = "Registration failed.";
      if (error.code === "auth/email-already-in-use") msg = "This email is already registered.";
      if (error.code === "auth/invalid-email") msg = "That email address is invalid.";
      if (error.code === "auth/weak-password") msg = "Password is too weak (must be 6+ chars).";

      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.fullContainer}>
      {/* ⚠️ NOTE: We rely on AppNavigator.tsx for the native header/back button */}
      
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Intro Text */}
        <View style={styles.introContainer}>
          <Text style={styles.pageTitle}>Create Account</Text>
          <Text style={styles.pageSubtitle}>Join us and start making a difference</Text>
        </View>

        {/* --- Profile Photo Placeholder --- */}
        <View style={styles.photoContainer}>
            <View style={styles.photoPlaceholder}>
                {/* Dynamically display user photo or default icon */}
                {profileImageUri ? (
                    <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
                ) : (
                    <User size={40} color={COLORS.placeholder} />
                )}
            </View>
            <TouchableOpacity 
                style={styles.cameraButton} 
                activeOpacity={0.8}
                onPress={handleImagePicker} // Calls the function to open gallery/camera
            >
                <Camera size={16} color={COLORS.background} />
            </TouchableOpacity>
        </View>

        {/* --- Input Fields --- */}
        <View style={styles.inputGroup}>
            <CustomInput
                label="Full Name"
                placeholder="Enter your name"
                value={fullName}
                onChangeText={(t: string) => { setFullName(t); setErrorMessage(null); }}
                icon={User}
                keyboardType="default"
                autoCapitalize="words"
            />
            <CustomInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(t: string) => { setEmail(t); setErrorMessage(null); }}
                icon={Mail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <CustomInput
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={(t: string) => { setPassword(t); setErrorMessage(null); }}
                icon={Lock}
                secureTextEntry={true}
                keyboardType="default"
                autoCapitalize="none"
            />
            <CustomInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={(t: string) => { setConfirmPassword(t); setErrorMessage(null); }}
                icon={Lock}
                secureTextEntry={true}
                keyboardType="default"
                autoCapitalize="none"
            />
        </View>

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {/* --- Register Button --- */}
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
        ) : (
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.8}>
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        )}
        
        {/* --- Login Link --- */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginLinkBaseText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLinkHighlight}>Login</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background, },
  
  // --- Content & Intro Text ---
  content: { padding: 20, paddingBottom: 50, },
  introContainer: { marginBottom: 20, },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 5, },
  pageSubtitle: { fontSize: 16, color: COLORS.placeholder, },

  // --- Profile Photo Styles ---
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  photoPlaceholder: {
    width: 96, 
    height: 96, 
    borderRadius: 48,
    backgroundColor: COLORS.surfaceVariant, // Grey background
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.background, // White border
    overflow: 'hidden', 
  },
  profileImage: { // Style for the actual Image component
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '37%', // Overlay positioning
    width: 32, 
    height: 32, 
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // --- Input Styles ---
  inputGroup: { marginBottom: 20, },
  inputWrapper: { marginBottom: 15, },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 5, },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.background, 
    height: 55,
  },
  inputIcon: { marginRight: 10, },
  inputField: { flex: 1, fontSize: 16, color: COLORS.text, },
  inputError: { borderColor: COLORS.error, borderWidth: 1, },


  // --- Button Styles ---
  registerButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 30, 
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: { color: COLORS.background, fontWeight: 'bold', fontSize: 18, },
  loadingIndicator: { marginBottom: 20, },

  // --- Login Link ---
  loginLinkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 5, },
  loginLinkBaseText: { color: COLORS.placeholder, fontSize: 16, },
  loginLinkHighlight: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, },
  errorText: { color: COLORS.error, marginBottom: 15, textAlign: "center", fontWeight: "500", },
});