import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Package, Briefcase, Filter } from 'lucide-react';
import { useUI } from '../../store/useUI';
import { supabase } from '../../lib/supabase';

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useUI();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'products' | 'services'>('all');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim() || !supabase) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        let items: any[] = [];
        const searchTerm = `%${query.trim()}%`;

        if (filterType === 'all' || filterType === 'products') {
          const { data: productsData } = await supabase
            .from('products')
            .select('id, title, category, price, images')
            .or(`title.ilike.${searchTerm},category.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(5);
          
          if (productsData) {
            items = [...items, ...productsData.map(p => ({ ...p, type: 'product' }))];
          }
        }

        if (filterType === 'all' || filterType === 'services') {
          const { data: servicesData } = await supabase
            .from('services')
            .select('id, title, category, price, images')
            .or(`title.ilike.${searchTerm},category.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(5);

          if (servicesData) {
            items = [...items, ...servicesData.map(s => ({ ...s, type: 'service' }))];
          }
        }

        setResults(items);
      } catch (err) {
        console.error('Error fetching search results', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [query, filterType]);

  if (!isSearchOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearchOpen(false);
      navigate(`/${filterType === 'services' ? 'services' : 'products'}?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleResultClick = (result: any) => {
    setIsSearchOpen(false);
    navigate(`/${result.type === 'product' ? 'product' : 'service'}/${result.id}`);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex items-center p-4 border-b border-border-light bg-white shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 flex items-center bg-surface rounded-full px-4 py-2 border border-border-light focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
          <Search className="h-5 w-5 text-text-tertiary mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des produits, services, catégories..."
            className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary text-sm"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="p-1 hover:bg-black/5 rounded-full">
              <X className="h-4 w-4 text-text-tertiary" />
            </button>
          )}
        </form>
        <button
          onClick={() => setIsSearchOpen(false)}
          className="ml-4 p-2 text-text-secondary hover:text-text-primary"
        >
          Annuler
        </button>
      </div>

      <div className="bg-white border-b border-border-light px-4 py-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterType === 'all' ? 'bg-black text-white' : 'bg-surface text-text-secondary hover:bg-border-light'}`}
        >
          Tout
        </button>
        <button
          onClick={() => setFilterType('products')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterType === 'products' ? 'bg-orange-500 text-white' : 'bg-surface text-text-secondary hover:bg-border-light'}`}
        >
          <div className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Produits</div>
        </button>
        <button
          onClick={() => setFilterType('services')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterType === 'services' ? 'bg-purple-500 text-white' : 'bg-surface text-text-secondary hover:bg-border-light'}`}
        >
          <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Services</div>
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {!query.trim() ? (
          <>
            <h3 className="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">Recherches populaires</h3>
            <div className="flex flex-wrap gap-2">
              {['Fruits', 'Électronique', 'Plomberie', 'Ménage', 'Huile'].map(term => (
                <button 
                  key={term}
                  onClick={() => {
                    setQuery(term);
                  }}
                  className="px-4 py-2 bg-surface border border-border-light rounded-full text-sm font-medium hover:border-black transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </>
        ) : isLoading ? (
          <div className="flex justify-center p-8 text-text-secondary">
            Recherche en cours...
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">Résultats ({results.length})</h3>
            <div className="grid gap-3">
              {results.map((result) => (
                <div 
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="flex items-center gap-4 p-3 hover:bg-surface rounded-xl cursor-pointer transition-colors border border-transparent hover:border-border-light"
                >
                  <div className="w-12 h-12 rounded-lg bg-border-light overflow-hidden flex-shrink-0">
                    <img src={result.images?.[0] || 'https://via.placeholder.com/150'} alt={result.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-text-primary truncate">{result.title}</h4>
                      {result.type === 'product' ? (
                        <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Produit</span>
                      ) : (
                        <span className="bg-purple-500/10 text-purple-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Service</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate">{result.category}</p>
                  </div>
                  <div className="font-bold text-accent whitespace-nowrap">
                    {result.price.toLocaleString()} CFA
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-8 text-text-secondary">
            Aucun résultat trouvé pour "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
