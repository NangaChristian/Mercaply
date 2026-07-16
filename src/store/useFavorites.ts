import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  favoriteIds: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (id: string) => boolean;
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      addFavorite: (id) => set((state) => {
        if (!state.favoriteIds.includes(id)) {
          return { favoriteIds: [...state.favoriteIds, id] };
        }
        return state;
      }),
      removeFavorite: (id) => set((state) => ({
        favoriteIds: state.favoriteIds.filter(fId => fId !== id)
      })),
      clearFavorites: () => set({ favoriteIds: [] }),
      isFavorite: (id) => get().favoriteIds.includes(id),
    }),
    {
      name: 'mercaply-favorites-storage',
    }
  )
);
