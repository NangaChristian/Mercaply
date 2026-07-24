import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-white mb-6 inline-block">
              Mercaply<span className="text-accent">.</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-sm">
              La marketplace B2B & B2C nouvelle génération conçue pour l'Afrique. 
              Achetez et vendez des produits et services en toute confiance, avec une architecture d'entreprise sécurisée.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider mb-6">Plateforme</h3>
            <ul className="space-y-4">
              <li><Link to="/products" className="text-sm hover:text-white transition-colors">Catalogue Produits</Link></li>
              <li><Link to="/services" className="text-sm hover:text-white transition-colors">Répertoire Services</Link></li>
              <li><Link to="/vendors" className="text-sm hover:text-white transition-colors">Entreprises Vérifiées</Link></li>
              <li><Link to="/about" className="text-sm hover:text-white transition-colors">À propos de Mercaply</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider mb-6">Support</h3>
            <ul className="space-y-4">
              <li><Link to="/help" className="text-sm hover:text-white transition-colors">Centre d'aide</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-white transition-colors">Contactez-nous</Link></li>
              <li><Link to="/buyer-protection" className="text-sm hover:text-white transition-colors">Protection Acheteur</Link></li>
              <li><Link to="/shipping" className="text-sm hover:text-white transition-colors">Livraison & Retours</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider mb-6">Vendre</h3>
            <ul className="space-y-4">
              <li><Link to="/become-seller" className="text-sm hover:text-white transition-colors">Devenir Vendeur</Link></li>
              <li><Link to="/seller-rules" className="text-sm hover:text-white transition-colors">Règles & Tarifs</Link></li>
              <li><Link to="/kyc-process" className="text-sm hover:text-white transition-colors">Processus KYC</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-900">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Mercaply Inc. Tous droits réservés.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-sm hover:text-white transition-colors">Conditions Générales</Link>
            <Link to="/privacy" className="text-sm hover:text-white transition-colors">Confidentialité</Link>
            <Link to="/legal" className="text-sm hover:text-white transition-colors">Mentions Légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
