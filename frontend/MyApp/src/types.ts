export interface TestItem {
  id: string;
  name: string;
  status: 'active' | 'processed'; // logic for future ML status
  timestamp: number;
}