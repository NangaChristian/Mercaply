import { useCategories } from '../../contexts/CategoriesContext';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard, ProductCardSkeleton } from '../../components/product/ProductCard';
import {  CAMEROON_REGIONS } from '../../constants';
import { Filter, LayoutGrid, List, ChevronDown, X, SlidersHorizontal, SearchX } from 'lucide-react';
import { cn } from '../../utils/cn';

export function ProductsPage() {
  const { productCategories: PRODUCT_CATEGORIES, serviceCategories: SERVICE_CATEGORIES } = useCategories();

  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minOrder, setMinOrder] = useState<number>(1);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch products
  const { products, isLoading } = useProducts({
    category: selectedCategory || undefined,
    // Note: We'll do some client-side filtering for complex queries to avoid needing many composite indexes
  });

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    const currentQuery = searchParams.get('q');
    if (currentQuery) {
      const lowerQuery = currentQuery.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(lowerQuery) || 
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.category?.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedRegions.length > 0) {
      result = result.filter(p => selectedRegions.includes(p.region));
    }
    if (minPrice) {
      result = result.filter(p => p.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      result = result.filter(p => p.price <= parseInt(maxPrice));
    }
    if (minOrder > 1) {
      result = result.filter(p => p.minOrder <= minOrder); // If buyer wants max minOrder? Actually usually it's "I want to buy at least X" or "I can only buy up to X". Let's assume it filters out products with minOrder > what user wants.
    }
    if (inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }
    // Future: implement ratings filter when db structure is updated

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      // relevance and rating can be default or mock
    }

    return result;
  }, [products, selectedRegions, minPrice, maxPrice, minOrder, inStockOnly, sortBy]);

  const activeFiltersCount = (selectedCategory ? 1 : 0) + selectedRegions.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (verifiedOnly ? 1 : 0) + (inStockOnly ? 1 : 0) + (minRating > 0 ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedRegions([]);
    setMinPrice('');
    setMaxPrice('');
    setMinOrder(1);
    setMinRating(0);
    setVerifiedOnly(false);
    setInStockOnly(false);
  };

  const toggleRegion = (regionId: string) => {
    setSelectedRegions(prev => 
      prev.includes(regionId) ? prev.filter(id => id !== regionId) : [...prev, regionId]
    );
  };

  const FiltersContent = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">Filtres</h2>
        {activeFiltersCount > 0 && (
          <button onClick={clearFilters} className="text-sm text-accent hover:underline">
            Effacer tout
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Catégorie</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="radio" 
              name="category"
              checked={selectedCategory === ''}
              onChange={() => setSelectedCategory('')}
              className="w-4 h-4 text-accent border-border-light focus:ring-accent"
            />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Toutes les catégories</span>
          </label>
          {PRODUCT_CATEGORIES.map(cat => (
            <label key={cat.id} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="radio" 
                name="category"
                checked={selectedCategory === cat.id}
                onChange={() => setSelectedCategory(cat.id)}
                className="w-4 h-4 text-accent border-border-light focus:ring-accent"
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Region */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Région</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {CAMEROON_REGIONS.map(region => (
            <label key={region.id} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedRegions.includes(region.id)}
                onChange={() => toggleRegion(region.id)}
                className="w-4 h-4 text-accent border-border-light rounded focus:ring-accent"
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{region.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Prix (FCFA)</h3>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            placeholder="Min" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border-light rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <span className="text-text-tertiary">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border-light rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Vendeurs vérifiés</span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
          </div>
        </label>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">En stock</span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb could go here */}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-background rounded-2xl border border-border-light p-6">
            <FiltersContent />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Results Header */}
          <div className="bg-background rounded-2xl border border-border-light p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-y-3 w-full sm:w-auto">
              <div className="flex items-center flex-wrap gap-2 mr-0 sm:mr-4">
                <h1 className="text-lg font-bold text-text-primary leading-tight">
                  {selectedCategory ? PRODUCT_CATEGORIES.find(c => c.id === selectedCategory)?.name : 'Tous les produits'}
                </h1>
                <span className="text-sm text-text-secondary bg-surface px-2.5 py-1 rounded-full whitespace-nowrap">
                  {filteredProducts.length} résultats
                </span>
              </div>
              
              {/* Mobile Filter Button */}
              <button 
                className="md:hidden flex items-center space-x-2 text-sm font-medium text-text-primary bg-surface border border-border-light px-3 py-1.5 rounded-lg whitespace-nowrap"
                onClick={() => setIsMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>
                )}
              </button>
            </div>

            <div className="flex flex-row items-center justify-between w-full sm:w-auto gap-4">
              <div className="flex items-center flex-1 sm:flex-none w-full sm:w-auto">
                <span className="text-sm text-text-secondary hidden sm:inline mr-2">Trier par:</span>
                <div className="relative w-full sm:w-auto">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-surface border border-border-light text-sm text-text-primary rounded-lg focus:ring-1 focus:ring-accent py-2 pl-3 pr-8 w-full sm:w-auto appearance-none"
                  >
                    <option value="relevance">Pertinence</option>
                    <option value="newest">Plus récent</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="price_desc">Prix décroissant</option>
                    <option value="rating">Mieux noté</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                </div>
              </div>

              <div className="hidden sm:flex items-center bg-surface rounded-lg p-1 border border-border-light flex-shrink-0">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-background shadow-sm text-text-primary border border-border-light" : "text-text-tertiary hover:text-text-secondary")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-background shadow-sm text-text-primary border border-border-light" : "text-text-tertiary hover:text-text-secondary")}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-surface text-text-primary border border-border-light">
                  Catégorie: {PRODUCT_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('')} className="ml-2 text-text-tertiary hover:text-text-primary"><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedRegions.map(regionId => (
                <span key={regionId} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-surface text-text-primary border border-border-light">
                  {CAMEROON_REGIONS.find(r => r.id === regionId)?.name}
                  <button onClick={() => toggleRegion(regionId)} className="ml-2 text-text-tertiary hover:text-text-primary"><X className="h-3 w-3" /></button>
                </span>
              ))}
              {/* Add other tags as needed */}
              <button onClick={clearFilters} className="text-sm text-accent hover:underline ml-2">Effacer tout</button>
            </div>
          )}

          {/* Product Grid/List */}
          {isLoading ? (
            <div className={cn(
              "grid gap-4 md:gap-6",
              viewMode === 'grid' ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            )}>
              {Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className={cn(
                "grid gap-4 md:gap-6",
                viewMode === 'grid' ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              )}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} view={viewMode} />
                ))}
              </div>

              {/* Pagination (Mock) */}
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg border border-border-light text-text-secondary hover:bg-surface disabled:opacity-50">Précédent</button>
                  <button className="w-10 h-10 rounded-lg bg-accent text-white font-medium">1</button>
                  <button className="w-10 h-10 rounded-lg border border-border-light text-text-secondary hover:bg-surface font-medium">2</button>
                  <button className="w-10 h-10 rounded-lg border border-border-light text-text-secondary hover:bg-surface font-medium">3</button>
                  <span className="text-text-tertiary px-2">...</span>
                  <button className="p-2 rounded-lg border border-border-light text-text-secondary hover:bg-surface">Suivant</button>
                </nav>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-background rounded-2xl border border-border-light text-center px-4">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
                <SearchX className="h-10 w-10 text-text-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Aucun produit trouvé</h3>
              <p className="text-text-secondary max-w-md mb-8">
                Nous n'avons trouvé aucun produit correspondant à vos critères de recherche. Essayez de modifier vos filtres.
              </p>
              <button onClick={clearFilters} className="px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors">
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-[70] flex flex-col justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="relative w-full h-[85vh] bg-background rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between p-4 border-b border-border-light">
              <h2 className="text-lg font-bold text-text-primary">Filtres</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-text-secondary hover:bg-surface rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <FiltersContent />
            </div>
            <div className="p-4 pb-8 sm:pb-4 border-t border-border-light flex space-x-4 bg-background">
              <button onClick={clearFilters} className="flex-1 py-3 px-4 border border-border-light rounded-xl font-medium text-text-primary hover:bg-surface">
                Effacer
              </button>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="flex-1 py-3 px-4 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover">
                Afficher {filteredProducts.length}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
