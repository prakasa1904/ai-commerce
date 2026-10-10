import React from 'react';
import { Leaf } from 'lucide-react';
import { cn } from '../ui/utils';

interface WaxSealProps {
  className?: string;
}

const WaxSeal: React.FC<WaxSealProps> = ({ className }) => (
  <span aria-label="Farm Marketplace wax seal" className={cn('relative', className)}>
    <span aria-hidden="true" className="block h-8 w-8 rounded-full bg-honey shadow-md rotate-6" />
    <span className="absolute inset-0 flex items-center justify-center">
      <Leaf className="h-5 w-5 text-forest/85" aria-hidden="true" />
    </span>
  </span>
);

export default WaxSeal;