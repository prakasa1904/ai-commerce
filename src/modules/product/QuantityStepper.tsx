import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

const QuantityStepper = ({ quantity, onDecrement, onIncrement }: QuantityStepperProps) => (
  <div className="flex items-center gap-2 rounded-xl bg-wheat/60 border border-wheat/40 p-1.5 shadow-sm">
    <button
      type="button"
      aria-label="Decrease quantity"
      onClick={onDecrement}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-forest transition-colors hover:bg-forest/8"
    >
      <Minus className="h-4 w-4" />
    </button>
    <span
      id="qty"
      className="w-7 text-center tabular-nums font-display font-black text-forest text-sm"
      aria-live="polite"
    >
      {quantity}
    </span>
    <button
      type="button"
      aria-label="Increase quantity"
      onClick={onIncrement}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-forest transition-colors hover:bg-forest/8"
    >
      <Plus className="h-4 w-4" />
    </button>
  </div>
);

export default QuantityStepper;