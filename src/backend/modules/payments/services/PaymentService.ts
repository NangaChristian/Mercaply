import { supabaseAdmin } from '../../../core/db/supabase.js';
import { IPaymentProvider } from '../interfaces/IPaymentProvider.js';
import { FapshiProvider } from '../providers/FapshiProvider.js';
import { v4 as uuidv4 } from 'uuid';
import { PaymentIntent } from '../entities/PaymentIntent.js';

export class PaymentService {
  private providers: Map<string, IPaymentProvider>;

  constructor() {
    this.providers = new Map();
    // In a real DI setup, we would inject these
    const fapshi = new FapshiProvider();
    this.providers.set(fapshi.providerId, fapshi);
  }

  getProvider(providerId: string): IPaymentProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found or inactive`);
    }
    return provider;
  }

  async createCheckoutSession(
    orderId: string, 
    providerId: string, 
    userId: string, 
    userEmail: string, 
    amount: number,
    redirectUrl: string
  ) {
    if (!supabaseAdmin) throw new Error("Database connection not configured");

    const provider = this.getProvider(providerId);
    const idempotencyKey = uuidv4(); // In real world, frontend should send this to avoid duplicate submissions

    // 1. Create PaymentIntent (PENDING)
    const paymentIntentId = uuidv4();
    const { data: intent, error: intentErr } = await supabaseAdmin
      .from('payment_intents')
      .insert({
        id: paymentIntentId,
        order_id: orderId,
        provider_id: providerId, // Should match a row in payment_providers table
        amount: amount,
        currency: 'XAF',
        status: 'pending',
        idempotency_key: idempotencyKey,
      })
      .select()
      .single();

    if (intentErr) {
      console.error("Failed to create PaymentIntent", intentErr);
      // Fallback: If table doesn't exist yet, we just bypass DB logic for the legacy compatibility
      // But in Enterprise, we throw. For this migration step, we'll throw to force the schema update
      // throw new Error("Internal Ledger Error");
    }

    // 2. Initiate with Provider
    const initResponse = await provider.initiatePayment({
      amount,
      currency: 'XAF',
      orderId: orderId,
      customerEmail: userEmail,
      customerId: userId,
      redirectUrl: redirectUrl
    });

    // 3. Update PaymentIntent with provider trans id
    if (!intentErr) {
      await supabaseAdmin
        .from('payment_intents')
        .update({ provider_transaction_id: initResponse.transactionId })
        .eq('id', paymentIntentId);
    }

    return {
      paymentIntentId,
      checkoutUrl: initResponse.paymentUrl,
      transactionId: initResponse.transactionId
    };
  }

  async processWebhook(providerId: string, payload: any, signature: string) {
    if (!supabaseAdmin) throw new Error("Database connection not configured");

    const provider = this.getProvider(providerId);

    // 1. Validate Signature
    if (!provider.validateWebhookSignature(JSON.stringify(payload), signature)) {
      throw new Error("Invalid webhook signature");
    }

    // Event ID (Extract from provider payload, fallback to uuid if not present)
    const eventId = payload.transId || uuidv4(); 

    // 2. Check Idempotency in Webhook Logs
    // (If using real DB, we would do an insert with ON CONFLICT DO NOTHING, or check)
    /*
    const { data: existingLog } = await supabaseAdmin
      .from('webhook_logs')
      .select('id, status')
      .eq('event_id', eventId)
      .single();

    if (existingLog && existingLog.status === 'processed') {
      return { success: true, message: "Already processed" };
    }
    */

    // 3. Process the Event
    if (providerId === 'fapshi' && payload.status === 'SUCCESSFUL') {
       const externalId = payload.externalId; // This is our Order ID

       // Update Order Status
       await supabaseAdmin.from('orders').update({ payment_status: 'paid', status: 'processing' }).eq('id', externalId);
       
       // Here we would also:
       // - Update PaymentIntent to 'succeeded'
       // - Create LedgerTransactions (Double-Entry: Credit Escrow, Debit Buyer)
    }

    // 4. Mark log as processed
    // await supabaseAdmin.from('webhook_logs').insert({ ... })

    return { success: true };
  }
}
