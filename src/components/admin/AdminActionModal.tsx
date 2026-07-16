import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AlertCircle, X } from 'lucide-react';

interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  actionLabel: string;
  isDestructive?: boolean;
}

export function AdminActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionLabel,
  isDestructive = true
}: AdminActionModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${isDestructive ? 'bg-danger/10 text-danger' : 'bg-orange-500/10 text-orange-500'}`}>
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          </div>
          
          <p className="text-text-secondary mb-6">{description}</p>
          
          <div className="space-y-4">
            <Input
              label="Raison de l'action"
              placeholder="Veuillez préciser la raison..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                variant={isDestructive ? 'danger' : 'primary'}
                onClick={() => {
                  onConfirm(reason);
                  setReason('');
                }}
                disabled={!reason.trim()}
              >
                {actionLabel}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
