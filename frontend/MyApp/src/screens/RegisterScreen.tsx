// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Platform,
//   ScrollView,
//   Image, // 🔥 ADDED: Necessary for displaying the picked profile image
//   Alert, // ADDED: Necessary for image picker alerts
// } from "react-native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../types";
// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// import { auth } from "../firebaseConfig";
// import { User, Mail, Lock, Camera, ArrowLeft } from 'lucide-react-native'; 
// import * as ImagePicker from 'expo-image-picker'; // 🔥 ADDED: For photo picker logic

// // Define colors based on the final visual theme
// const COLORS = {
//   primary: '#4CAF50', 
//   background: '#FFFFFF',
//   text: '#1B5E20', 
//   placeholder: '#9E9E9E',
//   outline: '#E0E0E0',
//   error: '#F44335',
//   surfaceVariant: '#F0F0F0', // For photo placeholder background
// };

// // Define the expected navigation prop types
// type RegisterProps = {
//   navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
// };

// // --- Custom Input Component (To align with the design) ---
// const CustomInput = ({ label, icon: Icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }: any) => (
//     <View style={styles.inputWrapper}>
//         <Text style={styles.inputLabel}>{label}</Text>
//         <View style={styles.inputContainer}>
//             {/* Using the Lucide Icon component passed via props */}
//             <Icon size={20} color={COLORS.placeholder} style={styles.inputIcon} /> 
//             <TextInput
//                 style={styles.inputField}
//                 placeholder={placeholder}
//                 placeholderTextColor={COLORS.placeholder}
//                 value={value}
//                 onChangeText={onChangeText}
//                 secureTextEntry={secureTextEntry}
//                 keyboardType={keyboardType}
//                 autoCapitalize={autoCapitalize}
//             />
//         </View>
//     </View>
// );

// export default function RegisterScreen({ navigation }: RegisterProps) {
//   // --- STATE ---
//   const [fullName, setFullName] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [profileImageUri, setProfileImageUri] = useState<string | null>(null); // State for image

//   // --- Image Picker Logic ---
// const handleImagePicker = async () => {
//     // 1. Request Media Library permissions
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission required', 'We need access to your photos to set a profile image.');
//       return; // <-- It stops here if Media Library is denied
//     }

//     Alert.alert(
//       "Set Profile Photo",
//       "Choose an option:",
//       [
//         {
//           text: "Open Gallery",
//           onPress: () => selectImage(ImagePicker.MediaTypeOptions.Images, false),
//         },
//         {
//           text: "Open Camera",
//           onPress: () => selectImage(ImagePicker.MediaTypeOptions.Images, true),
//         },
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//       ]
//     );
//   };

//   const selectImage = async (mediaType: ImagePicker.MediaTypeOptions, useCamera: boolean = false) => {

//     let pickerResult;

//     if (useCamera) {
//       const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
//       if (cameraStatus !== 'granted') {
//         Alert.alert('Permission required', 'We need camera access to take a photo.');
//         return;
//       }
//       pickerResult = await ImagePicker.launchCameraAsync({
//         mediaTypes: mediaType,
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.8,
//       });
//     } else {
//       pickerResult = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: mediaType,
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.8,
//       });
//     }

//     if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
//       setProfileImageUri(pickerResult.assets[0].uri);
//     }
//   };


//   // --- FIREBASE REGISTER LOGIC (KEPT) ---
//   const handleRegister = async () => {
//     // 1. Client-side Validation 
//     if (!fullName.trim()) { setErrorMessage("Please enter your full name."); return; }
//     if (password.length < 6) { setErrorMessage("Password must be at least 6 characters long."); return; }
//     if (password !== confirmPassword) { setErrorMessage("Passwords do not match."); return; }
//     if (!email.includes("@")) { setErrorMessage("Please enter a valid email address."); return; }

//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);

//       // Update the user's display name and potentially photo URL if uploaded
//       await updateProfile(userCredential.user, {
//           displayName: fullName,
//           // In a real app, you would upload profileImageUri to Firebase Storage 
//           // and set the photoURL here: photoURL: uploadedImageUrl,
//       });

//       // AuthContext listener detects successful registration and navigates to Home

//     } catch (error: any) {
//       let msg = "Registration failed.";
//       if (error.code === "auth/email-already-in-use") msg = "This email is already registered.";
//       if (error.code === "auth/invalid-email") msg = "That email address is invalid.";
//       if (error.code === "auth/weak-password") msg = "Password is too weak (must be 6+ chars).";

//       setErrorMessage(msg);
//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <View style={styles.fullContainer}>
//       {/* ⚠️ NOTE: We rely on AppNavigator.tsx for the native header/back button */}

//       <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

//         {/* Intro Text */}
//         <View style={styles.introContainer}>
//           <Text style={styles.pageTitle}>Create Account</Text>
//           <Text style={styles.pageSubtitle}>Join us and start making a difference</Text>
//         </View>

