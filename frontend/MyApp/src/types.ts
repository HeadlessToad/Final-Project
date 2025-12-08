// src/types.ts


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
  ForgotPassword: undefined;
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

  ScanScreen: undefined; // The camera screen (renamed from Classify for clarity)
  ClassificationResult: undefined; // The screen that shows the output and points
    
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