// @ts-nocheck
import React, { useState } from 'react';
import { Star, MessageCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../store/useAuth';
import { useReviews, ReviewWithAuthor } from '../../hooks/useReviews';
import { cn } from '../../utils/cn';
import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';


interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const { reviews, isLoading, addReview, averageRating } = useReviews(productId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true);

  useEffect(() => {
    async function checkPurchase() {
      if (!user || !productId) {
        setIsCheckingPurchase(false);
        return;
      }
      try {
        // Check products in orders
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const orderSnaps = await getDocs(q);
        let found = false;
        
        for (const doc of orderSnaps.docs) {
          const order = doc.data();
          if (order.items && order.items.some((item: any) => item.productId === productId)) {
            found = true;
            break;
          }
        }
        
        if (!found) {
          // Check service requests
          const sq = query(collection(db, 'serviceRequests'), where('buyerId', '==', user.uid), where('serviceId', '==', productId));
          const serviceSnaps = await getDocs(sq);
          if (!serviceSnaps.empty) {
            found = true;
          }
        }
        
        setHasPurchased(found);
      } catch (err) {
        console.error('Error checking purchase history', err);
      } finally {
        setIsCheckingPurchase(false);
      }
    }
    checkPurchase();
  }, [user, productId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Vous devez être connecté pour laisser un avis.');
      return;
    }
    if (!comment.trim()) {
      setError('Veuillez écrire un commentaire.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await addReview(rating, comment);
      setComment('');
      setRating(5);
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi de votre avis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
       <div className="h-8 bg-surface rounded w-1/4"></div>
       <div className="h-32 bg-surface rounded w-full"></div>
    </div>;
  }

  const alreadyReviewed = reviews.some(r => r.buyerId === user?.uid);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Summary side */}
        <div className="w-full md:w-1/3 bg-background rounded-2xl border border-border-light p-6 text-center">
            <h3 className="text-xl font-bold text-text-primary mb-2">Note Globale</h3>
            <div className="text-5xl font-black text-text-primary mb-4">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center mb-2">
               {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={cn(
                      "w-6 h-6",
                      star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-border-light fill-border-light"
                    )}
                  />
               ))}
            </div>
            <p className="text-text-secondary text-sm">Sur la base de {reviews.length} avis</p>
        </div>

        {/* Input side */}
        <div className="w-full md:w-2/3">
           {user ? (
              !hasPurchased ? (
                <div className="bg-surface rounded-xl p-6 border border-border-light flex items-center gap-4 text-text-secondary">
                  <AlertCircle className="w-6 h-6 text-warning" />
                  <p>Seuls les acheteurs vérifiés ayant commandé cet article peuvent laisser un avis.</p>
                </div>
              ) : alreadyReviewed ? (
                <div className="bg-surface rounded-xl p-6 border border-border-light flex items-center gap-4 text-text-secondary">
                  <MessageCircle className="w-6 h-6 text-accent" />
                  <p>Vous avez déjà donné votre avis sur ce produit. Merci !</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border-light p-6">
                  <h3 className="text-lg font-bold text-text-primary mb-4">Laisser un avis</h3>
                  
                  {error && (
                    <div className="mb-4 bg-danger/10 text-danger px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Votre note</label>
                    <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <button
                           key={star}
                           type="button"
                           onClick={() => setRating(star)}
                           className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                         >
                           <Star 
                             className={cn(
                               "w-8 h-8",
                               star <= rating ? "text-yellow-400 fill-yellow-400" : "text-border-light fill-border-light"
                             )}
                           />
                         </button>
                       ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Votre commentaire</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="w-full bg-background border border-border-light rounded-xl p-4 text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                      placeholder="Qu'avez-vous pensé de ce produit ?"
                      required
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !comment.trim()}
                    className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Envoi...' : 'Publier mon avis'}
                  </button>
                </form>
              )
           ) : (
             <div className="bg-surface rounded-xl p-6 border border-border-light flex flex-col items-center justify-center text-center space-y-4">
               <p className="text-text-secondary">Vous devez être connecté pour laisser un avis sur ce produit.</p>
               <a href="/auth/login" className="px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-black/90 transition-colors">
                 Se connecter
               </a>
             </div>
           )}
        </div>
      </div>

      {/* Reviews list */}
      <div className="border-t border-border-light pt-8 mt-8">
         <h3 className="text-xl font-bold text-text-primary mb-6">Avis clients ({reviews.length})</h3>
         
         {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-border-light rounded-2xl bg-surface">
              <Star className="h-12 w-12 text-text-tertiary mb-4 opacity-30" />
              <h3 className="text-lg font-bold text-text-primary mb-2">Aucun avis pour l'instant</h3>
              <p className="text-text-secondary">Soyez le premier à partager votre expérience après l'achat !</p>
            </div>
         ) : (
            <div className="space-y-6">
               {reviews.map((review) => (
                  <div key={review.id} className="bg-surface border border-border-light rounded-xl p-6">
                     <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-bold text-black uppercase">
                            {review.author?.email ? review.author.email.charAt(0) : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary text-sm">
                               {review.author?.email ? review.author.email.split('@')[0] : 'Utilisateur'}
                            </p>
                            <p className="text-xs text-text-tertiary">{formatDate(review.createdAt)}</p>
                          </div>
                       </div>
                       <div className="flex">
                         {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={cn(
                                "w-4 h-4",
                                star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-border-light fill-border-light"
                              )}
                            />
                         ))}
                       </div>
                     </div>
                     <p className="text-text-secondary whitespace-pre-wrap">{review.comment}</p>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
}
