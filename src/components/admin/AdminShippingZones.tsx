import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MapPin, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export interface ShippingZone {
  id: string;
  name: string;
  cost: number;
  estimatedDays: string;
}

export function AdminShippingZones() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ShippingZone>>({});

  useEffect(() => {
    if (!supabase) return;
    const fetchZones = async () => {
      const { data } = await supabase.from('shipping_zones').select('*').order('name', { ascending: true });
      if (data) setZones(data);
    };
    fetchZones();

    const channel = supabase.channel('shipping_zones_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipping_zones' }, fetchZones)
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const handleAdd = async () => {
    try {
      if (!supabase) return;
      await supabase.from('shipping_zones').insert({
        name: 'Nouvelle Zone',
        cost: 0,
        estimatedDays: '1-2 jours'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      if (!supabase) return;
      await supabase.from('shipping_zones').update({
        name: editForm.name,
        cost: Number(editForm.cost),
        estimatedDays: editForm.estimatedDays
      }).eq('id', id);
      setIsEditing(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous supprimer cette zone de livraison ?')) {
      try {
        if (!supabase) return;
        await supabase.from('shipping_zones').delete().eq('id', id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-green-500" />
          <h2 className="text-lg font-bold text-text-primary">Zones de Livraison (Cameroun)</h2>
        </div>
        <Button onClick={handleAdd} size="sm" className="flex items-center gap-2">
          <Plus size={16} /> Ajouter
        </Button>
      </div>

      <div className="space-y-4">
        {zones.length === 0 ? (
          <p className="text-text-secondary text-sm">Aucune zone configurée.</p>
        ) : (
          <div className="divide-y divide-border-light border border-border-light rounded-lg overflow-hidden">
            {zones.map((zone) => (
              <div key={zone.id} className="p-4 flex items-center justify-between bg-surface">
                {isEditing === zone.id ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 mr-4">
                    <Input 
                      label="Nom de la zone (ex: Yaoundé)"
                      value={editForm.name || ''} 
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    <Input 
                      label="Frais (FCFA)"
                      type="number"
                      value={editForm.cost || 0} 
                      onChange={(e) => setEditForm({ ...editForm, cost: Number(e.target.value) })}
                    />
                    <Input 
                      label="Délai estimé"
                      value={editForm.estimatedDays || ''} 
                      onChange={(e) => setEditForm({ ...editForm, estimatedDays: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 mr-4">
                    <div>
                      <p className="text-xs text-text-tertiary">Zone</p>
                      <p className="font-medium text-text-primary">{zone.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">Frais</p>
                      <p className="font-medium text-text-primary">{zone.cost.toLocaleString()} FCFA</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">Délai estimé</p>
                      <p className="font-medium text-text-primary">{zone.estimatedDays}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {isEditing === zone.id ? (
                    <>
                      <button onClick={() => handleUpdate(zone.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Save size={18} />
                      </button>
                      <button onClick={() => setIsEditing(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setIsEditing(zone.id); setEditForm(zone); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(zone.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
