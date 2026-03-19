// src/types.ts
// ============================================================================
// FILE PURPOSE:
// This is the central TypeScript definition file for the entire application.
// It acts as the "contract" for data structures, ensuring type safety across 
// components, API calls, and React Navigation. Keeping these globally defined 
// prevents runtime errors caused by passing incorrect data types between screens.
// ============================================================================

// =======================================================
// I. CORE DATA STRUCTURES (Interfaces)
// =======================================================

/**
 * Defines the static structure of a classified waste item result (Basic/Generic).
 * Often used as a simplified fallback or for legacy scan history items.
 */
export interface ClassificationResult {
  prediction: string;   // e.g., 'Plastic Bottle'
  confidence: number;   // e.g., 0.98 (Confidence score ranging from 0.0 to 1.0)
  instructions: string; // Recycling instructions specific to the material
}

/**
 * Defines the static structure for a single bounding box object detected in an image 
 * by the YOLO Machine Learning model.
 */
export interface DetectionItem {
  id: string;           // Unique identifier for the detected object
  label: string;        // The ML class name (e.g., 'cardboard', 'glass')
  confidence: number;   // The model's certainty that this object is correct
  box_2d: number[];     // [x_center, y_center, width, height] as normalized coordinates (0-1)
}

/**
 * Defines the comprehensive response structure received from the custom Python/Flask ML backend
 * after submitting a photo for analysis.
 */
export interface PredictionResponse {
  prediction: string;   // The primary classified material name (highest confidence)
  confidence: number;   // Confidence for the primary prediction
  tips: string;         // Additional tips/instructions from the ML service
  image_id: string;     // Unique ID assigned by the backend for feedback tracking & ML training
  storage_path: string; // Cloud Storage path where the original image was saved by the backend
  annotated_image_base64?: string; // Optional: The image with bounding boxes drawn directly on it
  detections: DetectionItem[];     // List of all individual objects found in the photo
  found: boolean;       // Flag indicating if at least one recognizable waste object was found
}

/**
 * Defines the data structure used when sending user validation/feedback back to the server.
 * This is crucial for re-training and improving the ML model over time.
 */
export interface FeedbackData {
  detectionId: string;
  originalLabel: string;
  status: 'correct' | 'wrong_label' | 'ghost'; // Ghost means the box drew around empty space
  correctedLabel?: string; // Populated only if the user marked status as 'wrong_label'
  box_2d?: number[];       // Bounding box data if the user adjusted or drew a new one
}

/**
 * Defines the structure for a redeemable reward item in the gamification catalog.
 */
export interface RewardItem {
  id: number;
  title: string;
  points: number;       // Cost to redeem this item in user points
  image: string;        // URL for the reward's thumbnail image
  description: string;  // Details and terms of the reward
}

// REMARK: UserProfile interface is defined locally in AuthContext.tsx for strict context type safety.

// =======================================================
// II. ROUTE PARAMETER DEFINITIONS (RootStackParamList)
// =======================================================

/**
 * Defines which screens exist in the app and exactly what parameters they expect to receive.
 * This enforces strict typing for React Navigation's `navigation.navigate()` function.
 */
export type RootStackParamList = {
  // --- UNAUTHORIZED FLOW ---
  // Screens shown when the user is NOT logged in. None require parameters.
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // --- AUTHORIZED FLOW (MAIN TABS) ---
  // Core dashboard screens.
  Home: undefined;
  Profile: undefined;
  Rewards: undefined;
  
  // RecyclingCenters can optionally receive a specific center to focus the map on
  RecyclingCenters: { focusCenter?: { id: number; name: string; latitude: number; longitude: number; } } | undefined;

  // --- CLASSIFICATION & SCAN FLOW ---
  ScanScreen: undefined; // The camera screen (renamed from Classify for clarity)

  // 🔥 UPDATED: Now passes the comprehensive PredictionResponse object and local image URI
  // This prevents downloading the image twice and passes the full ML payload to the UI.
  ClassificationResult: {
    resultData: PredictionResponse;
    imageUri: string; // Local device path to the original photo taken by the camera
  };

  // ClassificationResults is DEPRECATED/REMOVED to avoid routing conflicts

  // --- PROFILE & ACCOUNT MANAGEMENT ---
  PersonalDetails: undefined;   // Displays a list of editable profile details
  ClassificationHistory: undefined; // View all past scans and earned points
  PointsHistory: undefined;     // View transactions and redeemed rewards
  CommunityReview: undefined;   // Help review pending images to train the AI

  // --- EDITING & DETAIL ROUTES ---
  
  // A dynamic screen that edits one specific field in the user's Firestore document
  EditSingleField: {
    // fieldKey must match the exact key in your UserProfile/Firestore document schema
    fieldKey: 'fullName' | 'gender' | 'city' | 'birthDate' | 'phone';
    currentValue: string; // The current value to display in the text input
    // REMARK: We use 'fullName' for clarity based on profile structure
  };
  
  // Displays the detailed view and redemption button for a specific catalog item
  RewardDetails: {
    selectedReward: RewardItem; // Passes the full reward object to the detail screen
  };

  // REMARK: Add any additional fixed-title utility screens here.
  Settings: undefined;
};