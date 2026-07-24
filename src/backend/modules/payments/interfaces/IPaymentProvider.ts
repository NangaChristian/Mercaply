export interface InitPaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerId: string;
  redirectUrl: string;
}

export interface InitPaymentResponse {
  transactionId: string;
  paymentUrl: string;
  rawResponse?: any;
}

export interface IPaymentProvider {
  /**
   * Identifiant unique du provider (ex: 'fapshi', 'stripe', 'mtn_momo')
   */
  readonly providerId: string;

  /**
   * Initialise une session de paiement avec le fournisseur
   */
  initiatePayment(request: InitPaymentRequest): Promise<InitPaymentResponse>;

  /**
   * Vérifie le statut d'un paiement auprès du fournisseur
   */
  verifyPaymentStatus(transactionId: string): Promise<{
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    amount?: number;
    currency?: string;
  }>;

  /**
   * Initie un transfert (Payout) vers un portefeuille mobile/bancaire
   */
  initiatePayout?(amount: number, currency: string, destination: any): Promise<any>;

  /**
   * Valide la signature d'un webhook entrant
   */
  validateWebhookSignature(payload: string, signature: string): boolean;
}
