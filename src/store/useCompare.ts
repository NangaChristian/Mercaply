import { create } from 'zustand';

interface CompareStore {
  compareItems: any[];
  toggleCompare: (product: any) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  setCompareModalOpen: (isOpen: boolean) => void;
}

export const useCompare = create<CompareStore>((set) => ({
  compareItems: [],
  toggleCompare: (product) => set((state) => {
    const exists = state.compareItems.find(p => p.id === product.id);
    if (exists) {
      return { compareItems: state.compareItems.filter(p => p.id !== product.id) };
    }
    // Limit to 4 items
    if (state.compareItems.length >= 4) {
      return state;
    }
    return { compareItems: [...state.compareItems, product] };
  }),
  removeCompare: (id) => set((state) => ({
    compareItems: state.compareItems.filter(p => p.id !== id)
  })),
  clearCompare: () => set({ compareItems: [] }),
  isCompareModalOpen: false,
  setCompareModalOpen: (isOpen) => set({ isCompareModalOpen: isOpen })
}));
