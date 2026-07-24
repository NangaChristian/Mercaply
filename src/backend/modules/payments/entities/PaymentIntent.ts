export type PaymentIntentStatus = 'pending' | 'requires_action' | 'succeeded' | 'failed' | 'canceled';

export interface PaymentIntent {
  id: string;
  order_id: string;
  provider_id: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  provider_transaction_id: string | null;
  idempotency_key: string;
  created_at: Date;
  updated_at: Date;
}
