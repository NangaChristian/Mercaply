import { useCategories } from '../../contexts/CategoriesContext';
import React, { useState } from 'react';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import {  CAMEROON_REGIONS } from '../../constants';
import { useServices } from '../../hooks/useServices';
import { cn } from '../../utils/cn';

export function ServicesPage() {
  const { productCategories: PRODUCT_CATEGORIES, serviceCategories: SERVICE_CATEGORIES } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { services, isLoading } = useServices({
    category: selectedCategory,
    region: selectedRegion,
  });

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Services Professionnels</h1>
          <p className="text-text-secondary mt-2">Trouvez des prestataires qualifiés pour vos projets</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface p-4 rounded-2xl border border-border-light mb-8 space-y-4 md:space-y-0 md:flex md:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute text-text-tertiary w-5 h-5 left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        
        <div className="flex gap-4">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-background border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            <option value="">Toutes les catégories</option>
            {SERVICE_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-2.5 bg-background border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            <option value="">Toutes les régions</option>
            {CAMEROON_REGIONS.map(reg => (
              <option key={reg.id} value={reg.id}>{reg.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-surface rounded-2xl border border-border-light p-4 animate-pulse">
              <div className="aspect-video bg-border-light rounded-xl mb-4" />
              <div className="h-6 bg-border-light rounded w-3/4 mb-2" />
              <div className="h-4 bg-border-light rounded w-1/2 mb-4" />
              <div className="h-4 bg-border-light rounded w-full mb-2" />
              <div className="h-4 bg-border-light rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <Link key={service.id} to={`/service/${service.id}`} className="group bg-surface rounded-2xl border border-border-light overflow-hidden hover:border-accent/30 hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="aspect-video relative overflow-hidden bg-background">
                {service.images?.[0] ? (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Briefcase className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {service.priceType === 'starting_at' && (
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-accent to-accent-hover text-white text-xs font-bold px-2 py-1 rounded-lg">
                    À partir de {service.price.toLocaleString('fr-FR')} FCFA
                  </span>
                )}
                {service.priceType === 'fixed' && (
                  <span className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-lg">
                    {service.price.toLocaleString('fr-FR')} FCFA
                  </span>
                )}
                {service.priceType === 'hourly' && (
                  <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    {service.price.toLocaleString('fr-FR')} FCFA / heure
                  </span>
                )}
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-text-tertiary mb-2">
                  <span className="bg-background px-2 py-1 rounded">{SERVICE_CATEGORIES.find(c => c.id === service.category)?.name || service.category}</span>
                </div>
                
                <h3 className="font-bold text-text-primary text-lg mb-2 line-clamp-2">{service.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">{service.description}</p>
                
                <div className="flex items-center justify-between text-xs text-text-tertiary border-t border-border-light pt-4 mt-auto">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{CAMEROON_REGIONS.find(r => r.id === service.region)?.name || service.region}</span>
                  </div>
                  <div className="font-medium text-accent hover:underline cursor-pointer">
                    Contacter
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border-light">
          <Briefcase className="w-12 h-12 text-border-light mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary">Aucun service trouvé</h3>
          <p className="text-text-secondary mt-2">Essayez de modifier vos filtres de recherche.</p>
        </div>
      )}
    </div>
  );
}
