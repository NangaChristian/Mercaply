import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { useShippingZones } from '../../hooks/useShippingZones';

export function ShippingEstimator() {
  const { zones, isLoading } = useShippingZones();
  const [selectedZone, setSelectedZone] = useState<string>('');

  if (isLoading) {
    return (
      <div className="mt-6 border border-border-light rounded-lg p-4 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const selectedZoneData = zones.find(z => z.id === selectedZone);

  return (
    <div className="mt-6 border border-border-light rounded-lg p-4 bg-surface">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-5 w-5 text-accent" />
        <h3 className="font-bold text-text-primary text-sm">Estimer la livraison</h3>
      </div>
      
      {zones.length > 0 ? (
        <div className="space-y-3">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full bg-surface-hover border border-border-light text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block p-2.5"
          >
            <option value="">Sélectionnez votre zone (Cameroun)</option>
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>

          {selectedZoneData && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {selectedZoneData.cost === 0 ? 'Livraison gratuite' : `${selectedZoneData.cost.toLocaleString()} FCFA`}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">Délai: {selectedZoneData.estimatedDays}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">Aucune zone de livraison n'est configurée pour le moment.</p>
      )}
    </div>
  );
}
