import { create } from 'zustand';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User as AppUser } from '../types';

interface AuthState {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  setUser: (user: AppUser | null) => void;
  setSupabaseUser: (user: SupabaseUser | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  supabaseUser: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSupabaseUser: (supabaseUser) => set({ supabaseUser }),
  setLoading: (isLoading) => set({ isLoading }),
}));
