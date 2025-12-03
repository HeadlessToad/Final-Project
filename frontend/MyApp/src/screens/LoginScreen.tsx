// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../types";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebaseConfig";

// type LoginProps = {
//   navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
// };

// export default function LoginScreen({ navigation }: LoginProps) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const handleLogin = async () => {
//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//     } catch (error: any) {
//       let msg = "An unexpected error occurred.";
//       if (error.code === "auth/invalid-email")
//         msg = "That email address is invalid.";
//       if (error.code === "auth/user-not-found")
//         msg = "No account found with this email.";
//       if (error.code === "auth/wrong-password") msg = "Incorrect password.";
//       if (error.code === "auth/too-many-requests")
//         msg = "Too many failed attempts. Try again later.";
//       if (error.code === "auth/invalid-credential")
//         msg = "Invalid credentials provided.";

//       setErrorMessage(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome Back</Text>

//       <TextInput
//         style={[styles.input, errorMessage ? styles.inputError : null]}
//         placeholder="Email"
//         value={email}
//         onChangeText={(text) => {
//           setEmail(text);
//           setErrorMessage(null);
//         }}
//         autoCapitalize="sentences"
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
//           onChangeText={(text) => {
//             setPassword(text);
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

//       {/* ERROR MESSAGE DISPLAY */}
//       {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

//       {loading ? (
//         <ActivityIndicator color="#0000ff" />
//       ) : (
//         <TouchableOpacity style={styles.button} onPress={handleLogin}>
//           <Text style={styles.buttonText}>Log In</Text>
//         </TouchableOpacity>
//       )}

//       <TouchableOpacity onPress={() => navigation.navigate("Register")}>
//         <Text style={styles.linkText}>Don't have an account? Sign up</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
// // (Styles remain the same...)
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
//     backgroundColor: "#2196F3",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   linkText: { color: "#2196F3", textAlign: "center", marginTop: 10 },
// }); 



// גג


// screens/LoginScreen.tsx (The Login Form Component)

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
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
// import { Mail, Lock, ArrowLeft, Google } from 'lucide-react-native'; 

// Define colors (for reference)
const COLORS = {
  primary: '#4CAF50', 
  background: '#FFFFFF',
  text: '#1B5E20',
  placeholder: '#9E9E9E',
  outline: '#E0E0E0',
  error: '#F44336',
  googleBlue: '#4285F4',
};

type LoginProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">; 
};

// --- Custom Header Component ---
const CustomHeader = ({ navigation }: { navigation: LoginProps['navigation'] }) => (
    <View style={styles.headerContainer}>
        {/* Goes back to the WelcomeScreen (registered as 'Welcome') */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            {/* <ArrowLeft size={24} color={COLORS.text} /> */}
        </TouchableOpacity>
    </View>
);

export default function LoginScreen({ navigation }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- FIREBASE LOGIN LOGIC ---
  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // 🔥 SUCCESS: We do NOT navigate here. AuthContext detects the user 
      // and AppNavigator switches automatically to 'Home'. This is the stable approach.
    } catch (error: any) {
      let msg = "Invalid email or password.";
      if (error.code === "auth/too-many-requests")
        msg = "Too many failed attempts. Try again later.";
      
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => { alert("Google Sign-in initiated (Setup required)."); };
  const handleForgotPassword = () => { alert("Forgot Password? Navigating to reset screen (Setup required)."); };
  

  return (
    <View style={styles.fullContainer}>
      <CustomHeader navigation={navigation} />
      
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <View style={styles.introContainer}>
          <Text style={styles.pageTitle}>Welcome Back!</Text>
          <Text style={styles.pageSubtitle}>Login to continue your eco journey</Text>
        </View>

        {/* Email Input */}
        <Text style={styles.inputLabel}>Email</Text>
        <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
          {/* <Mail size={20} color={COLORS.placeholder} style={styles.inputIcon} /> */}
          <TextInput
            style={styles.inputField}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.placeholder}
            value={email}
            onChangeText={(text) => { setEmail(text); setErrorMessage(null); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <Text style={styles.inputLabel}>Password</Text>
        <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
          {/* <Lock size={20} color={COLORS.placeholder} style={styles.inputIcon} /> */}
          <TextInput
            style={styles.inputField}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.placeholder}
            value={password}
            onChangeText={(text) => { setPassword(text); setErrorMessage(null); }}
            secureTextEntry={true}
            autoCapitalize="none"
          />
        </View>
        
        <TouchableOpacity 
          onPress={handleForgotPassword} 
          style={styles.forgotPasswordButton}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {/* Login Button */}
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}

        {/* Separator */}
        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>or continue with</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Google Button */}
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleLogin} 
          activeOpacity={0.8}
        >
          {/* <Google size={24} color={COLORS.googleBlue} /> */}
          <Text style={styles.googleButtonText}>Google</Text>
        </TouchableOpacity>
        
        {/* Register Link */}
        <View style={styles.registerLinkContainer}>
          <Text style={styles.registerLinkBaseText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLinkHighlight}>Register</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.background, },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 50 : 60, 
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  backButton: { paddingRight: 10, paddingVertical: 5, },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, },
  content: { padding: 20, },
  introContainer: { marginBottom: 30, },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 5, },
  pageSubtitle: { fontSize: 16, color: COLORS.placeholder, },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 5, marginTop: 15, },
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
  forgotPasswordButton: { alignSelf: 'flex-end', marginTop: 5, },
  forgotPasswordText: { color: COLORS.primary, fontSize: 14, fontWeight: '600', },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 30, 
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18, },
  loadingIndicator: { marginBottom: 20, },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: COLORS.outline, },
  separatorText: { paddingHorizontal: 15, color: COLORS.placeholder, fontSize: 14, },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.outline, 
    marginBottom: 30,
  },
  googleButtonText: { color: COLORS.text, fontSize: 18, fontWeight: '600', marginLeft: 10, },
  registerLinkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 5, },
  registerLinkBaseText: { color: COLORS.placeholder, fontSize: 16, },
  registerLinkHighlight: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, },
  errorText: { color: COLORS.error, marginBottom: 15, textAlign: "center", fontWeight: "500", },
});