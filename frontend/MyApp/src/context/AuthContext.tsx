// import React, { createContext, useContext, useEffect, useState } from "react";
// import { onAuthStateChanged, User } from "firebase/auth";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import { auth, db } from "../firebaseConfig";

// interface AuthContextType {
//   user: User | null;
//   userRole: "admin" | "user" | null;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   userRole: null,
//   loading: true,
// });

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
//       if (authenticatedUser) {
//         setUser(authenticatedUser);

//         // Fetch the user's role from Firestore
//         const userDocRef = doc(db, "users", authenticatedUser.uid);
//         try {
//           const userDoc = await getDoc(userDocRef);

//           if (userDoc.exists()) {
//             setUserRole(userDoc.data().role);
//           } else {
//             // Option B: User is new (Registration Race Condition Fix)
//             // The doc is missing, so we create it HERE.
//             console.log("Creating missing user profile in Firestore...");

//             await setDoc(userDocRef, {
//               email: authenticatedUser.email,
//               role: "user", // Default role
//               createdAt: new Date().toISOString(),
//             });
//             setUserRole("user");
//           }
//         } catch (error) {
//           console.error("Error fetching user role:", error);
//           setUserRole("user"); // Fallback role
//         }
//       } else {
//         setUser(null);
//         setUserRole(null);
//       }
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, userRole, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };



// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

// --- NEW INTERFACE: Defines the full structure of the Firestore user document ---
export interface UserProfile {
    // Authentication & Core Identity
    email: string;
    fullName: string;
    role: "admin" | "user";
    createdAt: string;

    // Media
    profileImageUrl: string | null;

    // Gamification & Stats
    points: number;
    itemsScanned: number;
    rewardsRedeemed: number; // NEW: Tracking user engagement (Replaces co2SavedKg)

    // Personal Details (Optional/Editable)
    gender: string | null;
    city: string | null;
    birthDate: string | null;
    phone: string | null;
}

// --- UPDATED CONTEXT TYPE: Includes the full profile data ---
interface AuthContextType {
    user: User | null;
    profile: UserProfile | null; // Provides easy access to Firestore data
    userRole: "admin" | "user" | null;
    loading: boolean;
}

// --- INITIAL CONTEXT VALUE ---
const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    userRole: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null); // New state for profile
    const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
            if (authenticatedUser) {
                setUser(authenticatedUser);

                // Fetch the user's document from Firestore
                const userDocRef = doc(db, "users", authenticatedUser.uid);
                try {
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data() as UserProfile;
                        setProfile(data); // Set the full profile data
                        setUserRole(data.role);

                    } else {
                        // Option B: User is new/first login. Create the document with ALL required fields.
                        console.log("Creating missing user profile in Firestore...");

                        const initialProfile: UserProfile = {
                            email: authenticatedUser.email || 'N/A',
                            // Fallback for fullName if not set during registration (should be set via updateProfile)
                            fullName: authenticatedUser.displayName || authenticatedUser.email?.split('@')[0] || 'Eco Warrior',
                            role: "user",
                            createdAt: new Date().toISOString(),

                            // Media & Status
                            profileImageUrl: authenticatedUser.photoURL || null, 

                            // Gamification & Stats (Initial values set to 0/null)
                            points: 0,
                            itemsScanned: 0,
                            rewardsRedeemed: 0, // NEW field
                            
                            // Personal Details (Initially null)
                            gender: null,
                            city: null,
                            birthDate: null,
                            phone: null,
                        };

                        await setDoc(userDocRef, initialProfile);
                        setProfile(initialProfile);
                        setUserRole("user");
                    }
                } catch (error) {
                    console.error("Error fetching user role/profile:", error);
                    setProfile(null);
                    setUserRole("user"); // Fallback role
                }
            } else {
                // User logged out
                setUser(null);
                setProfile(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, userRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
};