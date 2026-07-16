import { create } from 'zustand';

interface UIState {
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  isSearchOpen: false,
  setIsSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
}));
