export interface Wallet {
  id: string;
  owner_id: string; // User ID or Company ID or 'PLATFORM'
  owner_type: 'USER' | 'COMPANY' | 'PLATFORM';
  currency: string;
  available_balance: number;
  locked_balance: number;
  escrow_balance: number; // For platform only usually
  created_at: Date;
  updated_at: Date;
}
