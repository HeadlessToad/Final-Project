// src/types.ts

// =======================================================
// I. CORE DATA STRUCTURES (Interfaces)
// =======================================================

/**
 * Defines the static structure of a classified waste item result.
 */
export interface ClassificationResult {
  prediction: string; // e.g., 'Plastic Bottle'
  confidence: number; // e.g., 0.98 (Confidence score 0.0 to 1.0)
  instructions: string; // Recycling instructions specific to the material
}

/**
 * Defines the structure for a user's redeemable reward item.
 */
export interface RewardItem {
  id: number;
  title: string;
  points: number; // Cost in user points
  image: string; // URL for the reward image
  description: string;
}

// REMARK: Add the UserProfile interface here when finalized in AuthContext.
// For now, we will assume the data structure used by the navigation parameters is sufficient.


// =======================================================
// II. ROUTE PARAMETER DEFINITIONS (RootStackParamList)
// =======================================================

/**
 * Defines which screens take which parameters in the React Navigation stack.
 */
export type RootStackParamList = {
  // --- UNAUTHORIZED FLOW ---
  // REMARK: Screens accessible before a user logs in.
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // --- AUTHORIZED FLOW (MAIN TABS) ---
  // REMARK: Top-level screens in the authenticated app area.
  Home: undefined;
  Profile: undefined;
  Rewards: undefined;
  RecyclingCenters: undefined; // Map view for nearby centers
  ScanScreen: undefined; // The camera screen (for classification)

  // --- CLASSIFICATION & SCAN FLOW ---
  // REMARK: Routes related to scanning and results.
  ClassificationResult: undefined; // The screen that shows the output and points
  // ClassificationResults is DEPRECATED/REMOVED to avoid conflicts with ClassificationResult
  // It is safer to pass complex data via a simpler route name if possible.

  // --- PROFILE & ACCOUNT MANAGEMENT ---
  // REMARK: Routes accessible from the Profile screen.
  PersonalDetails: undefined; // Displays editable details
  ClassificationHistory: undefined; // View all past scans
  PointsHistory: undefined; // View transactions

  // --- EDITING & DETAIL ROUTES ---
  // COMMAND: Use this generic route to edit single profile fields.
  EditSingleField: {
    // 🔥 fieldKey must match the key in your UserProfile/Firestore document
    fieldKey: 'fullName' | 'gender' | 'city' | 'birthDate' | 'phone';
    currentValue: string;
    // REMARK: We removed 'name' and use 'fullName' for clarity based on profile structure
  };
  RewardDetails: {
    // COMMAND: Passes the reward object to the detail screen
    selectedReward: RewardItem;
  };

  // REMARK: Add any additional fixed-title utility screens here.
  Settings: undefined;
};