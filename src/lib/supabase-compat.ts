import { supabase } from './supabase';

export const db = {};
export const doc = (db: any, collectionName: string, id: string) => {
    return { collectionName, id };
};
export const collection = (db: any, collectionName: string) => {
    return collectionName;
};
export const getDoc = async (docRef: { collectionName: string, id: string }) => {
    if (!supabase) return { exists: () => false, data: () => null };
    let data = null;
    try {
        const res = await supabase.from(docRef.collectionName).select('*').eq('id', docRef.id).single();
        data = res.data;
    } catch(e) {
        console.error("getDoc error:", e);
    }
    if (data) {
        if (docRef.collectionName === 'users' && data.id) {
            data.uid = data.id;
        }
        return { exists: () => true, data: () => data };
    }
    return { exists: () => false, data: () => null };
};
export const setDoc = async (docRef: { collectionName: string, id: string }, data: any, options?: any) => {
    if (!supabase) return;
    const finalData = { ...data, id: docRef.id };
    if (docRef.collectionName === 'users' || docRef.collectionName === 'profiles') {
        let error = null;
        try {
            const res = await supabase.from('profiles').upsert(finalData);
            error = res.error;
        } catch(e) {
            console.error(e);
            error = e;
        }
        if (error) console.error("setDoc error:", error);
    } else {
        let error = null;
        try {
            const res = await supabase.from(docRef.collectionName).upsert(finalData);
            error = res.error;
        } catch(e) {
            console.error(e);
            error = e;
        }
        if (error) console.error("setDoc error:", error);
    }
};
export const updateDoc = async (docRef: { collectionName: string, id: string }, data: any) => {
    if (!supabase) return;
    if (docRef.collectionName === 'users') docRef.collectionName = 'profiles';
    let error = null;
    try {
        const res = await supabase.from(docRef.collectionName).update(data).eq('id', docRef.id);
        error = res.error;
    } catch(e) {
        console.error(e);
        error = e;
    }
    if (error) console.error("updateDoc error:", error);
};
export const addDoc = async (collectionName: string, data: any) => {
    if (!supabase) return { id: 'temp-id' };
    let res = null, error = null;
    try {
        const result = await supabase.from(collectionName).insert(data).select().single();
        res = result.data;
        error = result.error;
    } catch(e) {
        console.error(e);
        error = e;
    }
    if (error) {
        console.error("addDoc error:", error);
        return { id: 'error-id' };
    }
    return { id: res?.id || 'temp-id' };
};
export const deleteDoc = async (docRef: { collectionName: string, id: string }) => {
    if (!supabase) return;
    let error = null;
    try {
        const res = await supabase.from(docRef.collectionName).delete().eq('id', docRef.id);
        error = res.error;
    } catch(e) {
        console.error(e);
        error = e;
    }
    if (error) console.error("deleteDoc error:", error);
};
export const serverTimestamp = () => new Date().toISOString();
export const query = (...args: any[]) => args;
export const where = (...args: any[]) => args;
export const limit = (...args: any[]) => args;
export const orderBy = (...args: any[]) => args;
export const onSnapshot = (q: any, cb: any) => { cb({ docs: [] }); return () => {}; };
export const getDocs = async (q: any) => { return { docs: [], empty: true, size: 0, forEach: () => {} }; };
export const auth = { currentUser: { uid: 'mock-uid' } };
export const signInWithEmailAndPassword = async (...args: any[]) => ({});
export const signInWithPopup = async (...args: any[]) => ({});
export const createUserWithEmailAndPassword = async (...args: any[]) => ({});
export const sendPasswordResetEmail = async (...args: any[]) => {};
export const GoogleAuthProvider = class {};
