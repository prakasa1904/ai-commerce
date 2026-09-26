import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  label?: string;
}

const QuantityStepper = ({ quantity, onDecrement, onIncrement, label }: QuantityStepperProps) => {
  const hiddenInputId = `qty-${label ?? ''}`;

  return (
    <div className="grid min-w-0 flex-1">
      {label && (
        <label htmlFor={hiddenInputId} className="text-[0.62rem] font-display font-black uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </label>
      )}
      <div className="mt-1.5 flex items-center rounded-lg bg-wheat/70 border border-wheat/40">
        <span
          aria-hidden="true"
          className="relative h-8 w-px -rotate-12 bg-forest/25"
        />
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
          onClick={onDecrement}
          className="flex h-10 w-10 items-center justify-center rounded-l-lg border-l border-wheat/50 bg-wheat/80 text-forest transition-colors hover:bg-forest/8 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span
          id={hiddenInputId}
          className="w-9 shrink-0 tabular-nums font-display font-black text-lg text-forest"
          aria-live="polite"
        >
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={onIncrement}
          className="flex h-10 w-10 items-center justify-center rounded-r-lg border-r border-wheat/50 bg-wheat/80 text-forest transition-colors hover:bg-forest/8 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default QuantityStepper;