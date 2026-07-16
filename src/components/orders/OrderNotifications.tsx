// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../store/useAuth';
import { useToast } from '../../store/useToast';

export function OrderNotifications() {
  const { firebaseUser: user } = useAuth();
  const { addToast } = useToast();
  const isFirstRun = useRef(true);
  const previousStatusMap = useRef<Record<string, string>>({});
  
  useEffect(() => {
    if (!user) return;
    
    // Listen for buyer orders
    const buyerQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribeBuyer = onSnapshot(buyerQuery, (snapshot) => {
      if (isFirstRun.current) {
        snapshot.docs.forEach(doc => {
          previousStatusMap.current[doc.id] = doc.data().status;
        });
      } else {
        snapshot.docChanges().forEach(change => {
          const data = change.doc.data();
          if (change.type === 'modified') {
            const oldStatus = previousStatusMap.current[change.doc.id];
            const newStatus = data.status;
            if (oldStatus !== newStatus) {
               addToast('info', `Le statut de votre commande #${change.doc.id.substring(0, 6)} est passé à : ${newStatus}`);
            }
          }
          previousStatusMap.current[change.doc.id] = data.status;
        });
      }
    }, (error) => { console.log('Listener cancelled (likely due to logout)'); });

    // Listen for seller orders
    const sellerQuery = query(collection(db, 'orders'), where('sellerId', '==', user.uid));
    const unsubscribeSeller = onSnapshot(sellerQuery, (snapshot) => {
      if (isFirstRun.current) {
        snapshot.docs.forEach(doc => {
          previousStatusMap.current[doc.id] = doc.data().status;
        });
      } else {
        snapshot.docChanges().forEach(change => {
          const data = change.doc.data();
          if (change.type === 'added') {
            addToast('success', `Nouvelle commande reçue ! #${change.doc.id.substring(0, 6)}`);
          }
          previousStatusMap.current[change.doc.id] = data.status;
        });
      }
    }, (error) => { console.log('Listener cancelled (likely due to logout)'); });

    // Give a short delay before marking first run as complete to ignore initial loads
    const timer = setTimeout(() => {
      isFirstRun.current = false;
    }, 1500);

    return () => {
      unsubscribeBuyer();
      unsubscribeSeller();
      clearTimeout(timer);
    };
  }, [user]);

  return null;
}
