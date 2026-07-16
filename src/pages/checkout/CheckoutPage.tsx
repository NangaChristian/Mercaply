// @ts-nocheck
import { db, doc, getDoc, updateDoc, setDoc, addDoc, deleteDoc, collection, serverTimestamp } from '../../lib/supabase-compat';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, CreditCard, CheckCircle2, AlertCircle, Plus, ShieldCheck } from 'lucide-react';
import { useCart } from '../../store/useCart';
import { useAuth } from '../../store/useAuth';
import { cn } from '../../utils/cn';

export function CheckoutPage() {
  const { items, getCartTotal, getCartCount, clearCart } = useCart();
  const { user: user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Form States
  const [address, setAddress] = useState({
    name: user?.displayName || '',
    street: '',
    city: 'Douala',
    region: 'Littoral',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'orange' | 'bank'>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [acceptedCGV, setAcceptedCGV] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if cart is empty
  if (items.length === 0 && step !== 3) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Votre panier est vide</h2>
        <Link to="/products" className="px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors">
          Retourner aux achats
        </Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shippingFee = subtotal > 50000 ? 0 : 2000;
  const total = subtotal + shippingFee;

  const handleNextStep = () => {
    if (step === 1) {
      if (!address.name || !address.street || !address.phone) {
        alert('Veuillez remplir tous les champs de livraison obligatoires (*)');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if ((paymentMethod === 'mtn' || paymentMethod === 'orange') && !phoneNumber) {
        alert('Veuillez entrer un numéro de téléphone valide.');
        return;
      }
      setStep(3);
    }
  };

  const handleConfirmOrder = async () => {
    if (!acceptedCGV || !user) return;
    
    setIsProcessing(true);
    try {
      // Group items by sellerId if you want separate orders per seller, 
      // but for simplicity, we mock a single order here linking to user.
      const sellerId = items[0]?.product?.sellerId || 'unknown_seller';

      const orderItems = items.map((item: any) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        variants: item.variants || {},
      }));

      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        sellerId,
        items: orderItems,
        subtotal,
        shippingFee,
        total,
        status: 'pending',
        paymentMethod: paymentMethod === 'mtn' ? 'Mobile Money (MTN)' : paymentMethod === 'orange' ? 'Orange Money' : 'Virement Bancaire',
        paymentPhone: phoneNumber,
        shippingAddress: {
          name: address.name,
          details: address.street,
          city: address.city,
          region: address.region,
          phone: address.phone,
        },
        customer: {
          name: address.name,
          email: user.email,
        },
        createdAt: new Date().toISOString(),
      });

      clearCart();
      navigate('/checkout/success');
    } catch (error) {
      console.error('Error creating order', error);
      alert('Une erreur est survenue lors de la création de la commande.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-surface-2 min-h-screen pb-20">
      {/* Header */}
      <header className="bg-background border-b border-border-light sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => step > 1 ? setStep((s) => (s - 1) as any) : navigate(-1)} className="mr-4 p-2 text-text-secondary hover:bg-surface rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <Link to="/" className="block">
              <img src="/Mercaply black-01.png" alt="Mercaply" className="h-8 object-contain" />
            </Link>
          </div>
          <div className="flex items-center text-sm font-medium text-text-secondary">
            <ShieldCheck className="h-5 w-5 mr-1.5 text-success" />
            Paiement sécurisé
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stepper */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border-light rounded-full -z-10">
              <div 
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
            
            {[
              { num: 1, label: 'Livraison', icon: MapPin },
              { num: 2, label: 'Paiement', icon: CreditCard },
              { num: 3, label: 'Confirmation', icon: CheckCircle2 }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-2 transition-colors duration-300",
                  step >= s.num ? "bg-accent text-white" : "bg-background text-text-tertiary border-border-light"
                )}>
                  <s.icon className="h-4 w-4" />
                </div>
                <span className={cn(
                  "text-xs font-medium mt-2 absolute top-10",
                  step >= s.num ? "text-text-primary" : "text-text-tertiary"
                )}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* STEP 1: ADDRESS */}
            {step === 1 && (
              <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-xl font-bold text-text-primary mb-6">Adresse de livraison</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nom complet *</label>
                    <input 
                      type="text" 
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      className="w-full px-4 py-2 border border-border-light rounded-xl focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Détails de l'adresse (rue, quartier) *</label>
                    <input 
                      type="text" 
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full px-4 py-2 border border-border-light rounded-xl focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="Rue des Manguiers, Bonapriso"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Ville *</label>
                      <input 
                        type="text" 
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full px-4 py-2 border border-border-light rounded-xl focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Région</label>
                      <input 
                        type="text" 
                        value={address.region}
                        onChange={(e) => setAddress({ ...address, region: e.target.value })}
                        className="w-full px-4 py-2 border border-border-light rounded-xl focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Numéro de téléphone *</label>
                    <input 
                      type="tel" 
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-border-light rounded-xl focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="+237 6XX XX XX XX"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border-light flex justify-end">
                  <button 
                    onClick={handleNextStep}
                    className="px-8 py-3.5 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors"
                  >
                    Continuer vers le paiement
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PAYMENT */}
            {step === 2 && (
              <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-xl font-bold text-text-primary mb-6">Moyen de paiement</h2>
                
                <div className="space-y-4 mb-8">
                  {/* MTN Mobile Money */}
                  <label className={cn(
                    "block p-4 rounded-xl border-2 cursor-pointer transition-colors",
                    paymentMethod === 'mtn' ? "border-[#FFCC00] bg-[#FFCC00]/5" : "border-border-light hover:border-text-tertiary"
                  )}>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="mtn"
                        checked={paymentMethod === 'mtn'}
                        onChange={() => setPaymentMethod('mtn')}
                        className="w-4 h-4 text-[#FFCC00] border-border-light focus:ring-[#FFCC00]"
                      />
                      <div className="ml-3 flex-1 flex items-center justify-between">
                        <span className="font-bold text-text-primary">MTN Mobile Money</span>
                        <div className="w-10 h-10 rounded-full bg-[#FFCC00] flex items-center justify-center text-black font-bold text-xs">MTN</div>
                      </div>
                    </div>
                    {paymentMethod === 'mtn' && (
                      <div className="mt-4 pl-7 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">Numéro de téléphone MTN</label>
                        <input 
                          type="tel" 
                          placeholder="Ex: 650 00 00 00"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FFCC00] focus:border-[#FFCC00]"
                        />
                        <p className="text-xs text-text-tertiary mt-2 flex items-start">
                          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                          Vous recevrez une notification USSD sur votre téléphone pour confirmer le paiement.
                        </p>
                      </div>
                    )}
                  </label>

                  {/* Orange Money */}
                  <label className={cn(
                    "block p-4 rounded-xl border-2 cursor-pointer transition-colors",
                    paymentMethod === 'orange' ? "border-[#FF6600] bg-[#FF6600]/5" : "border-border-light hover:border-text-tertiary"
                  )}>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="orange"
                        checked={paymentMethod === 'orange'}
                        onChange={() => setPaymentMethod('orange')}
                        className="w-4 h-4 text-[#FF6600] border-border-light focus:ring-[#FF6600]"
                      />
                      <div className="ml-3 flex-1 flex items-center justify-between">
                        <span className="font-bold text-text-primary">Orange Money</span>
                        <div className="w-10 h-10 rounded-xl bg-[#FF6600] flex items-center justify-center text-white font-bold text-xs">OM</div>
                      </div>
                    </div>
                    {paymentMethod === 'orange' && (
                      <div className="mt-4 pl-7 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">Numéro de téléphone Orange</label>
                        <input 
                          type="tel" 
                          placeholder="Ex: 690 00 00 00"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6600] focus:border-[#FF6600]"
                        />
                        <p className="text-xs text-text-tertiary mt-2 flex items-start">
                          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                          Composez le #150*50# si vous ne recevez pas la notification.
                        </p>
                      </div>
                    )}
                  </label>

                  {/* Bank Transfer */}
                  <label className={cn(
                    "block p-4 rounded-xl border-2 cursor-pointer transition-colors",
                    paymentMethod === 'bank' ? "border-accent bg-accent/5" : "border-border-light hover:border-text-tertiary"
                  )}>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={() => setPaymentMethod('bank')}
                        className="w-4 h-4 text-accent border-border-light focus:ring-accent"
                      />
                      <div className="ml-3 flex-1 flex items-center justify-between">
                        <span className="font-bold text-text-primary">Virement Bancaire</span>
                        <CreditCard className="h-6 w-6 text-text-tertiary" />
                      </div>
                    </div>
                    {paymentMethod === 'bank' && (
                      <div className="mt-4 pl-7 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-surface p-4 rounded-lg text-sm text-text-secondary space-y-2">
                          <p><strong>Banque:</strong> Afriland First Bank</p>
                          <p><strong>Titulaire:</strong> MERCAPLY SAS</p>
                          <p><strong>RIB:</strong> 10005 00001 01234567890 12</p>
                          <p className="text-xs text-warning-dark mt-2">
                            Votre commande sera traitée une fois le virement reçu (24-48h).
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                <div className="mt-8 pt-6 border-t border-border-light flex justify-between items-center">
                  <button 
                    onClick={() => setStep(1)}
                    className="text-sm font-medium text-text-secondary hover:text-text-primary"
                  >
                    Retour
                  </button>
                  <button 
                    onClick={handleNextStep}
                    className="px-8 py-3.5 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors"
                  >
                    Vérifier la commande
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRMATION */}
            {step === 3 && (
              <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-xl font-bold text-text-primary mb-6">Vérification finale</h2>
                
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-start pb-6 border-b border-border-light">
                    <div>
                      <h3 className="font-bold text-text-primary mb-2">Adresse de livraison</h3>
                      <p className="text-sm text-text-secondary">Jean Dupont</p>
                      <p className="text-sm text-text-secondary">Rue des Manguiers, Bonapriso</p>
                      <p className="text-sm text-text-secondary">Douala</p>
                      <p className="text-sm text-text-secondary">+237 6XX XX XX XX</p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-sm font-medium text-accent hover:underline">Modifier</button>
                  </div>

                  <div className="flex justify-between items-start pb-6 border-b border-border-light">
                    <div>
                      <h3 className="font-bold text-text-primary mb-2">Moyen de paiement</h3>
                      <p className="text-sm text-text-secondary capitalize">
                        {paymentMethod === 'mtn' ? 'MTN Mobile Money' : paymentMethod === 'orange' ? 'Orange Money' : 'Virement Bancaire'}
                      </p>
                      {phoneNumber && <p className="text-sm text-text-secondary">{phoneNumber}</p>}
                    </div>
                    <button onClick={() => setStep(2)} className="text-sm font-medium text-accent hover:underline">Modifier</button>
                  </div>

                  <div>
                    <h3 className="font-bold text-text-primary mb-4">Articles ({getCartCount()})</h3>
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg bg-surface border border-border-light overflow-hidden flex-shrink-0">
                            <img src={item.product.images?.[0]} alt={item.product.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-text-primary">{item.product.title}</h4>
                            <p className="text-sm text-text-secondary">Qté: {item.quantity}</p>
                            {item.variants && Object.keys(item.variants).length > 0 && (
                              <p className="text-xs text-text-tertiary mt-1">
                                {Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(' - ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-text-primary">{(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-surface/50 p-4 rounded-xl border border-border-light mb-8">
                  <label className="flex items-start cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={acceptedCGV}
                      onChange={(e) => setAcceptedCGV(e.target.checked)}
                      className="mt-1 w-4 h-4 text-accent border-border-light rounded focus:ring-accent"
                    />
                    <span className="ml-3 text-sm text-text-secondary">
                      J'accepte les <a href="#" className="text-accent hover:underline">Conditions Générales de Vente</a> et je confirme que ma commande est définitive.
                    </span>
                  </label>
                </div>

                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setStep(2)}
                    disabled={isProcessing}
                    className="text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-50"
                  >
                    Retour
                  </button>
                  <button 
                    onClick={handleConfirmOrder}
                    disabled={!acceptedCGV || isProcessing}
                    className="px-8 py-3.5 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                        Traitement...
                      </>
                    ) : (
                      'Confirmer et payer'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="w-full lg:w-1/3">
            <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-text-primary mb-6">Résumé de la commande</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-text-secondary">
                  <span>Sous-total ({getCartCount()} articles)</span>
                  <span>{subtotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Frais de livraison estimé</span>
                  <span>{shippingFee.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {/* Add TVA if needed */}
              </div>

              <div className="pt-4 border-t border-border-light mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-text-primary">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-accent">{total.toLocaleString('fr-FR')} FCFA</span>
                    <p className="text-xs text-text-tertiary mt-1">TVA incluse</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-success flex-shrink-0" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  Vos transactions sont sécurisées. Mercaply protège votre paiement jusqu'à la confirmation de réception.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
