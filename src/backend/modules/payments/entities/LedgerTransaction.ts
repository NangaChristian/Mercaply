export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionPurpose = 'PAYMENT' | 'REFUND' | 'PAYOUT' | 'COMMISSION' | 'ESCROW_RELEASE';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface LedgerTransaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  purpose: TransactionPurpose;
  amount: number;
  currency: string;
  reference_type: 'order' | 'payout' | 'refund';
  reference_id: string;
  status: TransactionStatus;
  created_at: Date;
}
