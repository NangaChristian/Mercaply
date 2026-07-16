import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export function CheckoutSuccessPage() {
  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const orderNumber = `CMD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  return (
    <div className="min-h-screen bg-surface-2 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-background rounded-3xl border border-border-light p-8 text-center shadow-xl animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12 text-success" />
        </div>
        
        <h1 className="text-2xl font-bold text-text-primary mb-2">Commande confirmée !</h1>
        <p className="text-text-secondary mb-6">
          Merci pour votre achat. Votre commande a été enregistrée avec succès.
        </p>

        <div className="bg-surface rounded-2xl p-4 mb-8">
          <p className="text-sm text-text-tertiary uppercase tracking-wider font-semibold mb-1">Numéro de commande</p>
          <p className="text-lg font-bold text-text-primary">{orderNumber}</p>
        </div>

        <p className="text-sm text-text-secondary mb-8">
          Un email de confirmation contenant les détails de votre commande a été envoyé à votre adresse email.
        </p>

        <div className="space-y-3">
          <Link 
            to="/buyer/orders" 
            className="w-full py-3.5 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors flex items-center justify-center"
          >
            <Package className="h-5 w-5 mr-2" />
            Suivre ma commande
          </Link>
          <Link 
            to="/products" 
            className="w-full py-3.5 bg-background border border-border-light text-text-primary font-medium rounded-xl hover:bg-surface transition-colors flex items-center justify-center"
          >
            Continuer mes achats
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
