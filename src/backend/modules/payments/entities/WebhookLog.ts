export interface WebhookLog {
  id: string;
  provider: string;
  event_id: string; // Must be unique to prevent replay
  event_type: string;
  payload: any;
  status: 'pending' | 'processed' | 'failed';
  error_message?: string;
  created_at: Date;
}
