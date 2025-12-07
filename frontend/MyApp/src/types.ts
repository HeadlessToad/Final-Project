// src/types.ts

import { LatLng } from 'react-native-maps'; 

/** Placeholder for Classification Result Structure */
export interface ClassificationResult {
  prediction: string;       
  confidence: number;       
  instructions: string;     
}

// ... (You would include UserProfile, PointTransaction, etc., here) ...

/**
 * Defines which screens take which parameters.
 */
export type RootStackParamList = {
  // --- UNAUTHORIZED FLOW ---
  Welcome: undefined; 
  Login: undefined; 
  Register: undefined;
  
  // --- AUTHORIZED FLOW ---
  Home: undefined;
  
  // CORE APP FEATURES
  Classify: undefined; 
  ClassificationResults: ClassificationResult & { imageUrl: string };
  
  // GAMIFICATION & ACCOUNT
  Profile: undefined;         
  Rewards: undefined;

  RewardDetails: { 
        selectedReward: RewardItem; // Passes the selected reward object
        // NOTE: We don't need updateUserData here, we'll use a hook.
    };
    
  PointsHistory: undefined;
    
  // 🔥 UPDATED/NEW ROUTES:
  PersonalDetails: undefined;         // Edit Profile/Personal Details Form
  // 🔥 NEW GENERIC EDIT ROUTE
  EditSingleField: {
    fieldKey: 'name' | 'gender' | 'city' | 'birthDate' | 'phone';
    currentValue: string;
    // Optional: callback function to update parent state after saving (more complex but cleaner)
  };
  ClassificationHistory: undefined;   // View all past scans (History)
  RecyclingCenters: undefined;        // Map view for nearby centers
};

export interface RewardItem {
    id: number;
    title: string;
    points: number;
    image: string; // URL
    description: string;
}