//         {/* --- Profile Photo Placeholder --- */}
//         <View style={styles.photoContainer}>
//             <View style={styles.photoPlaceholder}>
//                 {/* Dynamically display user photo or default icon */}
//                 {profileImageUri ? (
//                     <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
//                 ) : (
//                     <User size={40} color={COLORS.placeholder} />
//                 )}
//             </View>
//             <TouchableOpacity 
//                 style={styles.cameraButton} 
//                 activeOpacity={0.8}
//                 onPress={handleImagePicker} // Calls the function to open gallery/camera
//             >
//                 <Camera size={16} color={COLORS.background} />
//             </TouchableOpacity>
//         </View>

//         {/* --- Input Fields --- */}
//         <View style={styles.inputGroup}>
//             <CustomInput
//                 label="Full Name"
//                 placeholder="Enter your name"
//                 value={fullName}
//                 onChangeText={(t: string) => { setFullName(t); setErrorMessage(null); }}
//                 icon={User}
//                 keyboardType="default"
//                 autoCapitalize="words"
//             />
//             <CustomInput
//                 label="Email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChangeText={(t: string) => { setEmail(t); setErrorMessage(null); }}
//                 icon={Mail}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//             />
//             <CustomInput
//                 label="Password"
//                 placeholder="Create a password"
//                 value={password}
//                 onChangeText={(t: string) => { setPassword(t); setErrorMessage(null); }}
//                 icon={Lock}
//                 secureTextEntry={true}
//                 keyboardType="default"
//                 autoCapitalize="none"
//             />
//             <CustomInput
//                 label="Confirm Password"
//                 placeholder="Confirm your password"
//                 value={confirmPassword}
//                 onChangeText={(t: string) => { setConfirmPassword(t); setErrorMessage(null); }}
//                 icon={Lock}
//                 secureTextEntry={true}
//                 keyboardType="default"
//                 autoCapitalize="none"
//             />
//         </View>

//         {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

//         {/* --- Register Button --- */}
//         {loading ? (
//           <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
//         ) : (
//           <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.8}>
//             <Text style={styles.registerButtonText}>Create Account</Text>
//           </TouchableOpacity>
//         )}

//         {/* --- Login Link --- */}
//         <View style={styles.loginLinkContainer}>
//           <Text style={styles.loginLinkBaseText}>Already have an account?</Text>
//           <TouchableOpacity onPress={() => navigation.navigate("Login")}>
//             <Text style={styles.loginLinkHighlight}>Login</Text>
//           </TouchableOpacity>
//         </View>

//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   fullContainer: { flex: 1, backgroundColor: COLORS.background, },

//   // --- Content & Intro Text ---
//   content: { padding: 20, paddingBottom: 50, },
//   introContainer: { marginBottom: 20, },
//   pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 5, },
//   pageSubtitle: { fontSize: 16, color: COLORS.placeholder, },

//   // --- Profile Photo Styles ---
//   photoContainer: {
//     alignItems: 'center',
//     marginBottom: 30,
//     marginTop: 10,
//   },
//   photoPlaceholder: {
//     width: 96, 
//     height: 96, 
//     borderRadius: 48,
//     backgroundColor: COLORS.surfaceVariant, // Grey background
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 4,
//     borderColor: COLORS.background, // White border
//     overflow: 'hidden', 
//   },
//   profileImage: { // Style for the actual Image component
//     width: '100%',
//     height: '100%',
//   },
//   cameraButton: {
//     position: 'absolute',
//     bottom: 0,
//     right: '37%', // Overlay positioning
//     width: 32, 
//     height: 32, 
//     borderRadius: 16,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },

//   // --- Input Styles ---
//   inputGroup: { marginBottom: 20, },
//   inputWrapper: { marginBottom: 15, },
//   inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 5, },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.outline,
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     backgroundColor: COLORS.background, 
//     height: 55,
//   },
//   inputIcon: { marginRight: 10, },
//   inputField: { flex: 1, fontSize: 16, color: COLORS.text, },
//   inputError: { borderColor: COLORS.error, borderWidth: 1, },


//   // --- Button Styles ---
//   registerButton: {
//     backgroundColor: COLORS.primary,
//     padding: 16,
//     borderRadius: 30, 
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   registerButtonText: { color: COLORS.background, fontWeight: 'bold', fontSize: 18, },
//   loadingIndicator: { marginBottom: 20, },

//   // --- Login Link ---
//   loginLinkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 5, },
//   loginLinkBaseText: { color: COLORS.placeholder, fontSize: 16, },
//   loginLinkHighlight: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, },
//   errorText: { color: COLORS.error, marginBottom: 15, textAlign: "center", fontWeight: "500", },
// });

// screens/RegisterScreen.tsx (WITH IMAGE UPLOAD LOGIC)

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
  Image,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage } from "../firebaseConfig"; // 🔥 IMPORT STORAGE
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // 🔥 STORAGE FUNCTIONS
import { User, Mail, Lock, Camera, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

// Define colors (unchanged)
const COLORS = {
  primary: '#4CAF50',
  background: '#FFFFFF',
  text: '#1B5E20',
  placeholder: '#9E9E9E',
  outline: '#E0E0E0',
  error: '#F44335',
  surfaceVariant: '#F0F0F0',
};

type RegisterProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
};

