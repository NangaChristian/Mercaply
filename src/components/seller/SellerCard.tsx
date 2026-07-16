import { Link } from 'react-router-dom';
import { Star, ShieldCheck, MapPin, Package, Store as StoreIcon } from 'lucide-react';
import { Store } from '../../types';
import { cn } from '../../utils/cn';
import { ComponentPropsWithoutRef } from 'react';

interface SellerCardProps extends Omit<ComponentPropsWithoutRef<typeof Link>, 'to'> {
  seller: Store;
  className?: string;
}

export function SellerCard({ seller, className, ...props }: SellerCardProps) {
  return (
    <Link 
      to={`/store/${seller.id}`}
      className={cn(
        "group flex flex-col bg-background rounded-2xl border border-border-light overflow-hidden hover:shadow-md transition-all duration-300 min-w-[280px] w-[280px]",
        className
      )}
      {...props}
    >
      {/* Banner */}
      <div className="h-24 bg-surface relative overflow-hidden">
        {seller.banner ? (
          <img 
            src={seller.banner} 
            alt="Banner" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-surface to-surface-2" />
        )}
      </div>

      {/* Content */}
      <div className="p-5 relative pt-12 flex flex-col flex-1">
        {/* Logo */}
        <div className="absolute -top-8 left-5 h-16 w-16 bg-background rounded-xl p-1 shadow-sm border border-border-light">
          <div className="w-full h-full rounded-lg bg-surface flex items-center justify-center overflow-hidden">
            {seller.logo ? (
              <img 
                src={seller.logo} 
                alt={seller.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <StoreIcon className="h-6 w-6 text-text-tertiary" />
            )}
          </div>
        </div>

        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-text-primary truncate pr-2 group-hover:text-accent transition-colors">
            {seller.name}
          </h3>
          {seller.isVerified && (
            <ShieldCheck className="h-5 w-5 text-success flex-shrink-0" />
          )}
        </div>

        <p className="text-xs text-text-secondary mb-3 truncate">
          {seller.categories?.[0] || 'Général'}
        </p>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-text-secondary">
              <Star className="h-4 w-4 text-warning fill-warning mr-1" />
              <span className="font-medium text-text-primary mr-1">{seller.rating.toFixed(1)}</span>
              <span className="text-xs">({seller.totalSales})</span>
            </div>
            <div className="flex items-center text-text-secondary text-xs">
              <Package className="h-3.5 w-3.5 mr-1" />
              <span>Produits</span>
            </div>
          </div>
          
          <div className="flex items-center text-xs text-text-tertiary pt-2 border-t border-border-light">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span className="truncate">{seller.region}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SellerCardSkeleton() {
  return (
    <div className="flex flex-col bg-background rounded-2xl border border-border-light overflow-hidden animate-pulse min-w-[280px] w-[280px]">
      <div className="h-24 bg-surface" />
      <div className="p-5 relative pt-12">
        <div className="absolute -top-8 left-5 h-16 w-16 bg-surface rounded-xl border-4 border-background" />
        <div className="h-5 bg-surface rounded w-3/4 mb-2" />
        <div className="h-3 bg-surface rounded w-1/2 mb-4" />
        <div className="space-y-2 pt-2 border-t border-border-light">
          <div className="flex justify-between">
            <div className="h-4 bg-surface rounded w-1/3" />
            <div className="h-4 bg-surface rounded w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
