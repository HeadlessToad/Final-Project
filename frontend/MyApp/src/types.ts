// src/types.ts

// This defines which screens take which parameters
export type RootStackParamList = {
  Login: undefined;    // No parameters expected
  Register: undefined;
  Home: undefined;
  Classify: undefined;
};

export interface TestItem {
  id: string;
  name: string;
  status: 'active' | 'processed';
  timestamp: number;
}