import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../store/useAuth';

export interface ReviewWithAuthor {
  id: string;
  productId: string;
  buyerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  author?: {
    email: string;
  };
}

export function useReviews(productId: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (!productId || !supabase) {
      setIsLoading(false);
      return;
    }

    const fetchReviews = async () => {
      // Fetch reviews
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('productId', productId)
        .order('createdAt', { ascending: false });

      if (!error && reviewsData) {
        // Fetch authors for each review
        const reviewsWithAuthors = await Promise.all(reviewsData.map(async (review) => {
           let author = { email: 'Utilisateur' };
           if (review.buyerId) {
             const { data: profile } = await supabase.from('profiles').select('*').eq('id', review.buyerId).single();
             if (profile && profile.email) {
               author.email = profile.email;
             }
           }
           return { ...review, author } as ReviewWithAuthor;
        }));
        setReviews(reviewsWithAuthors);
        
        if (reviewsWithAuthors.length > 0) {
           const avg = reviewsWithAuthors.reduce((acc, r) => acc + r.rating, 0) / reviewsWithAuthors.length;
           setAverageRating(avg);
        } else {
           setAverageRating(0);
        }
      }
      setIsLoading(false);
    };

    fetchReviews();
  }, [productId]);

  const addReview = async (rating: number, comment: string) => {
    if (!user || !supabase) return;

    const newReview = {
      productId,
      buyerId: user.uid,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('reviews').insert(newReview).select().single();
    
    if (!error && data) {
       const author = { email: user.email || 'Utilisateur' };
       const reviewWithAuthor = { ...data, author } as ReviewWithAuthor;
       
       const newReviews = [reviewWithAuthor, ...reviews];
       setReviews(newReviews);
       
       const avg = newReviews.reduce((acc, r) => acc + r.rating, 0) / newReviews.length;
       setAverageRating(avg);
    } else {
       throw new Error("Could not add review");
    }
  };

  return { reviews, isLoading, addReview, averageRating };
}
