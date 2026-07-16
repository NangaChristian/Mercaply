import { Link } from 'react-router-dom';
import { Star, MapPin, ShoppingCart, Heart, ShieldCheck, MessageCircle, Store as StoreIcon } from 'lucide-react';
import { Product } from '../../types';
import { cn } from '../../utils/cn';
import React, { ComponentPropsWithoutRef } from 'react';
import { useFavorites } from '../../store/useFavorites';
import { useCompare } from '../../store/useCompare';
import { BarChart2 } from 'lucide-react';

interface ProductCardProps extends Omit<ComponentPropsWithoutRef<typeof Link>, 'to'> {
  product: Product;
  view?: 'grid' | 'list';
  className?: string;
}

export function ProductCard({ product, view = 'grid', className, ...props }: ProductCardProps) {
  const { isFavorite: checkIsFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFav = checkIsFavorite(product.id);
  const { compareItems, toggleCompare, setCompareModalOpen } = useCompare();
  const isComparing = compareItems.some(p => p.id === product.id);
  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(product);
    if (!isComparing) {
      // Optional: auto open compare modal or just let them know
      // setCompareModalOpen(true);
    }
  };

  // Check if product is new (less than 7 days old)
  const isNew = () => {
    if (!product.createdAt) return false;
    const createdDate = new Date(product.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate > sevenDaysAgo;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFav) {
      removeFavorite(product.id);
    } else {
      addFavorite(product.id);
    }
  };

  if (view === 'list') {
    // ... list view
    return (
      <Link 
        to={`/product/${product.id}`}
        className={cn(
          "group flex flex-col sm:flex-row bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-md transition-all duration-300",
          className
        )}
        {...props}
      >
        {/* ... (existing list code) ... */}
        <div className="relative w-full sm:w-[200px] h-[200px] sm:h-auto bg-surface overflow-hidden flex-shrink-0">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <img 
              src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400&h=400`} 
              alt="Fallback product" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" 
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-text-primary line-clamp-2 group-hover:text-accent transition-colors pr-4">
              {product.title}
            </h3>
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-xl font-bold text-text-primary">
                {product.price.toLocaleString('fr-FR')} <span className="text-sm font-normal text-text-secondary">FCFA</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Exact UI matching Grid Card
  return (
    <Link 
      to={`/product/${product.id}`}
      className={cn(
        "group flex flex-col bg-white rounded-3xl p-4 hover:shadow-xl transition-all duration-300 border border-border-light relative hover:-translate-y-1 block",
        className
      )}
      {...props}
    >
      {/* Top badges */}
      <div className="flex justify-between items-start mb-4 z-10 relative">
         <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            Sale
         </span>
         <button 
           onClick={handleFavoriteClick}
           className="text-text-tertiary hover:text-danger transition-colors p-1"
         >
           <Heart className={cn("h-5 w-5", isFav && "fill-danger text-danger")} />
         </button>
      </div>

      {/* Image container */}
      <div className="relative aspect-square mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="w-[80%] h-[80%] object-contain drop-shadow-sm mix-blend-multiply"
            referrerPolicy="no-referrer"
          />
        ) : (
          <img 
            src={`https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400&h=400`} 
            alt="Fallback shoe" 
            className="w-[80%] h-[80%] object-contain drop-shadow-sm mix-blend-multiply"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 relative z-10">
        <span className="text-[11px] text-text-tertiary font-medium mb-1 uppercase tracking-wider">
           {product.category || 'Category'}
        </span>
        <h3 className="text-sm font-bold text-text-primary line-clamp-2 mb-2 group-hover:text-black/70 transition-colors leading-snug" title={product.title}>
          {product.title}
        </h3>
        
        <div className="flex items-center space-x-1 mb-3">
          {Array(5).fill(0).map((_, i) => (
             <Star key={i} className={cn("h-3 w-3", "text-border-light fill-border-light")} />
          ))}
          <span className="text-[10px] text-text-tertiary ml-1">(0 avis)</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-text-primary">
              ${(product.price).toLocaleString('en-US')}
            </span>
            {product.price > 100000 && (
              <span className="text-xs text-text-tertiary line-through font-medium">
                ${(product.price * 1.15).toLocaleString('en-US')}
              </span>
            )}
          </div>
          
          {/* Add to cart icon */}
          <button 
            className="h-10 w-10 bg-[#FFF5F5] border border-[#FFE8E8] text-danger rounded-xl flex items-center justify-center hover:bg-danger hover:text-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // Add to cart logic here
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-3xl p-4 border border-border-light overflow-hidden animate-pulse min-h-[300px]">
      <div className="flex justify-between mb-4">
         <div className="w-10 h-4 bg-surface-2 rounded"></div>
         <div className="w-5 h-5 bg-surface-2 rounded-full"></div>
      </div>
      <div className="aspect-square bg-surface-2 rounded-2xl mb-6 w-[80%] mx-auto" />
      <div className="space-y-3">
        <div className="h-3 bg-surface-2 rounded w-1/3" />
        <div className="h-4 bg-surface-2 rounded w-full" />
        <div className="h-4 bg-surface-2 rounded w-2/3" />
        <div className="flex justify-between items-end pt-4">
           <div className="space-y-2">
             <div className="h-5 bg-surface-2 rounded w-16" />
             <div className="h-3 bg-surface-2 rounded w-12" />
           </div>
           <div className="h-10 w-10 bg-surface-2 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