// --- Custom Input Component (Unchanged) ---
const CustomInput = ({ label, icon: Icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }: any) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputContainer}>
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
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  // 🔥 NEW FUNCTION: Uploads image to Firebase Storage and returns the public URL
  const uploadImage = async (uri: string, userId: string) => {
    // 1. Convert local file URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // 2. Create Storage reference (path: 'profile_images/USER_ID.jpg')
    const storageRef = ref(storage, `profile_images/${userId}.jpg`);

    // 3. Upload the blob
    const uploadTask = await uploadBytes(storageRef, blob);

    // 4. Get the public URL
    const downloadURL = await getDownloadURL(uploadTask.ref);
    return downloadURL;
  };


  // --- Image Picker Logic (Simplified - unchanged from your functional version) ---
  const launchPicker = async (source: 'camera' | 'gallery') => {
    let pickerResult: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') { Alert.alert('Permission required', 'We need camera access to take a photo.'); return; }
      pickerResult = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8, });
    } else { // 'gallery'
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus !== 'granted') { Alert.alert('Permission required', 'We need access to your photo library to select an image.'); return; }
      pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8, });
    }

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setProfileImageUri(pickerResult.assets[0].uri);
    }
  };

  const handleImagePicker = () => {
    Alert.alert("Set Profile Photo", "Choose an option:", [
      { text: "Open Gallery", onPress: () => launchPicker('gallery') },
      { text: "Open Camera", onPress: () => launchPicker('camera') },
      { text: "Cancel", style: "cancel" },
    ]);
  };


  // --- FIREBASE REGISTER LOGIC (MODIFIED FOR IMAGE UPLOAD) ---
  const handleRegister = async () => {
    // 1. Client-side Validation (Unchanged)
    if (!fullName.trim()) { setErrorMessage("Please enter your full name."); return; }
    if (password.length < 6) { setErrorMessage("Password must be at least 6 characters long."); return; }
    if (password !== confirmPassword) { setErrorMessage("Passwords do not match."); return; }
    if (!email.includes("@")) { setErrorMessage("Please enter a valid email address."); return; }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 2. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      let uploadedImageUrl: string | null = null;

      // 3. Upload Image (IF SELECTED)
      if (profileImageUri) {
        uploadedImageUrl = await uploadImage(profileImageUri, userId);
      }

      // 4. Update Firebase Auth Profile (Sets name and photo URL)
      await updateProfile(userCredential.user, {
        displayName: fullName,
        photoURL: uploadedImageUrl, // Save the public URL to the Auth object
      });

      // REMARK: AuthContext listener now detects the user and saves the image URL 
      // into the `profileImageUrl` field in Firestore automatically.

      Alert.alert("Success!", "Account created. Welcome to GreenMind!");

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
    // ... (JSX remains visually unchanged) ...
    <View style={styles.fullContainer}>
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
            onPress={handleImagePicker}
          >
            <Camera size={16} color={COLORS.background} />
          </TouchableOpacity>
        </View>

        {/* --- Input Fields (Unchanged) --- */}
        <View style={styles.inputGroup}>
          <CustomInput label="Full Name" placeholder="Enter your name" value={fullName} onChangeText={(t: string) => { setFullName(t); setErrorMessage(null); }} icon={User} keyboardType="default" autoCapitalize="words" />
          <CustomInput label="Email" placeholder="Enter your email" value={email} onChangeText={(t: string) => { setEmail(t); setErrorMessage(null); }} icon={Mail} keyboardType="email-address" autoCapitalize="none" />
          <CustomInput label="Password" placeholder="Create a password" value={password} onChangeText={(t: string) => { setPassword(t); setErrorMessage(null); }} icon={Lock} secureTextEntry={true} keyboardType="default" autoCapitalize="none" />
          <CustomInput label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChangeText={(t: string) => { setConfirmPassword(t); setErrorMessage(null); }} icon={Lock} secureTextEntry={true} keyboardType="default" autoCapitalize="none" />
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
  // ... (styles remain unchanged)
  fullContainer: { flex: 1, backgroundColor: COLORS.background, },
  content: { padding: 20, paddingBottom: 50, },
  introContainer: { marginBottom: 20, },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 5, },
  pageSubtitle: { fontSize: 16, color: COLORS.placeholder, },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.background,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '37%',
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
  registerButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: { color: COLORS.background, fontWeight: 'bold', fontSize: 18, },
  loadingIndicator: { marginBottom: 20, },
  loginLinkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 5, },
  loginLinkBaseText: { color: COLORS.placeholder, fontSize: 16, },
  loginLinkHighlight: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, },
  errorText: { color: COLORS.error, marginBottom: 15, textAlign: "center", fontWeight: "500", },
});