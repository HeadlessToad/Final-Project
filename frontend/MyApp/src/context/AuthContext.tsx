// src/context/AuthContext.tsx
// ============================================================================
// COMPONENT PURPOSE:
// This is the global Authentication Context Provider. It manages the user's 
// authentication state (via Firebase Auth) and their profile data (via Firestore).
// It also handles session expiration and real-time profile updates.
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

// Session configuration - adjust this value to change session duration
// Defines how long a user can stay logged in before being forced to re-authenticate.
const SESSION_DURATION_HOURS = 2; // Users stay logged in for 2 hours
const SESSION_DURATION_MS = SESSION_DURATION_HOURS * 60 * 60 * 1000;

// --- NEW INTERFACE: Defines the full structure of the Firestore user document ---
// This ensures TypeScript type safety whenever we read/write user data to the database.
export interface UserProfile {
  // Authentication & Core Identity
  email: string;
  fullName: string;
  role: "admin" | "user";
  createdAt: string;

  // Gamification & Stats
  points: number;
  itemsScanned: number;
  rewardsRedeemed: number;

  // Personal Details (Optional/Editable)
  gender: string | null;
  city: string | null;
  birthDate: string | null;
  phone: string | null;

  // Session Management
  lastLoginTimestamp?: number;
}

// --- UPDATED CONTEXT TYPE: Includes the profile refresh function ---
// Defines what data and functions are available to components consuming this context.
interface AuthContextType {
  user: User | null;                       // Firebase Auth user object
  profile: UserProfile | null;             // Detailed user data from Firestore
  userRole: "admin" | "user" | null;       // Quick access to the user's role
  loading: boolean;                        // True while determining initial auth state
  refreshProfile: () => Promise<void>;     // Function to manually re-fetch the profile
}

// --- INITIAL CONTEXT VALUE ---
// Sets the default state before Firebase has responded.
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  userRole: null,
  loading: true,
  refreshProfile: async () => {}, // Placeholder function
});

// Custom hook to make it easy for other components to access the auth context.
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 NEW FUNCTION: Centralized profile fetching
  // Fetches the user's Firestore document. If it doesn't exist (e.g., first login),
  // it creates a default profile for them.
  const fetchProfile = async (authenticatedUser: User) => {
    const userDocRef = doc(db, "users", authenticatedUser.uid);
    try {
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Profile exists, load it into state
        const data = userDoc.data() as UserProfile;
        setProfile(data);
        setUserRole(data.role);
        return data; // Return data for immediate use
      } else {
        // If doc is missing, create the initial profile using Auth data
        console.log("Creating missing user profile in Firestore...");

        const initialProfile: UserProfile = {
          email: authenticatedUser.email || "N/A",
          fullName:
            authenticatedUser.displayName ||
            authenticatedUser.email?.split("@")[0] ||
            "Eco Warrior",
          role: "user",
          createdAt: new Date().toISOString(),

          points: 0,
          itemsScanned: 0,
          rewardsRedeemed: 0,

          gender: null,
          city: null,
          birthDate: null,
          phone: null,
        };

        await setDoc(userDocRef, initialProfile);
        setProfile(initialProfile);
        setUserRole("user");
        return initialProfile;
      }
    } catch (error) {
      console.error("Error fetching user role/profile:", error);
      setProfile(null);
      setUserRole("user");
      return null;
    }
  };

  // 🔥 NEW FUNCTION: Public function to force profile update after a save
  // Allows components (like a Profile Edit screen) to force a re-fetch of data.
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  // --------------------------------------------------------------------------
  // AUTHENTICATION & SESSION EFFECT
  // Listens to Firebase Auth state changes and sets up Firestore data listeners
  // --------------------------------------------------------------------------
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    // Listen for login/logout events from Firebase Auth
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (authenticatedUser) => {
        // Clean up previous profile listener when auth state changes
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        if (authenticatedUser) {
          const userDocRef = doc(db, "users", authenticatedUser.uid);

          // ------------------------------------------------------------------
          // SESSION EXPIRATION CHECK
          // ------------------------------------------------------------------
          // Check if session has expired (using Firestore timestamp)
          try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              const lastLoginTimestamp = data.lastLoginTimestamp;

              if (lastLoginTimestamp) {
                const now = Date.now();
                const elapsed = now - lastLoginTimestamp;

                // If the time elapsed since last login exceeds the duration, sign them out
                if (elapsed > SESSION_DURATION_MS) {
                  // Session expired - sign out the user
                  console.log("Session expired, signing out user...");
                  await signOut(auth);
                  setUser(null);
                  setProfile(null);
                  setUserRole(null);
                  setLoading(false);
                  return; // Exit early, don't set up profile listener
                }
              }
              // If no timestamp exists, user will need to log in again
              // (timestamp is set on login/register)
            }
          } catch (error) {
            console.error("Error checking session expiration:", error);
          }

          // If session is valid, set the user state
          setUser(authenticatedUser);

          // ------------------------------------------------------------------
          // PROFILE INITIALIZATION & REAL-TIME LISTENER
          // ------------------------------------------------------------------
          // Re-fetch to check if the document exists, create if missing
          const latestUserDoc = await getDoc(userDocRef);
          if (!latestUserDoc.exists()) {
            console.log("Creating missing user profile in Firestore...");
            const initialProfile: UserProfile = {
              email: authenticatedUser.email || "N/A",
              fullName:
                authenticatedUser.displayName ||
                authenticatedUser.email?.split("@")[0] ||
                "Eco Warrior",
              role: "user",
              createdAt: new Date().toISOString(),
              points: 0,
              itemsScanned: 0,
              rewardsRedeemed: 0,
              gender: null,
              city: null,
              birthDate: null,
              phone: null,
            };
            await setDoc(userDocRef, initialProfile);
          }

          // Set up real-time listener for the user document
          // This ensures that if points or data change in Firestore, the app updates instantly
          unsubscribeProfile = onSnapshot(
            userDocRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data() as UserProfile;
                setProfile(data);
                setUserRole(data.role);
              }
            },
            (error) => {
              console.error("Error listening to profile changes:", error);
            },
          );
        } else {
          // User is logged out, clear all state
          setUser(null);
          setProfile(null);
          setUserRole(null);
        }
        // Mark loading as false once the initial check is complete
        setLoading(false);
      },
    );

    // Cleanup function: remove listeners when the component unmounts
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // Provide the state and functions to all child components
  return (
    <AuthContext.Provider
      value={{ user, profile, userRole, loading, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};