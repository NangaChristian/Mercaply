// @ts-nocheck
import { db, doc, getDoc, updateDoc, setDoc, addDoc, deleteDoc, collection, serverTimestamp } from '../../lib/supabase-compat';
import { useCategories } from '../../contexts/CategoriesContext';
import { ProductReviews } from "../../components/product/ProductReviews";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { MapPin, Briefcase, Star, Clock, Send, MessageCircle } from 'lucide-react';
import {  CAMEROON_REGIONS } from '../../constants';
import { Service, Store } from '../../types';

export function ServiceDetailPage() {
  const { productCategories: PRODUCT_CATEGORIES, serviceCategories: SERVICE_CATEGORIES } = useCategories();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const docRef = doc(db, 'services', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const s = { id: docSnap.id, ...docSnap.data() } as Service;
          setService(s);
          
          if (s.sellerId) {
            const storeRef = doc(db, 'stores', s.sellerId);
            const storeSnap = await getDoc(storeRef);
            if (storeSnap.exists()) {
              setStore({ id: storeSnap.id, ...storeSnap.data() } as Store);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching service:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleRequestService = async () => {
    if (!user) {
      navigate('/auth/login', { state: { returnTo: `/service/${id}` } });
      return;
    }
    if (!service) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'serviceRequests'), {
        serviceId: service.id,
        buyerId: user.uid,
        sellerId: service.sellerId,
        message,
        status: 'pending',
        price: service.price,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setRequested(true);
    } catch (err) {
      console.error('Error requesting service:', err);
      alert('Erreur lors de la demande de service');
    } finally {
      setIsSending(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      navigate('/auth/login', { state: { returnTo: `/service/${id}` } });
      return;
    }
    if (!service) return;
    
    // Simple navigation to messages (could ideally pass seller ID to start conversation)
    navigate('/buyer/messages', { state: { recipientId: service.sellerId } });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-text-tertiary">Chargement...</div>;
  }

  if (!service) {
    return <div className="p-8 text-center text-text-tertiary">Service introuvable.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-surface rounded-3xl border border-border-light overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Service Image Gallery */}
          <div className="w-full lg:w-1/2 p-6">
            <div className="aspect-square bg-border-light rounded-2xl overflow-hidden mb-4">
              {service.images && service.images.length > 0 ? (
                <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                   <Briefcase className="w-20 h-20 text-gray-300" />
                </div>
              )}
            </div>
            {service.images && service.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {service.images.slice(1).map((img, idx) => (
                  <button key={idx} className="aspect-square rounded-xl overflow-hidden border-2 border-transparent">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col justify-center">
            
            <div className="flex items-center gap-2 text-sm text-text-tertiary mb-4">
              <span className="bg-background px-3 py-1 rounded-full border border-border-light">
                {SERVICE_CATEGORIES.find(c => c.id === service.category)?.name || service.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-4 leading-tight">{service.title}</h1>
            
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border-light">
               <div className="flex items-center gap-2 text-text-secondary">
                 <MapPin className="w-5 h-5" />
                 <span>{CAMEROON_REGIONS.find(r => r.id === service.region)?.name || service.region}</span>
               </div>
               {service.deliveryTime && (
                 <div className="flex items-center gap-2 text-text-secondary">
                   <Clock className="w-5 h-5" />
                   <span>{service.deliveryTime}</span>
                 </div>
               )}
            </div>

            <div className="mb-8">
              <div className="text-sm text-text-tertiary mb-1">Prix suggéré</div>
              <div className="text-4xl font-black text-accent">
                {service.priceType === 'starting_at' && 'Dès '}
                {service.price.toLocaleString('fr-FR')} FCFA
                {service.priceType === 'hourly' && <span className="text-lg font-normal text-text-secondary"> / heure</span>}
              </div>
            </div>

            <div className="prose prose-sm text-text-secondary mb-8">
              <h3 className="text-lg font-bold text-text-primary mb-2">À propos de ce service</h3>
              <p className="whitespace-pre-wrap leading-relaxed">{service.description}</p>
            </div>

            {/* Request form or actions */}
            {!requested ? (
              <div className="bg-background rounded-2xl p-6 border border-border-light">
                <h3 className="font-bold text-text-primary mb-4">Demander une prestation</h3>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre besoin en détail..."
                  rows={4}
                  className="w-full px-4 py-3 bg-surface border border-border-light rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleRequestService}
                    disabled={isSending || !message.trim()}
                    className="flex-1 bg-accent text-white py-3 md:py-4 rounded-xl font-bold hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSending ? 'Envoi...' : <><Briefcase className="w-5 h-5" /> Engager</>}
                  </button>
                  <button 
                    onClick={handleContactSeller}
                    className="flex-1 bg-surface border-2 border-border-light text-text-primary py-3 md:py-4 rounded-xl font-bold hover:border-text-tertiary hover:bg-background transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contacter
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-text-primary mb-2">Demande envoyée !</h3>
                <p className="text-text-secondary">Le vendeur vous contactera sous peu pour discuter des détails.</p>
              </div>
            )}
            
            {/* Store Preview */}
            {store && (
               <div className="mt-8 pt-8 border-t border-border-light flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-surface flex-shrink-0 border border-border-light">
                    {store.logo ? (
                      <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-lg bg-border-light">
                        {store.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{store.name}</h4>
                    <p className="text-sm text-text-secondary flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {store.rating.toFixed(1)} ({store.totalSales} ventes)
                    </p>
                  </div>
               </div>
            )}

          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 bg-surface rounded-3xl border border-border-light p-6 lg:p-10">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Avis clients</h2>
        <ProductReviews productId={service.id} />
      </div>
    </div>

  );
}
