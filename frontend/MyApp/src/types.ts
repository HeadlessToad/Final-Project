// src/types.ts

// =======================================================
// I. CORE DATA STRUCTURES (Interfaces)
// =======================================================

/**
 * Defines the static structure of a classified waste item result (Basic/Generic).
 */
export interface ClassificationResult {
  prediction: string; // e.g., 'Plastic Bottle'
  confidence: number; // e.g., 0.98 (Confidence score 0.0 to 1.0)
  instructions: string; // Recycling instructions specific to the material
}

/**
 * Defines the static structure for a single object detected in an image.
 */
export interface DetectionItem {
  id: string;
  label: string;
  confidence: number;
  box_2d: number[]; // [x, y, w, h] normalized coordinates
}

/**
 * Defines the comprehensive response structure received from the ML backend.
 */
export interface PredictionResponse {
  prediction: string; // The primary classified material name
  confidence: number; // Confidence for the primary prediction
  tips: string; // Additional tips/instructions from the ML service
  image_id: string;      // ID assigned by backend for feedback tracking
  storage_path: string;  // Cloud Storage path where the original image is saved
  annotated_image_base64?: string; // Optional: The image with bounding boxes drawn
  detections: DetectionItem[];     // List of all objects found
  found: boolean; // Flag indicating if a recognizable object was found
}

/**
 * Defines the data structure used when sending user feedback to the backend.
 */
export interface FeedbackData {
  detectionId: string;
  originalLabel: string;
  status: 'correct' | 'wrong_label' | 'ghost'; // Type of feedback
  correctedLabel?: string; // New label if 'wrong_label'
  box_2d?: number[]; // Bounding box data if user adjusted it
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

// REMARK: UserProfile interface defined in AuthContext.tsx for type safety.


// =======================================================
// II. ROUTE PARAMETER DEFINITIONS (RootStackParamList)
// =======================================================

/**
 * Defines which screens take which parameters in the React Navigation stack.
 */
export type RootStackParamList = {
  // --- UNAUTHORIZED FLOW ---
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // --- AUTHORIZED FLOW (MAIN TABS) ---
  Home: undefined;
  Profile: undefined;
  Rewards: undefined;
  RecyclingCenters: undefined; // Map view for nearby centers

  // --- CLASSIFICATION & SCAN FLOW ---
  ScanScreen: undefined; // The camera screen (renamed from Classify for clarity)

  // 🔥 UPDATED: Now passes the comprehensive PredictionResponse object and local image URI
  ClassificationResult: {
    resultData: PredictionResponse;
    imageUri: string; // Local path to the original photo
  };

  // ClassificationResults is DEPRECATED/REMOVED to avoid conflicts

  // --- PROFILE & ACCOUNT MANAGEMENT ---
  PersonalDetails: undefined; // Displays editable details
  ClassificationHistory: undefined; // View all past scans
  PointsHistory: undefined; // View transactions

  // --- EDITING & DETAIL ROUTES ---
  EditSingleField: {
    // 🔥 fieldKey must match the key in your UserProfile/Firestore document
    fieldKey: 'fullName' | 'gender' | 'city' | 'birthDate' | 'phone';
    currentValue: string;
    // REMARK: We use 'fullName' for clarity based on profile structure
  };
  RewardDetails: {
    selectedReward: RewardItem; // Passes the reward object to the detail screen
  };

  // REMARK: Add any additional fixed-title utility screens here.
  Settings: undefined;
};