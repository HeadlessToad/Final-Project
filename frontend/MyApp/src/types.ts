// // src/types.ts

// // This defines which screens take which parameters
// export type RootStackParamList = {
//   Login: undefined;    // No parameters expected
//   Register: undefined;
//   Home: undefined;
//   Classify: undefined;
// };

// export interface TestItem {
//   id: string;
//   name: string;
//   status: 'active' | 'processed';
//   timestamp: number;
// }


// src/types.ts (Ensure this includes all routes used in AppNavigator.tsx)

export type RootStackParamList = {
  // UNAUTHORIZED
  Welcome: undefined;            // WelcomeScreen
  Login: undefined;              // Login form
  Register: undefined;
  
  // AUTHORIZED
  Home: undefined;
  Classify: undefined;
  Profile: undefined;
  Rewards: undefined;
  ClassificationResults: { /* ... parameters here ... */ }; 
  // ... any other screens ...
};
// ... rest of the file ...