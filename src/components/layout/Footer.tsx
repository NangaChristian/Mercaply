import { Link } from 'react-router-dom';
import { Facebook, Twitter, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1D1D1F] text-white mt-auto pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white/80">À propos Mercaply</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/about" className="text-sm text-white/60 hover:text-white transition-colors">Qui sommes-nous ?</Link></li>
              <li><Link to="/careers" className="text-sm text-white/60 hover:text-white transition-colors">Carrières</Link></li>
              <li><Link to="/press" className="text-sm text-white/60 hover:text-white transition-colors">Presse</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white/80">Aide & Support</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/help" className="text-sm text-white/60 hover:text-white transition-colors">Centre d'aide</Link></li>
              <li><Link to="/how-to-buy" className="text-sm text-white/60 hover:text-white transition-colors">Comment acheter</Link></li>
              <li><Link to="/local-payments" className="text-sm text-white/60 hover:text-white transition-colors">Paiements locaux</Link></li>
              <li><Link to="/buyer-protection" className="text-sm text-white/60 hover:text-white transition-colors">Protection de l'acheteur</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white/80">Vendre sur Mercaply</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/become-seller" className="text-sm text-white/60 hover:text-white transition-colors">Devenir vendeur</Link></li>
              <li><Link to="/seller-rules" className="text-sm text-white/60 hover:text-white transition-colors">Règles de vente</Link></li>
              <li><Link to="/distribution-centers" className="text-sm text-white/60 hover:text-white transition-colors">Centres de distribution</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white/80">Légal</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Conditions d'utilisation</Link></li>
              <li><Link to="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link to="/report-abuse" className="text-sm text-white/60 hover:text-white transition-colors">Signaler un abus</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/60">
            &copy; {new Date().getFullYear()} MERCAPLY. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-white/60 hover:text-white transition-colors">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-white/60 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-white/60 hover:text-white transition-colors">
              <span className="sr-only">WhatsApp</span>
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
