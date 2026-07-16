import { Heart, Trash2, Share2, SearchX } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import { useFavorites } from '../../store/useFavorites';
import { Link } from 'react-router-dom';

export function BuyerFavoritesPage() {
  const { products, isLoading } = useProducts({});
  const { favoriteIds, removeFavorite, clearFavorites } = useFavorites();

  const favorites = products.filter(p => favoriteIds.includes(p.id));

  const handleRemove = (id: string) => {
    removeFavorite(id);
  };

  const handleClearAll = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tous vos favoris ?')) {
      clearFavorites();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center">
            <Heart className="h-6 w-6 mr-2 text-danger fill-danger" />
            Mes favoris
          </h1>
          <p className="text-sm text-text-secondary mt-1">{favorites.length} article{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}</p>
        </div>
        
        {favorites.length > 0 && (
          <div className="flex items-center gap-3">
            <button className="flex items-center px-4 py-2 bg-surface border border-border-light text-text-primary text-sm font-medium rounded-lg hover:bg-border-light transition-colors">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </button>
            <button 
              onClick={handleClearAll}
              className="flex items-center px-4 py-2 bg-danger/10 text-danger text-sm font-medium rounded-lg hover:bg-danger/20 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tout supprimer
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-surface rounded-2xl aspect-[3/4]"></div>
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {favorites.map(product => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(product.id);
                }}
                className="absolute top-2 right-2 p-2 bg-background/90 backdrop-blur-sm rounded-full text-text-secondary hover:text-danger hover:bg-background transition-colors z-20 shadow-sm opacity-0 group-hover:opacity-100"
                title="Supprimer des favoris"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-background rounded-2xl border border-border-light text-center px-4">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
            <Heart className="h-10 w-10 text-text-tertiary" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Votre liste de favoris est vide</h3>
          <p className="text-text-secondary max-w-md mb-8">
            Vous n'avez pas encore ajouté d'articles à vos favoris. Explorez notre catalogue pour trouver ce que vous cherchez.
          </p>
          <Link to="/products" className="px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors">
            Explorer les produits
          </Link>
        </div>
      )}
    </div>
  );
}
