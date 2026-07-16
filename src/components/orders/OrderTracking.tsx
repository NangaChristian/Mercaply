import React from 'react';
import { cn } from '../../utils/cn';
import { Check, Package, Truck, CheckCircle2 } from 'lucide-react';

interface OrderTrackingProps {
  status: string;
}

export function OrderTracking({ status }: OrderTrackingProps) {
  const steps = [
    { id: 'pending', label: 'Commandée', icon: Package },
    { id: 'processing', label: 'En préparation', icon: Package },
    { id: 'shipped', label: 'Expédiée', icon: Truck },
    { id: 'delivered', label: 'Livrée', icon: CheckCircle2 }
  ];

  let currentStepIndex = 0;
  if (status === 'processing') currentStepIndex = 1;
  if (status === 'shipped') currentStepIndex = 2;
  if (status === 'delivered') currentStepIndex = 3;
  if (status === 'cancelled') return <div className="text-danger font-medium text-sm">Commande annulée</div>;

  return (
    <div className="py-4">
      <div className="relative">
        <div className="absolute top-4 left-6 right-6 h-1 bg-border-light -translate-y-1/2 rounded-full z-0"></div>
        <div 
          className="absolute top-4 left-6 h-1 bg-accent -translate-y-1/2 rounded-full z-0 transition-all duration-500"
          style={{ width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 3rem)` }}
        ></div>
        
        <div className="relative z-10 flex justify-between px-2">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white",
                    isCompleted ? "border-accent text-accent" : "border-border-light text-text-tertiary",
                    isCurrent ? "ring-4 ring-accent/20" : ""
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={cn(
                  "text-xs font-medium mt-2",
                  isCompleted ? "text-text-primary" : "text-text-tertiary"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
