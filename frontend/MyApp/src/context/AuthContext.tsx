// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

// --- NEW INTERFACE: Defines the full structure of the Firestore user document ---
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
}

// --- UPDATED CONTEXT TYPE: Includes the profile refresh function ---
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  userRole: "admin" | "user" | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

// --- INITIAL CONTEXT VALUE ---
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  userRole: null,
  loading: true,
  refreshProfile: async () => {}, // Placeholder function
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 NEW FUNCTION: Centralized profile fetching
  const fetchProfile = async (authenticatedUser: User) => {
    const userDocRef = doc(db, "users", authenticatedUser.uid);
    try {
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setProfile(data);
        setUserRole(data.role);
        return data; // Return data for immediate use
      } else {
        // If doc is missing, create the initial profile
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
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (authenticatedUser) => {
        // Clean up previous profile listener when auth state changes
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        if (authenticatedUser) {
          setUser(authenticatedUser);
          const userDocRef = doc(db, "users", authenticatedUser.uid);

          // First check if the document exists, create if missing
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
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
          setUser(null);
          setProfile(null);
          setUserRole(null);
        }
        setLoading(false);
      },
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, userRole, loading, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
